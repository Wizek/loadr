di.module('modules', ['utils', 'memCache'])

.factory('concatSources', function() {
  return function concatSources (str) {
    return str.join('\n\n;;\n\n')
  }
})

.factory('getWithDeps', function(concatSources, resolve, reduce, q, _, nameParser, cachedGetFileFor) {
  return function getWithDeps (packageList) {
    return resolve(packageList)
      .then(reduce)
      .then(function(v) {
        return q.all(_.map(v, cachedGetFileFor))
      })
      .then(concatSources)
  }
})

.factory('resolveSync', function(dependenciesOfSync, _) {
  return function resolveSync (depList) {
    if (!depList.length) {
      return []
    }
    var t = _.map(depList, function(v) {
      return [resolveSync(dependenciesOfSync(v)), v]
    })
    return _.flatten(t)
  }
})

.factory('readFile', function(fs, q, logFactory) {
  var console = logFactory('readFile')
  console.log('init')
  return function readFile (path) {
    // console.log(new Error().stack)
    var d = q.defer()
    console.log('path:', path)
    fs.readFile(path, 'utf8', function(err, val) {
      // console.log('cb',arguments)
      if (err) {
        console.warn(err)
        d.reject(err)
      } else {
        // console.log(val)
        d.resolve(val)
      }
    })
    return d.promise
  }
})

.factory('readdir', function(fs, q, logFactory) {
  var console = logFactory('readdir')
  console.log('init')
  return function readdir (path) {
    var d = q.defer()
    console.log('path:', path)
    fs.readdir(path, function(err, val) {
      // console.log('cb',arguments)
      if (err) {
        console.warn(err)
        d.reject(err)
      } else {
        // console.log(val)
        d.resolve(val)
      }
    })
    return d.promise
  }
})

.factory('scriptTagSeparator', function(_) {
  return function scriptTagSeparator (str) {
    var list = str.split(/[\s,]+/)
    list = _.filter(list, function(v) {
      return v != ''
    })
    // var list2 = _.map(list, function(v) {
    //   return {name:v}
    // })
    return list
  }
})

.factory('fs', function() {
  return require('fs')
})

.value('protocolRxs',
  { http         : /^https?:\/\//
  , local        : /^\w[.\/\w]*$/
  , github       : /^github:\/\/([^\/]+)\/([^\/]+)\/(.*)/
  , githubSloppy : /^github:\/\/([^\/]+)\/([^\/]+)$/
  , relative     : /^\.{1,2}\//
  }
)

.factory('githubProtocolRx', function(protocolRxs) { return protocolRxs.github })

.factory('protocolOf', function(protocolRxs) {
  return function protocolOf (name) {
    for (var key in protocolRxs) if (protocolRxs.hasOwnProperty(key)) {
      if (name.match(protocolRxs[key])) {
        return key
      }
    }
    throw new Error('Bogous protocol')
  }
})

.factory('nameParser', function(logFactory, protocolOf, githubProtocolRx) {
  var console = logFactory('nameParser')
  console.log('init')

  return function nameParser (name) {
    var protocol      = protocolOf(name)
    var isDirectory   = null
    var url           = null
    var path          = null
    var github        = null

    console.log({name: name, protocol: protocol})

    if (protocol == 'local') {
      isDirectory = !!name.match(/\/$/)
      path = isDirectory
        ? 'packages/'+name
        : 'packages/'+name+'.js'
    }

    if (protocol == 'http') {
      url = name
      path = 'remote_cache/' + name.replace(/[\/:]/g,'-')
    }

    if (protocol == 'github') {
      var match = name.match(githubProtocolRx)
      github =
        { user: match[1]
        , repo: match[2]
        , path: match[3]
        }
      var replaceStr = 'https://raw.github.com/$1/$2/master/$3'
      url = name.replace(githubProtocolRx, replaceStr)
      if (!github.path) {
        url += (github.path = 'index.js')
      }
    }

    var o =
      { name:           name
      , path:           path
      , isDirectory:    isDirectory
      , url:            url
      , protocol:       protocol
      , github:         github
      }
    return o
  }
})

.factory('sourceParser', function() {
  return function(str) {
    var list = []
    str.replace(/(["'])require (.*)\1/gi, function(match, $1, $2) {
      list.push($2)
    })

    return list
  }
})

.factory('hereDoc', function(_) {
  return function hereDoc(fn) {
    function removeFnLines (str) {
      return _(str.split('\n')).chain().initial().rest().value().join('\n')
    }
    function normalizeIndentation (str) {
      var m = str.match(/^(\s*)/)[0]
      return str.replace(new RegExp('^' + m, 'mg'), '')
    }
    return normalizeIndentation(removeFnLines(fn.toString()))
  }
})

.factory('transc', function() {
  return function() {
    console.log.apply(console, arguments)
    return arguments[arguments.length - 1]
  }
})

.factory('dTreeToHumanReadable', function(_, walkTreeFactory) {
  return walkTreeFactory(function(v, recurse) {
    var o = {}
    o[v.name] = recurse(v.deps)
    return o
  })
})

.factory('dTreeToReducedList', function(walkTreeFactory, _) {
  var xxxxx =  walkTreeFactory(function(v, recurse) {
    return [recurse(v.deps), v.name]
  })
  return function(list) {
    return _.uniq(_.flatten(xxxxx(list)))
  }
})

.factory('walkTreeFactory', function(_) {
  return function walkTreeFactory (fun) {
    return function walkTree (treeList) {
      if (!treeList.length) {
        return []
      }

      var out = _.map(treeList, function(v) {
        return fun(v, walkTree)
      })
      return out
    }
  }
})

.factory('dependencyTreeOf', function(dependenciesOf, q, _) {
  return function dependencyTreeOf (list, context) {
    if (!list.length) {
      return q.when([])
    }

    function onEachBranch (branch) {
      return dependenciesOf(branch, context)
        .then(function(v) { return dependencyTreeOf(v, branch) })
        .then(function(deps) { return {name:branch, context: context, deps:deps} })
    }
    var promises = _.map(list, onEachBranch)
    return q.all(promises)
  }
})

.factory('resolve', function(nameParser, dependenciesOf, _, q, transc, logFactory) {
  var console = logFactory('resolve')
  console.log('init')
  return function resolve (depList) {
    console.log('depList:',depList)
    var d = q.defer()

    if (!depList.length) {
      d.resolve([])
      return d.promise
    }

    function onEachBranch (branch) {
      return dependenciesOf(branch)
        .then(resolve)
        .then(function(deps) { return [deps, branch] })
    }

    var promises = _.map(depList, onEachBranch)

    // var promise = q.all(promises)
    //   .then(_.flatten)
      // .then(transc.bind(this, '+++'))

    return q.all(promises)
      .then(_.flatten)
      // TODO Move this to a better place
      .then(function(value) {
        return _.filter(value, function(v) {
          return !nameParser(v).isDirectory
        })
      })
  }
})

.factory('reduce', function(_) {
  return function(list) {
    return _.uniq(list)
  }
})

.factory('dependencyMap', function() {
  return {}
})

.factory('requestCapi', function() {
  return require('request')
})

.factory('requestPapi', function(requestCapi, promiseApiFromCbApi) {
  return promiseApiFromCbApi(requestCapi)
})

.factory('promiseApiFromCbApi', function(q) {
  return function promiseApiFromCbApi (fn) {
    return function() {
      var d = q.defer()
      var args = [].slice.call(arguments)
      args.push(function(err, val) {
        return err
          ? d.reject(err)
          : d.resolve(val)
      })
      fn.apply(this, args)
      return d.promise
    }
  }
})

.factory('virtDepFile', function(_) {
  return function virtDepFile (list) {
    var str = "// Virtual file generated by loadr"
    str += _.map(list, function(dep) {
      return '\n"require ' + dep + '"'
    }).join('')
    return str
  }
})

.factory('getFileFor', function(_, q, fs, requestPapi, readdir, readFile, logFactory, nameParser, virtDepFile) {
  var console = logFactory('getFileFor')
  console.log('init')

  return function getFileFor (name, context) {
    var parsedName = nameParser(name)
    var path = parsedName.path

    console.log(parsedName)

    if (parsedName.isDirectory) {
      return readdir(path)
        .then(function(val) {
          return virtDepFile(_.map(val, function(val) {
            // TODO think of a better way in here
            var x = (path.replace(/^packages\//,'')) + (val.replace(/\.js$/,''))
            return x
          }))
        })
    }

    if (parsedName.protocol == 'http') {
      return requestPapi(parsedName.url)
        .then(function(v) { return v.body })
    }

    if (parsedName.protocol == 'github') {
      return q.when(virtDepFile([parsedName.url]))
    }

    if (parsedName.protocol == 'githubSloppy') {
      return q.when(virtDepFile([name+'/']))
    }

    if (parsedName.protocol == 'relative') {
      context = 'https://gist.github.com/Wizek/55e7708fe19d0891d417/raw/a.js'
      if (!context) {
        throw new Error('No context for: ' + name)
        // return q.when().then(function() {
        // })
      }
      return q.when(virtDepFile([require('url').resolve(context,name)]))
    }

    if (parsedName.protocol == 'local') {
      return readFile(path)
    }

    return q.when().then(function() {
      throw new Error('Unknown protocol for: ' + name)
    })
  }
})

.factory('cachedGetFileFor', function(memCache, getFileFor, logFactory) {
  var console = logFactory('cachedGetFileFor')
  // console.log('init')
  return function cachedGetFileFor (name, ctx) {
    var cached = memCache.get(name)
    if (cached) {
      console.log(name + ' pulled from cache')
      return cached
    } else {
      return memCache.set(name, getFileFor(name, ctx))
    }

  }
})

.factory('dependenciesOf', function(cachedGetFileFor, sourceParser, logFactory) {
  var console = logFactory('dependenciesOf')
  console.log('init')
  return function(name, ctx) {
    console.log('name:', name)
    return cachedGetFileFor(name, ctx).then(sourceParser)
  }
})

.factory('uncachedDependenciesOf', function(getFileFor, sourceParser, logFactory) {
  var console = logFactory('! uncachedDependenciesOf')
  console.log('init')
  return function(name, ctx) {
    // global.console.log(arguments)
    return getFileFor(name, ctx).then(sourceParser)
  }
})

.factory('dependenciesOfSync', function(dependencyMap) {
  return function(name) {
    return dependencyMap[name]
  }
})

// .factory('q', function() {
//   return require('q')
// })

.factory('_', function() {
  return require('underscore')
})

di.module('modules', ['utils'])

.factory('concatSources', function() {
  return function concatSources (str) {
    return str.join('\n\n;;\n\n')
  }
})

.factory('getWithDeps', function(requestPapi, concatSources, resolve, reduce, q, _, nameParser, readFile) {
  return function getWithDeps (packageList) {
    return resolve(packageList)
      .then(reduce)
      .then(function(v) {
        return q.all(_.map(v, function(v) {
          if (nameParser(v).protocol == 'http') {
            return requestPapi(nameParser(v).url)
              .then(function(res) { return res.body })
          } else {
            return readFile(nameParser(v).path)
          }
        }))
      })
      // .then(function(v) {global.console.log(v); return v})
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

.value('httpProtocolRx', /^https?:\/\//)
.value('githubProtocolRx', /^github:\/\/(\w+)\/(\w+)(\/.*)?/)

.factory('protocolOf', function(httpProtocolRx, githubProtocolRx) {
  return function protocolOf (name) {
    if (name.match(httpProtocolRx)) {
      return 'http'
    }
    if (name.match(githubProtocolRx)) {
      return 'github'
    }
    return 'local'
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
      var replaceStr = 'https://raw.github.com/$1/$2/master$3'
      url = name.replace(githubProtocolRx, replaceStr)
      if (!github.path) {
        url += (github.path = '/index.js')
      }
    }

    var o =
      { name:           name
      , path:           path
      , isDirectory:    isDirectory
      , url:            url
      , protocol:       protocol
      , github:       github
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
  return function dependencyTreeOf (list) {
    if (!list.length) {
      return q.when([])
    }

    function onEachBranch (branch) {
      return dependenciesOf(branch)
        .then(dependencyTreeOf)
        .then(function(deps) { return {name:branch, deps:deps} })
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

.factory('dependenciesOf', function(_, fs, q, requestPapi, readdir, readFile, sourceParser, logFactory, nameParser) {
  var console = logFactory('dependenciesOf')
  console.log('init')
  return function(name) {
    console.log('name:',name)
    // console.debug(new Error().stack)
    var d = q.defer()
    var parsedName = nameParser(name)
    var path = parsedName.path

    console.log(parsedName)
    if (parsedName.isDirectory) {
      return readdir(path)
        .then(function(val) {
          return _.map(val, function(val) {
            // TODO think of a better way in here
            var x = (path.replace(/^packages\//,'')) + (val.replace(/\.js$/,''))
            return x
          })
        })
    } else {
      if (parsedName.protocol == 'http') {
        var getBody = requestPapi(parsedName.url)
          .then(function(v) { return v.body })
        // .pipe(fs.createWriteStream(parsedName.path))

        return getBody
          .then(sourceParser)
      }

      if (parsedName.protocol == 'github') {
        return q.when([parsedName.url])
      }

      if (parsedName.protocol == 'local') {
        console.log("readFile:",path)
        return readFile(path)
          .then(sourceParser)
      }

      return q.when().then(function() {
        throw new Error('Unknown protocol')
      })
    }
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

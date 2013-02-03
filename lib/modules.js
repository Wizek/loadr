var di = require('ng-di')

require('./utils')
di.module('modules', ['utils'])

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

.factory('scriptTagSeparator', function(_) {
  return function scriptTagSeparator (str) {
    var list = str.split(/\s+/)
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

.factory('nameParser', function() {
  return function nameParser (name) {
    var o =
      { name: name
      , path: 'packages/'+name+'.js'
      }
    return o
  }
})

.factory('sourceParser', function() {
  return function(str) {
    var list = []
    // console.log('!!!!!!!!')
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

.factory('resolve', function(dependenciesOf, _, q, transc, logFactory) {
  var console = logFactory('resolve')
  console.log('init')
  return function resolve (depList) {
    console.log(depList)
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

    q.all(promises)
      .then(_.flatten)
      .then(d.resolve)
      // .then(transc.bind(this, '+++'))

    return d.promise
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

.factory('dependenciesOf', function(q, readFile, sourceParser, logFactory, nameParser) {
  var console = logFactory('dependenciesOf')
  console.log('init')
  return function(name) {
    console.log('name:',name)
    var d = q.defer()
    var path = nameParser(name).path
    readFile(path)
      .then(sourceParser, d.reject)
      .then(d.resolve, d.reject)
    return d.promise
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

// var cc = 1

// exports.resolve = resolve

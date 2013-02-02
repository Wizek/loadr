var di = require('ng-di')

di.module('modules', [])

.factory('resolveSync', function(dependencyMap, _) {
  return function resolveSync (depList) {
    if (!depList.length) {
      return []
    }
    var t = _.map(depList, function(v) {
      return [resolveSync(dependencyMap[v]), v]
    })
    return _.flatten(t)
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

.factory('dependenciesOf', function(q) {
  return function() {
    var deferred = q.defer()

    return deferred.promise
  }
})

.factory('q', function() {
  return require('q')
})
.factory('_', function() {
  return require('underscore')
})

// var cc = 1

// exports.resolve = resolve

di.module('routes', ['modules', 'memCache'])

.factory('routes', function(getLoadRoute, getDepsRoute, getDependenciesRoute, getCacheRoute) {
  return (
    { getDepsRoute            : getDepsRoute
    , getLoadRoute            : getLoadRoute
    , getDependenciesRoute    : getDependenciesRoute
    , getCacheRoute           : getCacheRoute
    }
  )
})

.factory('getCacheRoute', function(memCache) {
  return function getCache (req, res) {
    res.send(memCache._store)
  }
})

.factory('getLoadRoute', function
  ( scriptTagSeparator
  , getWithDeps
  )
{
  function route (req, res) {
    res.set('content-type', 'text/javascript')
    var packages = scriptTagSeparator(req.query.packages)

    getWithDeps(packages)
      .then(function(v) {
        res.send(v)
      }, function(err) {
        res.send(404, err)
      })
  }

  return route
})

.factory('getDepsRoute', function
  ( dTreeToHumanReadable
  , dependencyTreeOf
  , scriptTagSeparator
  )
{
  return function getDepsRoute (req, res) {
    var packages = scriptTagSeparator(req.query.packages)
    dependencyTreeOf(packages)
      .then(dTreeToHumanReadable)
      .then(function(tree) {
        res.send(tree)
      }, function() {
        res.send(arguments)
      })
  }
})
.factory('getDependenciesRoute', function
  ( dependencyTreeOf
  , scriptTagSeparator
  )
{
  return function getDepsRoute (req, res) {
    var packages = scriptTagSeparator(req.query.packages)
    dependencyTreeOf(packages)
      .then(function(tree) {
        res.send(tree)
      }, function() {
        res.send(arguments)
      })
  }
})

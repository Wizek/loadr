di.module('routes', ['modules'])

.factory('getLoadRoute', function
  ( scriptTagSeparator
  , nameParser
  , resolve
  , readFile
  , _
  , reduce
  , q
  , dependenciesOf
  , getWithDeps
  )
{
  function out (resolve, msg) {
    // console.log(msg)
    // res.write('<li><pre>'+require('util').inspect(msg)+'</pre></li>')
    // res.write('<li><pre>'+require('util').inspect(msg)+'</pre></li>')
    return msg
  }

  // TODO factor the logic in here out to a single promise
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
  ( dTreeToHumanReadable
  , dependencyTreeOf
  , scriptTagSeparator
  )
{
  return function getDepsRoute (req, res) {
    var packages = scriptTagSeparator(req.query.packages)
    dependencyTreeOf(packages)
      // .then(dTreeToHumanReadable)
      .then(function(tree) {
        res.send(tree)
      }, function() {
        res.send(arguments)
      })
  }
})

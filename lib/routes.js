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
    // res.set('content-type', 'text/html')
    res.set('content-type', 'text/javascript')
    // res.write('<ul>')
    // res.write(';alert(1233);')
    // setTimeout(function() {
    //   res.end()
    // },1000)

    // res.send(100, 'console.error("Could not find xxx")')
    // return

    var c = out.bind(this, res)
    var packages = scriptTagSeparator(req.query.packages)
    // c([req.url, req.query])
    // c(packages)
    // c(scriptTagSeparator(packages))
    // c(nameParser(scriptTagSeparator(packages)[0]))

    // dependenciesOf('angular')
    resolve(packages)
    // readFile('./.gitignore')
      .then(reduce)
      .then(function(v) {
        c([1, v])
        return q.all(_.map(v, function(v) {
          c([2, arguments])
          return readFile(nameParser(v).path)
        }))
      })
      .then(function(v) {
        return v.join('\n;;\n\n')
      })
      .then(function(v) {
        c(v)
        res.send(v)
        // res.end('\n\nend</ul>')
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

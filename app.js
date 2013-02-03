
require('./lib/node_utils')
var express = require('express')
var http = require('http')
var path = require('path')
var di = require('ng-di')

require('./lib/modules')

di.injector(['modules']).invoke(function
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

var app = express()

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
})

app.configure('development', function(){
  app.use(express.errorHandler());
})

function out (res, msg) {
  console.log(msg)
  // res.write('<li><pre>'+require('util').inspect(msg)+'</pre></li>')
  // res.write('<li><pre>'+require('util').inspect(msg)+'</pre></li>')
  return msg
}

// TODO factor the logic in here out to a single promise
app.get('/load', function(req, res) {
  res.set('content-type', 'text/javascript')
  var packages = scriptTagSeparator(req.query.packages)
  var c = out.bind(this, res)
  

  resolve(packages)
    .then(function(v) {
      c([1, v])
      return q.all(_.map(v, function(v) {
        c([2, arguments])
        return readFile(nameParser(v).path)
      }))
    })
    .then(reduce)
    .then(function(v) {
      return v.join('\n;;\n\n')
    })
    .then(function(v) {
      c(v)
      res.send(v)
      // res.end('\n\nend</ul>')
    })
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

})



/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , uglifyJS = require('uglify-js')
  , di = require('ng-di')

require('./modules')

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

function resolveDependencies (array) {
  // TODO expand
  return array
}

function weedOutDuplicates (array) {
  // TODO expand
  return array
}

function out (res, msg) {
  console.log(msg)
  // res.write('<li><pre>'+require('util').inspect(msg)+'</pre></li>')
  // res.write('<li><pre>'+require('util').inspect(msg)+'</pre></li>')
  return msg
}

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

var f = {}
f.enum = function(start, end) {
  var list = []
  while (start <= end) {
    list.push(start++)
  }
  return list
}
f.map = function(fn, list) {
  var list2 = []
  for (var i = 0; i < list.length; i++) {
    list2[i] = fn(list[i])
  }
  return list2
}


void function (ctx) {
  ctx.c = function() {
    var l = arguments.length,
      message = 'Callback called with ' + l +
        ' argument' + (l === 1 ? '' : 's') + (l > 0 ? ':\n' : '');

    for (var i = 0; i < 10; i++) {
      if (i < arguments.length) {
        ctx['_' + i] = arguments[i];
        message += '_' + i + ' = ' + arguments[i] + '\n';
      } else {
        if (ctx.hasOwnProperty('_' + i)) {
          delete ctx['_' + i];
        }
      }
    }
    console.log(message);
  }
}(global)

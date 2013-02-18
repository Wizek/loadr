
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , uglifyJS = require('uglify-js')

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

app.get('*', function(req, res) {
  console.log('req.url', req.url)
  var list = decodeURIComponent(req.url).split(/\s+/)
  list.shift()
  list = f.map(function(v) {return "repo/"+v+"/index.js"}, list)
  console.log('list', list)
  var sources = uglifyJS.minify(list, {compress: false})
  // res.send('console.log('+JSON.stringify(list)+')')
  res.send(sources.code)
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


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

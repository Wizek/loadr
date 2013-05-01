di.module('main', ['expressApp', 'routes'])

.run(function (app, routes) {
  app.get('/load', routes.getLoadRoute)
  app.get('/deps', routes.getDepsRoute)
  app.get('/dependencies', routes.getDependenciesRoute)
  app.get('/cache', routes.getCacheRoute)
  app.get('/', function(_, res) {
    res.render('index.jade', {version: require('../package.json').version})
  })
  app.get('/docs', function(_, res) {
    res.render('docs.jade')
  })
  app.get('/changelog', function(_, res) {
    res.render('changelog.jade')
  })
})

.run(function() {
  require('jade').filters.html = function(content, filename) {
    return content.replace(/\n/g, ' ')
  }
  require('jade').filters.loadr = function(content, filename) {
    var middle = content.replace(/[\s\n,]/g, ',')
    var full = ''
      + '<script src="http://loadr.aws.af.cm/load?packages='
      + middle
      + '"></script>'
    return full
  }
})

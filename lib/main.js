di.module('main', ['expressApp', 'routes'])

.run(function (app, getLoadRoute, getDepsRoute, getDependenciesRoute) {
  app.get('/load', getLoadRoute)
  app.get('/deps', getDepsRoute)
  app.get('/dependencies', getDependenciesRoute)
  app.get('/', function(_, res) {res.send('Hello!')})
})

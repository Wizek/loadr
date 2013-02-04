di.module('main', ['expressApp', 'routes'])

.run(function (app, getLoadRoute) {
  app.get('/load', getLoadRoute)
})

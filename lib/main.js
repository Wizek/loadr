di.module('main', ['expressApp', 'routes'])

.run(function (app, getLoadRoute, getDepsRoute) {
  app.get('/load', getLoadRoute)
  app.get('/deps', getDepsRoute)
})

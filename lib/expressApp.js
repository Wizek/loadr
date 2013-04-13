di.module('expressApp', ['nodeApi', 'modules'])

.factory('app', function
  ( express
  , http
  , path
  , logFactory
  )
{
  
  var console = logFactory("express-app")
  var app = express()

  console.log('init')

  app.configure(function(){
    app.set('port', process.env.VCAP_APP_PORT || process.env.PORT || 3000)
    app.set('views', __dirname + '/../views')
    app.set('view engine', 'jade')
    app.set('view options', {pretty: true, debug: true})
    app.set('version', require('../package.json').version)

    app.use(express.favicon())
    app.use(express.logger('dev'))
    app.use(express.bodyParser())
    app.use(express.methodOverride())
    app.use(app.router)
    app.use(express.static(path.join(__dirname, 'public')))
  })

  app.configure('development', function(){
    app.use(express.errorHandler())
  })

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'))
  })

  return app
})

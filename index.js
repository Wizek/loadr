global.di = require('ng-di')

require("fs").readdirSync("./lib").forEach(function(file) {
  require("./lib/" + file)
})

di.injector(['main'])

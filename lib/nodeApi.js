di.module('nodeApi', [])

.factory('global'  , function() {return global})
.factory('express' , function() {return require('express')})
.factory('http'    , function() {return require('http')})
.factory('path'    , function() {return require('path')})

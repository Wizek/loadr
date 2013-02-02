
var di = require('ng-di')
// console.log(di)

di.module('modules', [])
.factory('resolve', function() {
  return function resolve (depList) {
    return depList
  }
})
.value('xxx', 'x1')
.factory('yyy', function(xxx) {
  return xxx+'yy'
})

// var cc = 1

// exports.resolve = resolve

global.di = require('ng-di')
require("fs").readdirSync(__dirname + "/../lib").forEach(function(file) {
  require("../lib/" + file)
})

require('ng-di/dist/ng-di-mocks')
global.mod = di.mock.module
global.inj = di.mock.inject
global.cnt = 0

global.done = function(expected) { expect(cnt).toBe(expected) }
global.injectInto = function(o, ary) {
  console.warn('injectInto is deprecated')
  var fn = function() {
    for (var i = 0; i < arguments.length; i++) {
      o[ary[i]] = arguments[i]
    }
  }
  fn.$inject = ary
  return inject(fn)
}

global.get = di.injector(['modules']).get
global.superset = get('superset')
global.hereDoc = get('hereDoc')
global.noop = get('noop')


beforeEach(mod('modules'))

// Suppress logfactory
beforeEach(mod(function($provide) {
  $provide.value('logFactory_piercingMethods', {})
  $provide.value('logFactory_whiteList', /nothing at all|!t!/)
}))

// Reset "async" callback count
beforeEach(function() { cnt = 0 })

// Add custom matchers
beforeEach(function() {
  var toResolveWith = function(expected) {
    // console.log(222, /*this*/ jasmine.Matchers.prototype.toEqual)
    var matchers = jasmine.Matchers.prototype
    var value
    var timedIn = false
    if (!this.actual || !this.actual.then) {
      throw Error('Not a promise!')
    }
    this.actual.then(function(v) {
      value = v
      timedIn = true
      cnt++
    })
    if (!timedIn) {
      throw Error('Promise not fulfilled in time')
    } else {
      this.message = function() {
        // var englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });
        return 'Expected resolved value ' + jasmine.pp(value) + " to equal " + jasmine.pp(expected)
      }
      // this.actual = value
      var patchedEnv = require('underscore').extend({}, this, {actual: value})
      return matchers.toEqual.call(patchedEnv, expected)
    }
  }
  var toRejectWith = function(expected) {
    // console.log(222, /*this*/ jasmine.Matchers.prototype.toEqual)
    var matchers = jasmine.Matchers.prototype
    var value
    var timedIn = false
    this.actual.then(noop, function(v) {
      value = v
      timedIn = true
      cnt++
    })
    if (!timedIn) {
      throw Error('Promise not rejected in time')
    } else {
      this.message = function() {
        // var englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });
        return 'Expected rejected value ' + jasmine.pp(value) + " to equal " + jasmine.pp(expected)
      }
      // this.actual = value
      var patchedEnv = require('underscore').extend({}, this, {actual: value})
      return matchers.toEqual.call(patchedEnv, expected)
    }
  }
  this.addMatchers(
    { toBeSupersetOf: function(subset) {
        return superset(this.actual, subset)
      }
    , toThenEqual: toResolveWith
    , toResolveWith: toResolveWith
    , toRejectWith: toRejectWith
    }
  )
})

// onNextTick sould be instantanous (sync) to avoid any and all asyncronity.
//   In other words, to eas testing by a great deal
//
// TODO Investigate. Can this cause any problems?
//   Because Normally nt() is always async...
beforeEach(mod(function($provide) {
  $provide.value('onNextTick', function (cb){ return cb() })
}))


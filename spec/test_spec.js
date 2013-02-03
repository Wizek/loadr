var rewquire = require//("rewire")
// var chai = rewquire('chai')
var modules = rewquire('../modules')
var resolve = modules.resolve
var di = require('ng-di')
var x = jasmine
var mocks = require('ng-di/dist/ng-di-mocks')
// console.log(x === jasmine, mocks)
var temp = mocks.init(jasmine, global)
var module = temp.module
var inject = temp.inject

// console.log(mocks)
// di.module('main')
// var di = require('./node_modules/ng-di/dist/ng-di.js')

// console.log(require('components/angular/angular.js'))
// console.log(modules.__get__('cc'))
// di.injector(['modules']).invoke(function(resolve) {
//   console.log(resolve)
// })
// var ddescribe = describe.only
// var xdescribe = describe.skip
// var iit = it.only
// var xit = it.skip
// asdasd
// chai.should()

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


var parse = function(str) {
  var list = str.split(/\s+/)
  var list2 = f.map(function(v) {return {name:v}}, list)
  return list2
}

// var resolve = function(ary) {
//   return ary
// }
// expect(0).toBe(1)
// console.log(1)
//   beforeEach(function() {
//     console.log('BEFORE')
//   })
  // afterEach(function() {})

var cnt
var done = function(expected) {
  expect(cnt).toBe(expected)
}

beforeEach(module('modules'))
beforeEach(function() {
  cnt = 0
})

describe('hereDoc', function() {
  it('try', inject(function(hereDoc) {
    expect(hereDoc(function() {/**/})).toBe("")
    expect(hereDoc(function() {/*
    */})).toBe("")
    expect(hereDoc(function() {/*

    */})).toBe("")


    expect(hereDoc(function() {/*
a
    */})).toBe("a")


    expect(hereDoc(function() {/*
a b
cd ef
    */})).toBe("a b\ncd ef")


    expect(hereDoc(function() {/*
  a b
  cd ef
    */})).toBe("a b\ncd ef")


    expect(hereDoc(function() {/*
      a b
      cd ef
    */})).toBe("a b\ncd ef")


    expect(hereDoc(function() {/*
      a b
        cd ef
    */})).toBe("a b\n  cd ef")

  }))
})

describe('loader', function() {
  describe('parser', function() {
    it('should accept any kind of whitespace', function() {

      // expect(1).toBe(2)
      var t = function(s) {
        return {name:s}
      }
      expect(parse('m1 m2')).toEqual(f.map(t, ['m1', 'm2']))
      expect(parse('m1   m3')).toEqual(f.map(t, ['m1', 'm3']))
      expect(parse('m1 \n  m4')).toEqual(f.map(t, ['m1', 'm4']))
      expect(parse('a\n  b\n  c')).toEqual(f.map(t, ['a', 'b', 'c']))
    })
    describe('file-level', function() {
      var sourceParser
      var hereDoc

      beforeEach(inject(['sourceParser', 'hereDoc', function(a, b) {
        sourceParser = a
        hereDoc = b
      }]))
      function test (a, b) {
        expect(sourceParser(hereDoc(a))).toEqual(b)
      }
      it('should work on empty', function() {
        test(function() {/**/}, [])
        test(function() {/*
          xxx
          yyy
        */}, [])
      })

      it('should work regardless of placement', function() {
        test(function() {/*
          "require a"
          xxx
          yyy
        */}, ['a'])
        test(function() {/*
          xxx
          "require b"
          yyy
        */}, ['b'])
        test(function() {/*
          xxx
          yyy
          "require c"
        */}, ['c'])
      })

      it('should work on multiple', function() {
        test(function() {/*
          "require aa"
          "require bbb"
          xxx
        */}, ['aa', 'bbb'])
      })
      it('should work with bot string notations', function() {
        test(function() {/*
          "require cc"
          'require d'
          xxx
        */}, ['cc', 'd'])
      })
      it('should not work when malformatted', function() {
        test(function() {/*
          "require a'
          'require b"
          xxx
        */}, [])
      })
    })
  })

  // var dependencyMap

  var charSplit = function(str) {
    return str.split('')
  }
  describe('recursive resolver', function() {
    beforeEach(module(function($provide) {
      var dependencyMap =
        { 'a': ['b']
        , 'c': ['b']
        , 'b': []
        , 'd': ['e']
        , 'e': ['f']
        , 'f': []
        , 'g': ['a','c']
        }
      $provide.value('dependencyMap', dependencyMap); // override version here
    }))
    beforeEach(module(function($provide) {
      var list = []
      var onNextTick = function(cb) {
        return cb()
        // console.log(cb)
        // list.push(cb)
      }
      $provide.value('onNextTick', onNextTick)
      var flushNextTick = function() {
        console.log(0.25, list.length)
        while (list.length) {
          list.pop()()
        }
      }
    }))
    describe('sync', function() {
      it('should resolve recursively', function() {

        inject(function(resolveSync) {
          function test (a, b) {
            expect(resolveSync(charSplit(a))).toEqual(charSplit(b))
          }
          test('f',  'f')
          test('e',  'fe')
          test('d',  'fed')
          test('a',  'ba')
          test('ac', 'babc')
          test('df', 'fedf')
          test('d',  'fed')
          test('g',  'babcg')

          // var t
          // t = ['a']
          // t = [{name: 'a', requires: ['b']}]
          // t = [{name: 'a', requires: [{name:'b', requires:[]}]}]
        })
      })
    })
    describe('async', function() {
      beforeEach(module(function($provide) {
        $provide.factory('dependenciesOf', function(q, dependenciesOfSync) {
          return function(name) {
            var d = q.defer()
            d.resolve(dependenciesOfSync(name))
            return d.promise
          }
        })
      }))
      describe('dependenciesOf', function() {
        it('should use q and dependencyMap', function() {
          inject(function(dependenciesOf) {
            function test (a, b) {
              dependenciesOf(a).then(function(v) {
                expect(v).toEqual(b)
                cnt++
              })
            }
            // expect(0).toBe(0)
            // console.log(jasmine.getEnv())
            test('a', ['b'])
            test('g', ['a', 'c'])
            done(2)
          })
        })
      })
      it('should resolve recursively', function() {
        inject(function(resolve, q) {
          function test(a, b) {
            resolve(charSplit(a)).then(function(v) {
              expect(v).toEqual(charSplit(b))
              cnt++
            })
          }
          test('',   '')
          test('f',  'f')
          test('e',  'fe')
          test('d',  'fed')
          test('a',  'ba')
          test('ac', 'babc')
          test('df', 'fedf')
          test('d',  'fed')
          test('g',  'babcg')
          done(9)
        })
      })
    })
  })

  describe('reducer', function() {
    it('should reduce', inject(function(reduce) {
      function test (a, b) {
        expect(reduce(charSplit(a))).toEqual(charSplit(b))
      }
      test('f',     'f')
      test('fe',    'fe')
      test('fed',   'fed')
      test('ba',    'ba')
      test('babc',  'bac')
      test('fedf',  'fed')
      test('fed',   'fed')
      test('babcg', 'bacg')
    }))
  })
})

var di = require('ng-di')
var _moduleBkp = module
require('ng-di/dist/ng-di-mocks')
require('../modules')


var module = di.mock.module
var cnt
var done = function(expected) { expect(cnt).toBe(expected) }
var injectInto = function(o, ary) {
  console.warn('injectInto is deprecated')
  var fn = function() {
    for (var i = 0; i < arguments.length; i++) {
      o[ary[i]] = arguments[i]
    }
  }
  fn.$inject = ary
  return inject(fn)
}

var get = di.injector(['modules']).get
var superset = get('superset')
var hereDoc = get('hereDoc')


beforeEach(module('modules'))

// Suppress logfactory
beforeEach(module(function($provide) {
  $provide.value('logFactory_whiteList', /$^/)
}))

// Reset "async" callback count
beforeEach(function() { cnt = 0 })

// Add custom matchers
beforeEach(function() {
  this.addMatchers(
    { toBeSupersetOf: function(subset) {
        return superset(this.actual, subset)
      }
    , toThenEqual: function(expected) {
        // console.log(222, /*this*/ jasmine.Matchers.prototype.toEqual)
        var matchers = jasmine.Matchers.prototype
        var value
        var timedIn = false
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
            return 'Expected promised value ' + jasmine.pp(value) + " to equal " + jasmine.pp(expected)
          }
          // this.actual = value
          var patchedEnv = require('underscore').extend({}, this, {actual: value})
          return matchers.toEqual.call(patchedEnv, expected)
        }
      }
    }
  )
})

// onNextTick sould be instantanous (sync) to avoid any and all asyncronity.
//   In other words, to eas testing by a great deal
//
// TODO Investigate. Can this cause any problems?
//   Because Normally nt() is always async...
beforeEach(module(function($provide) {
  $provide.value('onNextTick', function (cb){ return cb() })
}))



describe('hereDoc', function() {
  var hereDoc
  beforeEach(inject(function() {
    hereDoc = inject.get('hereDoc')
  }))
  function test (a, b) {
    expect(hereDoc(a)).toBe(b)
  }
  it('should work on "empty" input', function() {
    test(function() {/**/}, "")
    test(function() {/*
    */}, "")
    test(function() {/*

    */}, "")
  })
  xit('should work on unindented input', function() {
    //    expect(hereDoc(function() {/*
    //a
    //    */})).toBe("a")
    //
    //
    //    expect(hereDoc(function() {/*
    //a b
    //cd ef
    //    */})).toBe("a b\ncd ef")
    //
    //
    //    expect(hereDoc(function() {/*
    //  a b
    //  cd ef
    //    */})).toBe("a b\ncd ef")
  })
  it('should remove indentation', function() {
    test(function() {/*
      a b
      cd ef
    */}, "a b\ncd ef")
    test(function() {/*
      a b
        cd ef
    */}, "a b\n  cd ef")
  })
})


describe('superset', function() {
  it('should ', function() {
    expect(superset({}, {})).toBeTruthy()
    expect(superset({a:1}, {})).toBeTruthy()
    expect(superset({a:1}, {a:1})).toBeTruthy()

    expect(superset({}, {a:1})).not.toBeTruthy()
    expect(superset({a:1}, {a:2})).not.toBeTruthy()
    expect(superset({a:1}, {a:1, b:2})).not.toBeTruthy()
  })
  it('should ', function() {
    expect(typeof expect().toBeSupersetOf).toBe('function')
    expect(function() {
      expect({a:1}).toBeSupersetOf({a:1})
    }).not.toThrow()
  })
})


describe('loader', function() {
  var charSplit = function(str) { return str.split('') }

  describe('parser', function() {
    describe('url-level', function() {
      it('should accept any kind of whitespace as delimiter', inject(function(scriptTagSeparator) {
        function test (a, b) {
          expect(scriptTagSeparator(a)).toEqual(b)
        }
        test('m1 m2',       ['m1', 'm2'])
        test('m1   m3',     ['m1', 'm3'])
        test('m1 \n  m4',   ['m1', 'm4'])
        test('a\n  b\n  c', ['a', 'b', 'c'])
        test('',            [])
        test(' ',           [])
        test('  ',          [])
        test(' m1 m2',      ['m1', 'm2'])
      }))
    })

    describe('name-level', function() {
      function test (a,b) { expect(get('nameParser')(a)).toBeSupersetOf(b) }
      it('', function() {
        test('name', {name: 'name'})
        test('name', {path: 'packages/name.js'})
      })
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

  describe('recursive-resolver', function() {
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
    describe('sync', function() {
      it('should resolve recursively', function() {

        inject(function(resolveSync) {
          function test (a, b) {
            expect(resolveSync(charSplit(a))).toEqual(charSplit(b))
          }
          test('f'  ,'f')
          test('e'  ,'fe')
          test('d'  ,'fed')
          test('a'  ,'ba')
          test('ac' ,'babc')
          test('df' ,'fedf')
          test('d'  ,'fed')
          test('g'  ,'babcg')

          // var t
          // t = ['a']
          // t = [{name: 'a', requires: ['b']}]
          // t = [{name: 'a', requires: [{name:'b', requires:[]}]}]
        })
      })
    })
    describe('async', function() {
      var dependenciesOfMockModule = module(function($provide) {
        $provide.factory('dependenciesOf', function(q, dependenciesOfSync) {
          return function(name) {
            var d = q.defer()
            d.resolve(dependenciesOfSync(name))
            return d.promise
          }
        })
      })
      describe('dependenciesOf', function() {
        var mockFs
        var fileContent
        var ifFunction = get('ifFunction')
        beforeEach(module(function($provide) {
          /*\
           *  This is how one deals with spies!
           *  Either way is correct.
          \*/
          mockFs = {}
          mockFs.readFile = function(name, cb1, cb2) {
            var cb = ifFunction(cb2).else(cb1)
            return cb(null, fileContent)
          }
          spyOn(mockFs, 'readFile').andCallThrough()
          $provide.value('fs', mockFs)
          // mockFs = {}
          // mockFs.readFile = jasmine.createSpy('readFile')
          // mockFs.readFile.plan = function(name, cb) {
          //   return cb(null, fileContent)
          // }
          // $provide.value('fs', mockFs)
        }))

        it('should use q and dependencyMap', function() {
          dependenciesOfMockModule()

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

        it('should integrate', function() {
          inject(function(dependenciesOf) {
            function test (a, b) {
              fileContent = hereDoc(a)
              expect(dependenciesOf('x')).toThenEqual(b)
            }

            test('',  [])

            test(function(){/*
              "require asd"
            */}, ['asd'])

            // TODO Consider skipping the 'e' one.
            test(function(){/*
              "require a"
               "require b'
              'require c"
              asd
              "require d"
              ddd
              var haha = "require e"
                  'require x'
            */}, 'adex'.split(''))
            done(3)
          })
        })

        describe('readFile', function() {
          it('should ', function() {
            inject(function(readFile) {
              expect(mockFs.readFile).not.toHaveBeenCalled()

              fileContent = 'xx'
              expect(readFile('foo')).toThenEqual('xx')

              expect(mockFs.readFile).toHaveBeenCalled()
              expect(mockFs.readFile.mostRecentCall.args[0]).toBe('foo')

              fileContent = 'sdadasd\nsdasd'
              expect(readFile('foo')).toThenEqual('sdadasd\nsdasd')
            })
          })
        })
      })
      it('should resolve recursively', function() {
        dependenciesOfMockModule()
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
      test('aba',   'ab')
    }))
  })

})

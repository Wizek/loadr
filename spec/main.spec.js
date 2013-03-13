describe('loader', function() {
  var charSplit = function(str) { return str.split('') }

  describe('recursive-resolver', function() {
    beforeEach(mod(function($provide) {
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
      describe('dTreeToHumanReadable', function() {
        it('should ', function() {
          inject(function(dTreeToHumanReadable) {
            function test (a,b) {
              expect(dTreeToHumanReadable(a)).toEqual(b)
            }
            test([], [])
            test([{name:'x',deps:[]}], [{x:[]}])
            test([{name:'x',deps:[]},{name:'y',deps:[]}], [{x:[]},{y:[]}])
            test([{name:'x',deps:[{name:'y',deps:[]}]}], [{x:[{y:[]}]}])
          })
        })
      })
      describe('dTreeToReducedList', function() {
        it('should ', function() {
          inject(function(dTreeToReducedList) {
            function test (a,b) {
              expect(dTreeToReducedList(a)).toEqual(b)
            }
            test([], [])
            test([{name:'x',deps:[]}], ['x'])
            test([{name:'x',deps:[]},{name:'y',deps:[]}], ['x', 'y'])
            test([{name:'x',deps:[{name:'y',deps:[]}]}], ['y', 'x'])
          })
        })
      })
    })
    describe('async', function() {
      var dependenciesOfMockModule = mod(function($provide) {
        $provide.factory('dependenciesOf', function(q, dependenciesOfSync) {
          return function(name) {
            var d = q.defer()
            d.resolve(dependenciesOfSync(name))
            return d.promise
          }
        })
      })
      describe('dependenciesOf', function() {
        var mockRequestResponse
        var mockFs
        var fileContent
        var fileError
        var ifFunction = get('ifFunction')
        beforeEach(mod(function($provide) {
          /*\
           *  This is how one deals with spies!
           *  Either way is correct.
          \*/
          mockFs = {}
          mockFs.readFile = function(name, cb1, cb2) {
            var cb = ifFunction(cb2).else(cb1)
            return cb(fileError, fileContent)
          }
          mockFs.readdir = function(path, cb) {
            return cb(fileError, mockFs.readdir.result)
          }
          spyOn(mockFs, 'readFile').andCallThrough()
          spyOn(mockFs, 'readdir').andCallThrough()
          $provide.value('fs', mockFs)
          // mockFs = {}
          // mockFs.readFile = jasmine.createSpy('readFile')
          // mockFs.readFile.plan = function(name, cb) {
          //   return cb(null, fileContent)
          // }
          // $provide.value('fs', mockFs)
        }))

        beforeEach(mod(function($provide) {
          $provide.value('requestCapi', function(url, cb) {
            return cb.apply(this, mockRequestResponse)
          })
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

        it('should support directories', function() {
          // dependenciesOfMockModule()
          mod(function($provide) {
            $provide.value('nameParser', function(val) {
              return {isDirectory: true, path:val, name:val}
            })
          })
          inject(function(dependenciesOf) {
            function test (a, b) {
              expect(dependenciesOf(a)).toThenEqual(b)
            }
            mockFs.readdir.result = ['x.js', 'yy.js']
            expect(mockFs.readdir).not.toHaveBeenCalled()
            test('test/', ['test/x', 'test/yy'])
            expect(mockFs.readdir).toHaveBeenCalled()
            done(1)
          })
        })

        it('should support http', function() {
          // dependenciesOfMockModule()
          mod(function($provide) {
            $provide.value('nameParser', function(val) {
              return {protocol: 'http', url:val, name:val}
            })
          })
          inject(function(uncachedDependenciesOf) {
            function test (a, b) { expect(uncachedDependenciesOf(a)).toThenEqual(b) }

            mockRequestResponse = [null, {body:'"require a"'}]
            test('http://a.com', ['a'])
            mockRequestResponse = [null, {body:'"require b"'}]
            test('http://a.com', ['b'])
            done(2)
          })
        })

        it('should support github', function() {
          inject(function(uncachedDependenciesOf) {
            function test (a, b) { expect(uncachedDependenciesOf(a)).toThenEqual(b) }
            test('github://u/r',  ['https://raw.github.com/u/r/master/index.js'])
            test('github://u/r/a.js', ['https://raw.github.com/u/r/master/a.js'])
          })
        })

        it('should integrate', function() {
          inject(function(uncachedDependenciesOf) {
            function test (a, b) {
              fileContent = hereDoc(a)
              expect(uncachedDependenciesOf('x')).toThenEqual(b)
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
          it('should fulfill with the file content', inject(function(readFile) {
            expect(mockFs.readFile).not.toHaveBeenCalled()

            fileContent = 'xx'
            expect(readFile('foo')).toThenEqual('xx')

            expect(mockFs.readFile).toHaveBeenCalled()
            expect(mockFs.readFile.mostRecentCall.args[0]).toBe('foo')

            fileContent = 'sdadasd\nsdasd'
            expect(readFile('foo')).toThenEqual('sdadasd\nsdasd')
          }))

          it('should reject with the error', inject(function(readFile) {
            function test (a, b) {
              fileError = a
              readFile('whatever').then(function() {
                throw Error('should reject')
              }, function(v) {
                expect(v).toBe(b)
                cnt++
              })
            }
            test('err' , 'err')
            test('err2', 'err2')
            expect(test.bind(this, true, true)).not.toThrow()
            expect(test.bind(this, null, 'x')).toThrow()
            done(3)
          }))
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
      describe('dependency-tree', function() {
        beforeEach(dependenciesOfMockModule)

        it('should return a tree', function() {
          inject(function(dependencyTreeOf) {
            function test (a, b) {
              expect(dependencyTreeOf(a)).toThenEqual(b)
            }
            test([], [])
            test(['b'], [{name:'b',deps:[]}])
            test(['b','b'], [{name:'b',deps:[]},{name:'b',deps:[]}])
            test(['a'], [{name:'a',deps:[{name:'b',deps:[]}]}])
            // done(2)
          })
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

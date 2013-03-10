describe('getWithDeps', function() {
  var mockFsReturns = {}
  var mockHttpReturns = {}
  beforeEach(mod(function($provide) {
    $provide.value('fs',
      { readFile: function(path, encoding, cb) {
          // console.log(path, mockFsReturns[path], mockFsReturns)
          cb(null, mockFsReturns[path])
        }
      }
    )
    $provide.value('concatSources', function(s) {
      return s.join(';')
    })
    $provide.value('requestCapi', function(path, cb) {
      cb(null, {body:mockHttpReturns[path]})
    })
  }))
  beforeEach(function() { mockFsReturns =
    { "packages/a.js": 'a file'
    , "packages/b.js": 'b file'
    , "packages/c.js": '"require a"\nc'
    }
  })
  beforeEach(function() { mockHttpReturns =
    { "http://a": 'a http'
    }
  })

  var getWithDeps
  beforeEach(inj(['getWithDeps', function(f) {
    getWithDeps = f
  }]))

  it('should support local', function() {
    function test (a, b) {
      expect(getWithDeps(a.split(''))).toResolveWith(b)
    }
    test('a', "a file")
    test('ab', "a file;b file")
  })
  it('should support http', function() {
    function test (a, b) {
      expect(getWithDeps(a.split(','))).toResolveWith(b)
    }
    test('http://a', "a http")
  })
})

describe('concatSources', function() {
  it('should work', function() {
    inj(function(concatSources) {
      function test (a, b) {
        expect(concatSources(a.split(''))).toEqual(b)
      }
      test('a', 'a')
      test('ab', 'a\n\n;;\n\nb')
    })
  })
})

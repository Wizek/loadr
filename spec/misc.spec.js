describe('promiseApiFromCbApi', function() {
  var promiseApiFromCbApi
  var successOfCbApi
  var failureOfCbApi
  var cbApi
  var getPapiOfCb = function() {
    return promiseApiFromCbApi(cbApi)
  }
  function test (a, success, b) {
    var e = expect(getPapiOfCb().apply({}, a))
    if (success) {
      successOfCbApi()
      e.toResolveWith(b)
    } else {
      failureOfCbApi()
      e.toRejectWith(b)
    }
  }
  beforeEach(inj(['promiseApiFromCbApi', function(f) {
    promiseApiFromCbApi = f
  }]))

  it('should make a promise api from a cb api', function() {
    cbApi = function(fn) {
      successOfCbApi = function() { fn(null, "Yay!") }
      failureOfCbApi = function() { fn("Bummer!", null) }
    }
    test([], 1, 'Yay!')
    test([], 0, 'Bummer!')
  })

  it('should support an argument', function() {
    cbApi = function(arg, fn) {
      successOfCbApi = function() { fn(null, "s"+arg) }
      failureOfCbApi = function() { fn("f"+arg, null) }
    }
    test(["_passthrough1"], 1, 's_passthrough1')
    test(["_passthrough2"], 0, 'f_passthrough2')
  })

  it('should support multiple arguments', function() {
    cbApi = function(a1, a2, fn) {
      successOfCbApi = function() { fn(null, "s_"+a1+','+a2) }
      failureOfCbApi = function() { fn(      "f_"+a1+','+a2, null) }
    }
    test([1,2], 1, 's_1,2')
    test([3,4], 0, 'f_3,4')
  })

  it('should support multiple invocations', function() {
    cbApi = function(arg, fn) {
      successOfCbApi = function() { fn(null, "s"+arg) }
      failureOfCbApi = function() { fn("f"+arg, null) }
    }

    test([1], 1, 's1')
    test([2], 1, 's2')
    test([3], 0, 'f3')
    test([4], 0, 'f4')
  })
})

describe('hereDoc', function() {
  var hereDoc
  beforeEach(inject(['hereDoc', function(hd) {
    hereDoc = hd
  }]))
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

describe('onNextTick', function() {
  it('should exist', function() {
    inject(function(onNextTick) {
      expect(onNextTick).toBeDefined()
    })
  })
})

describe('walkTreeFactory', function() {
  it('should ', function() {
    inject(function(walkTreeFactory) {
      function test (a,b,c) {
        expect(walkTreeFactory(b)(a)).toEqual(c)
      }
      // var noop =
      test([], noop, [])
      test([{a:[]}], function(){return 2}, [2])
      test([{a:[]},{a:[]}], function(){return 2}, [2,2])
      test([{a:[]}], function(v){return Object.keys(v)[0]}, ['a'])
      test
        ( [{k:'a',v:[{k:'b',v:[]}]}]
        , function(v, cb){return [cb(v.v), v.k]}, [[[[[]
        , 'b']], 'a']]
        )
      test
        ( [{k:'a',v:[{k:'b',v:[]}]}]
        , function(v, cb){var o={};o[v.k]=cb(v.v);return o}
        , [{a:[{b:[]}]}]
        )
    })
  })
})


describe('virtual dependency file', function() {
  it('should generate virtual files', inj(function(virtDepFile) {
    expect(virtDepFile([])).toBe(hereDoc(function(){/*
      // Virtual file generated by loadr
    */}))
    expect(virtDepFile(['a'])).toBe(hereDoc(function(){/*
      // Virtual file generated by loadr
      "require a"
    */}))
    expect(virtDepFile(['xxx', 'yyy'])).toBe(hereDoc(function(){/*
      // Virtual file generated by loadr
      "require xxx"
      "require yyy"
    */}))
  }))
})

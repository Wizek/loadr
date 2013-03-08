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

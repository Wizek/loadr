describe('parsing', function() {
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

      test(' ./x /asd',      ['./x', '/asd'])

      test('http://a.co\n http://b.co', ['http://a.co','http://b.co'])
    }))
  })

  describe('name-level', function() {
    var nameParser
    beforeEach(inj(['nameParser', function(np) {
      nameParser = np
    }]))
    function test (a,b) { expect(nameParser(a)).toBeSupersetOf(b) }

    it('should work with global packages', function() {
      test('name', {name: 'name'})
      test('name', {path: 'packages/name.js'})
    })

    it('should support directories', function() {
      test('path',  {isDirectory:false})
      test('path/', {isDirectory:true })
    })

    it('should support http://', inj(function(nameParser) {
      test('http://a.com', {protocol:"http"})
      test('http/a.com',   {protocol:"local"})

      test('http://a.com', {url:'http://a.com'})
      test('http://a.com', {path:'remote_cache/http---a.com'})
    }))

    it('should support github://', inj(function(nameParser) {
      test('github://user/repo', {protocol:"github"})
      test('github://userrepo', {protocol:"local"})
      test('github://user/repo/file.js', {protocol:"github"})
      test('github://user/repo/folder/file.js', {protocol:"github"})

      expect(nameParser('github://u/r')     .github.user).toBe('u')
      expect(nameParser('github://u/r')     .github.repo).toBe('r')
      expect(nameParser('github://u/r')     .github.path).toBe('/index.js')
      expect(nameParser('github://u/r/a.md').github.path).toBe('/a.md')
      expect(nameParser('github://u/r/a')   .github.path).toBe('/a')

      expect(nameParser('github://u/r').url)
        .toBe('https://raw.github.com/u/r/master/index.js')

      expect(nameParser('github://u/r/file.js').url)
        .toBe('https://raw.github.com/u/r/master/file.js')

      expect(nameParser('github://u/r/folder/file.js').url)
        .toBe('https://raw.github.com/u/r/master/folder/file.js')
    }))
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

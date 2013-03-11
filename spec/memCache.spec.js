beforeEach(function() {
  global.cl = global.console.log.bind(console)
})

describe('in-memory cache', function() {
  var memCache
  var time
  beforeEach(mod('memCache'))
  beforeEach(mod(function($provide) {
    $provide.value('time', function() {return time})
  }))
  beforeEach(inj(['memCache', function(v) {memCache = v}]))

  it('should CRUD', function() {
    expect(memCache._store).toEqual({})
    expect(memCache.get('a')).toBeUndefined()
    expect(memCache.set('a', 1)).toBe(1)
    expect(memCache.get('a')).toBe(1)
    expect(memCache.set('a', 3)).toBe(3)
    expect(memCache.get('a')).toBe(3)
  })

  it('should keep track of time', function() {
    time = 1
    memCache.set('b', 1)
    expect(memCache._store).toEqual({b:{value:1,set_at:1,got_at:1}})

    time = 2
    memCache.get('b')
    expect(memCache._store).toEqual({b:{value:1,set_at:1,got_at:2}})

    time = 3
    memCache.set('b', 2)
    expect(memCache._store).toEqual({b:{value:2,set_at:3,got_at:3}})
  })
})

di.module('memCache', [])

.factory('memCache', function(time) {
  var memCache = function() {}
  var store = {}

  function get (key) {
    var record = store[key]
    if (record) {
      record.lastGet = time()
      record.hits++
      return record.value
    } else {
      return undefined
    }
  }

  function set (key, val) {
    store[key] =
      { value: val
      , lastSet: time()
      , lastGet: time()
      , hits: 0
      }
    return val
  }

  // Export public API
  memCache._store     = store
  memCache.get        = get
  memCache.set        = set
  return memCache
})

.factory('time', function() {
  return function name () {
    return new Date().toISOString()
  }
})

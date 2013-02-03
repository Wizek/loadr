var di = require('ng-di')

di.module('modules', [])

.factory('resolveSync', function(dependenciesOfSync, _) {
  return function resolveSync (depList) {
    if (!depList.length) {
      return []
    }
    var t = _.map(depList, function(v) {
      return [resolveSync(dependenciesOfSync(v)), v]
    })
    return _.flatten(t)
  }
})

.factory('sourceParser', function() {
  return function(str) {
    var list = []
    // console.log('!!!!!!!!')
    str.replace(/(["'])require (.*)\1/gi, function(match, $1, $2) {
      list.push($2)
    })

    return list
  }
})

.factory('hereDoc', function(_) {
  return function hereDoc(fn) {
    function removeFnLines (str) {
      return _(str.split('\n')).chain().initial().rest().value().join('\n')
    }
    function normalizeIndentation (str) {
      var m = str.match(/^(\s*)/)[0]
      return str.replace(new RegExp('^' + m, 'mg'), '')
    }
    return normalizeIndentation(removeFnLines(fn.toString()))
  }
})

.factory('transc', function() {
  return function() {
    console.log.apply(console, arguments)
    return arguments[arguments.length - 1]
  }
})

.factory('resolve', function(dependenciesOf, _, q, transc) {
  return function resolve (depList) {
    var d = q.defer()

    if (!depList.length) {
      d.resolve([])
      return d.promise
    }

    function onEachBranch (branch) {
      return dependenciesOf(branch)
        .then(resolve)
        .then(function(deps) { return [deps, branch] })
    }

    var promises = _.map(depList, onEachBranch)

    q.all(promises)
      .then(_.flatten)
      .then(d.resolve)
      // .then(transc.bind(this, '+++'))

    return d.promise
  }
})

.factory('reduce', function(_) {
  return function(list) {
    return _.uniq(list)
  }
})

.factory('dependencyMap', function() {
  return {}
})

.factory('dependenciesOf', function(q, dependencyMap) {
  throw Error('unimplemented')
  // return function(name) {
  //   var d = q.defer()
  //   d.resolve(dependencyMap[name])
  //   return d.promise
  // }
})
.factory('dependenciesOfSync', function(dependencyMap) {
  return function(name) {
    return dependencyMap[name]
  }
})

// .factory('q', function() {
//   return require('q')
// })
.factory('_', function() {
  return require('underscore')
})

// var cc = 1

// exports.resolve = resolve

.factory('onNextTick', function() {
  return process.nextTick.bind(process)
})

.value('isFunction', function isFunction(value) {
  return typeof value == 'function'
})
.factory('forEach', function(isFunction) {
  return function forEach(obj, iterator, context) {
    var key;
    if (obj) {
      if (isFunction(obj)){
        for (key in obj) {
          if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context);
      } else if (isObject(obj) && isNumber(obj.length)) {
        for (key = 0; key < obj.length; key++)
          iterator.call(context, obj[key], key);
      } else {
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      }
    }
    return obj;
  }
})

.factory('q', function(onNextTick, forEach, isFunction) {
  return qFactory(onNextTick, function(x) {throw x})

  function qFactory(nextTick, exceptionHandler) {

    /**
     * @ngdoc
     * @name ng.$q#defer
     * @methodOf ng.$q
     * @description
     * Creates a `Deferred` object which represents a task which will finish in the future.
     *
     * @returns {Deferred} Returns a new instance of deferred.
     */
    var defer = function() {
      var pending = [],
          value, deferred;

      deferred = {

        resolve: function(val) {
          if (pending) {
            var callbacks = pending;
            pending = undefined;
            value = ref(val);

            if (callbacks.length) {
              nextTick(function() {
                var callback;
                for (var i = 0, ii = callbacks.length; i < ii; i++) {
                  callback = callbacks[i];
                  value.then(callback[0], callback[1]);
                }
              });
            }
          }
        },


        reject: function(reason) {
          deferred.resolve(reject(reason));
        },


        promise: {
          then: function(callback, errback) {
            var result = defer();

            var wrappedCallback = function(value) {
              try {
                result.resolve((callback || defaultCallback)(value));
              } catch(e) {
                exceptionHandler(e);
                result.reject(e);
              }
            };

            var wrappedErrback = function(reason) {
              try {
                result.resolve((errback || defaultErrback)(reason));
              } catch(e) {
                exceptionHandler(e);
                result.reject(e);
              }
            };

            if (pending) {
              pending.push([wrappedCallback, wrappedErrback]);
            } else {
              value.then(wrappedCallback, wrappedErrback);
            }

            return result.promise;
          }
        }
      };

      return deferred;
    };


    var ref = function(value) {
      if (value && value.then) return value;
      return {
        then: function(callback) {
          var result = defer();
          nextTick(function() {
            result.resolve(callback(value));
          });
          return result.promise;
        }
      };
    };


    /**
     * @ngdoc
     * @name ng.$q#reject
     * @methodOf ng.$q
     * @description
     * Creates a promise that is resolved as rejected with the specified `reason`. This api should be
     * used to forward rejection in a chain of promises. If you are dealing with the last promise in
     * a promise chain, you don't need to worry about it.
     *
     * When comparing deferreds/promises to the familiar behavior of try/catch/throw, think of
     * `reject` as the `throw` keyword in JavaScript. This also means that if you "catch" an error via
     * a promise error callback and you want to forward the error to the promise derived from the
     * current promise, you have to "rethrow" the error by returning a rejection constructed via
     * `reject`.
     *
     * <pre>
     *   promiseB = promiseA.then(function(result) {
     *     // success: do something and resolve promiseB
     *     //          with the old or a new result
     *     return result;
     *   }, function(reason) {
     *     // error: handle the error if possible and
     *     //        resolve promiseB with newPromiseOrValue,
     *     //        otherwise forward the rejection to promiseB
     *     if (canHandle(reason)) {
     *      // handle the error and recover
     *      return newPromiseOrValue;
     *     }
     *     return $q.reject(reason);
     *   });
     * </pre>
     *
     * @param {*} reason Constant, message, exception or an object representing the rejection reason.
     * @returns {Promise} Returns a promise that was already resolved as rejected with the `reason`.
     */
    var reject = function(reason) {
      return {
        then: function(callback, errback) {
          var result = defer();
          nextTick(function() {
            result.resolve((errback || defaultErrback)(reason));
          });
          return result.promise;
        }
      };
    };


    /**
     * @ngdoc
     * @name ng.$q#when
     * @methodOf ng.$q
     * @description
     * Wraps an object that might be a value or a (3rd party) then-able promise into a $q promise.
     * This is useful when you are dealing with on object that might or might not be a promise, or if
     * the promise comes from a source that can't be trusted.
     *
     * @param {*} value Value or a promise
     * @returns {Promise} Returns a single promise that will be resolved with an array of values,
     *   each value coresponding to the promise at the same index in the `promises` array. If any of
     *   the promises is resolved with a rejection, this resulting promise will be resolved with the
     *   same rejection.
     */
    var when = function(value, callback, errback) {
      var result = defer(),
          done;

      var wrappedCallback = function(value) {
        try {
          return (callback || defaultCallback)(value);
        } catch (e) {
          exceptionHandler(e);
          return reject(e);
        }
      };

      var wrappedErrback = function(reason) {
        try {
          return (errback || defaultErrback)(reason);
        } catch (e) {
          exceptionHandler(e);
          return reject(e);
        }
      };

      nextTick(function() {
        ref(value).then(function(value) {
          if (done) return;
          done = true;
          result.resolve(ref(value).then(wrappedCallback, wrappedErrback));
        }, function(reason) {
          if (done) return;
          done = true;
          result.resolve(wrappedErrback(reason));
        });
      });

      return result.promise;
    };


    function defaultCallback(value) {
      return value;
    }


    function defaultErrback(reason) {
      return reject(reason);
    }


    /**
     * @ngdoc
     * @name ng.$q#all
     * @methodOf ng.$q
     * @description
     * Combines multiple promises into a single promise that is resolved when all of the input
     * promises are resolved.
     *
     * @param {Array.<Promise>} promises An array of promises.
     * @returns {Promise} Returns a single promise that will be resolved with an array of values,
     *   each value coresponding to the promise at the same index in the `promises` array. If any of
     *   the promises is resolved with a rejection, this resulting promise will be resolved with the
     *   same rejection.
     */
    function all(promises) {
      var deferred = defer(),
          counter = promises.length,
          results = [];

      if (counter) {
        forEach(promises, function(promise, index) {
          ref(promise).then(function(value) {
            if (index in results) return;
            results[index] = value;
            if (!(--counter)) deferred.resolve(results);
          }, function(reason) {
            if (index in results) return;
            deferred.reject(reason);
          });
        });
      } else {
        deferred.resolve(results);
      }

      return deferred.promise;
    }

    return {
      defer: defer,
      reject: reject,
      when: when,
      all: all
    };
  }
})

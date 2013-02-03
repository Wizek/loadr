void function (ctx) {
  ctx.c = function() {
    var l = arguments.length,
      message = 'Callback called with ' + l +
        ' argument' + (l === 1 ? '' : 's') + (l > 0 ? ':\n' : '');

    for (var i = 0; i < 10; i++) {
      if (i < arguments.length) {
        ctx['_' + i] = arguments[i];
        message += '_' + i + ' = ' + arguments[i] + '\n';
      } else {
        if (ctx.hasOwnProperty('_' + i)) {
          delete ctx['_' + i];
        }
      }
    }
    console.log(message);
  }
}(global)

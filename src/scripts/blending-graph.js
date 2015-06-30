function lerp(from, to, perc) {
  return (to - from) * perc + from;
}

function extend(base /* , args... */) {
  var src, i;
  for (i = 1; i < arguments.length; i++) {
    src = arguments[i];
    if (src) {
      Object.keys(src).forEach(function (k) {
        base[k] = src[k];
      });
    }
  }
  return base;
}

function createBlendGraph(canvas, baseOpts) {
  return function (opts) {
    var newOpts = extend({}, baseOpts, opts);
    drawBlendGraph(canvas, newOpts);
  };
}

function drawBlendGraph(canvas, opts) {
  var style = getComputedStyle(canvas);
  var width = canvas.width = parseInt(style.width, 10) || 100;
  var height = canvas.height = parseInt(style.height, 10) || 50;
  var ctx = canvas.getContext('2d');

  var from = opts.defs.from;
  var to = opts.defs.to;
  var defIdx = opts.type === 'alpha' ? 1 : 0;
  var x, y, perc, col, alpha;

  var yPos = function (val) {
    return (1 - val) * height;
  };

  // Draw the background colour
  if (opts.type !== 'alpha') {
    ctx.fillStyle = opts.colour.bg;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (x = 0; x <= width; x++) {
      perc = x / width;
      col = lerp(from[defIdx], to[defIdx], perc);
      alpha = lerp(from[1], to[1], perc);
      if (opts.isPremul) {
        y = col + (1 - alpha);
      } else {
        y = (col * alpha) + (1 - alpha);
      }
      ctx.lineTo(x, yPos(y));
    }
    ctx.lineTo(width, height);
    ctx.fill();
  }

  // Draw the primary colour
  ctx.fillStyle = opts.colour.source;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, yPos(from[defIdx]));
  ctx.lineTo(width, yPos(to[defIdx]));
  ctx.lineTo(width, height);
  ctx.fill();

  // Draw the post-multiplied mark
  if (opts.type !== 'alpha') {
    ctx.strokeStyle = opts.colour.sourcePost;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (x = 0; x <= width; x++) {
      perc = x / width;
      col = lerp(from[defIdx], to[defIdx], perc);
      alpha = lerp(from[1], to[1], perc);
      if (opts.isPremul) {
        y = col;
      } else {
        y = col * alpha;
      }
      ctx.lineTo(x, yPos(y));
    }
    ctx.lineTo(width, height);
    ctx.stroke();
  }

  // 50% marker line
  if (opts.showMarker) {
    ctx.strokeStyle = 'hsl(240, 100%, 50%)';
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
  }
}
drawBlendGraph.defs = {
  post: {from: [1, 0.5], to: [0, 0]},
  pre: {from: [0.5, 0.5], to: [0, 0]},
  post2: {from: [1, 1], to: [0, 0.2]},
  pre2: {from: [1, 1], to: [0, 0.2]},
  post3: {from: [0, 1], to: [1, 0.2]},
  pre3: {from: [0, 1], to: [0.2, 0.2]},
};
drawBlendGraph.colours = {
  red: {source: 'hsl(0, 100%, 50%)', bg: 'hsl(0, 100%, 80%)', sourcePost: 'hsl(0, 80%, 20%)'},
  blue: {source: 'hsl(240, 90%, 70%)', bg: 'hsl(240, 90%, 80%)', sourcePost: 'hsl(240, 60%, 20%)'},
  alpha: {source: '#666'}
};

var each = Array.prototype.forEach;

function setupGraphs(selector) {
  each.call(document.querySelectorAll(selector), function (container) {
    var graphs = [];

    each.call(container.querySelectorAll('canvas'), function (canvas) {
      var defsId = canvas.getAttribute('data-defs');
      if (!defsId) {
        return;
      }
      var defBits = defsId.split('-');
      var defValues = drawBlendGraph.defs[defBits[0]];
      if (!defValues) {
        return;
      }
      var isPremul = defBits[0].substr(0, 3) === 'pre';
      var colour = drawBlendGraph.colours[defBits[1]];

      var graph = createBlendGraph(canvas, {
        type: defBits[1],
        colour: colour,
        isPremul: isPremul,
        defs: defValues
      });
      graphs.push(graph);
      graph();

      canvas.addEventListener('click', function () {
        graphs.forEach(function (draw) {
          draw({showMarker: true});
        });
      }, false);
    });
  });
}

module.exports = setupGraphs;


//// DEFINITIONS

var rgbaBits = ['r', 'g', 'b', 'a'];

var channelColours = {
  r: {source: 'hsl(0, 90%, 50%)', bg: 'hsl(0, 100%, 80%)', sourcePost: 'hsl(0, 80%, 20%)'},
  a: {source: '#666'}
};

var fullGraph = {source: 1, sourcePost: 1, bg: 1};
var demoDefs = {
  'red-trans-post': {
    from: [255, 0, 0, 1],
    to:   [  0, 0, 0, 0],
    states: [
      {}, // Empty state to start
      { post: {source: 1, anim: 'source'} },
      { post: {source: 1, sourcePost: 1, anim: 'sourcePost'} },
      { post: {source: 1, sourcePost: 1, bg: 1, anim: 'bg'} },
    ]
  },
  'red-trans-pre': {
    from: [255, 0, 0, 1],
    to:   [  0, 0, 0, 0],
    states: [
      { post: fullGraph },
      {
        post: fullGraph,
        pre:  {source: 1, sourcePost: 1, anim: ['source', 'sourcePost']}
      },
      {
        post: fullGraph,
        pre:  {source: 1, sourcePost: 1, bg: 1, anim: 'bg'}
      },
    ]
  }
};


//// HELPERS

var each = Array.prototype.forEach;

function lerp(from, to, perc) {
  return (to - from) * perc + from;
}

function normaliseRgba(value, i) {
  return i < 3 ? value / 255 : value;
}

function rgba(channels, withBr) {
  var join = function () {
    return channels.slice.apply(channels, arguments).join(', ');
  };

  var value = withBr ?
    join(0, 2) + ',<br>' + join(2):
    join();
  return 'rgba(' + value + ')';
}

// Getting canvas.width/height isn't accurate if the size is set via CSS
function getCanvasSize(canvas) {
  var style = getComputedStyle(canvas);
  var width = canvas.width = parseInt(style.width, 10) || 100;
  var height = canvas.height = parseInt(style.height, 10) || 50;
  return {
    width: width,
    height: height
  };
}

function getSamples(values, percentage) {
  var p = Math.ceil(percentage * values.length);
  return values.slice(0, p);
}


//// MAIN METHODS

// Draw the example gradients at the top of the slide
function drawExampleGradients(canvas, defs) {
  var from = defs.from;
  var to = defs.to;
  var size = getCanvasSize(canvas);
  var w = size.width;
  var h = size.height / 2;
  var ctx = canvas.getContext('2d');

  // Premul (assumes running in a non-Safari browser)
  canvas.style.background = 'no-repeat linear-gradient(to right, ' + rgba(from) + ', ' + rgba(to) + ')';
  // Postmul
  var grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, rgba(from));
  grad.addColorStop(1, rgba(to));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// Fill in the rgba() definitions either side of the example gradients
function addValueText(container, defs) {
  each.call(container.querySelectorAll('.colour-def'), function (valueHolder, i) {
    var value = i === 0 ? defs.from : defs.to;
    var code = document.createElement('code');
    code.innerHTML = rgba(value, true);
    valueHolder.appendChild(code);
  });
}

// Draw the colour graph for a single channel
function createBlendGraph(canvas, opts) {
  var size = getCanvasSize(canvas);
  var width = size.width;

  var from = opts.defs.from.map(normaliseRgba);
  var to = opts.defs.to.map(normaliseRgba);
  var channel = opts.channel;
  var chIdx = rgbaBits.indexOf(channel);
  var isColourChannel = channel !== 'a';
  var isPremul = opts.type === 'pre';

  var x, perc, col, alpha, multiplied, computed;

  // Precalculation of values
  var values = {
    linear: [],
    multiplied: [],
    computed: []
  };
  for (x = 0; x <= width; x++) {
    perc = x / width;
    col = lerp(from[chIdx], to[chIdx], perc);
    alpha = lerp(from[3], to[3], perc);

    values.linear.push(col);
    if (isColourChannel) {
      if (isPremul) {
        multiplied = col;
      } else {
        multiplied = col * alpha;
      }
      computed = multiplied + (1 - alpha);
      values.multiplied.push(multiplied);
      values.computed.push(computed);
    }
  }
  canvas.opts = opts;
  canvas.values = values;
}

function drawBlendGraphs(graphs, state) {
  each.call(graphs, function (canvas) {
    drawBlendGraphState(canvas, state[canvas.opts.type] || {});
  });
}

function drawBlendGraphState(canvas, state) {
  var width = canvas.width;
  var height = canvas.height;
  var ctx = canvas.getContext('2d');

  var channel = canvas.opts.channel;
  var colours = channelColours[channel];
  var isColourChannel = channel !== 'a';

  var anims = {};
  if (state.anim) {
    anims = [].concat(state.anim).reduce(function (obj, field) {
      obj[field] = true;
      return obj;
    }, {});
  }

  var yPos = function (val) {
    return (1 - val) * height;
  };

  var drawPart = function (values, percentage, isOpenPath) {
    var samples = getSamples(values, percentage);
    var count = samples.length;
    ctx.beginPath();
    ctx.moveTo(0, yPos(samples[0]));
    for (var x = 1; x <= count; x++) {
      ctx.lineTo(x, yPos(samples[x]));
    }
    if (!isOpenPath) {
      ctx.lineTo(count - 1, height);
      ctx.lineTo(0, height);
      ctx.closePath();
    }
  };

  var animTimeInMillis = 1000;
  var startTime;

  var doTheDrawingNow = function (perfNow) {
    var animPerc = 0;
    if (startTime === undefined) {
      startTime = performance.now();
    } else {
      animPerc = (perfNow - startTime) / animTimeInMillis;
    }

    ctx.clearRect(0, 0, width, height);

    // Draw the background colour
    if ('bg' in state && isColourChannel) {
      ctx.fillStyle = colours.bg;
      drawPart(canvas.values.computed, anims.bg ? animPerc : state.bg);
      ctx.fill();
    }

    // Draw the primary colour
    if ('source' in state) {
      ctx.fillStyle = colours.source;
      drawPart(canvas.values.linear, anims.source ? animPerc : state.source);
      ctx.fill();
    }

    // Draw the post-multiplied mark
    if ('sourcePost' in state && isColourChannel) {
      ctx.strokeStyle = colours.sourcePost;
      ctx.lineWidth = 2;
      drawPart(canvas.values.multiplied, anims.sourcePost ? animPerc : state.sourcePost, true);
      ctx.stroke();
    }

    if (animPerc <= 1) {
      requestAnimationFrame(doTheDrawingNow);
    }
  };

  requestAnimationFrame(doTheDrawingNow);
}


//// INITIALISER

function setupGraphs(selector) {
  each.call(document.querySelectorAll(selector), function (container) {
    var defId = container.getAttribute('data-demo-def');
    var defs = defId ? demoDefs[defId] : null;
    if (!defs) {
      return;
    }

    var graphs = [];
    each.call(container.querySelectorAll('canvas'), function (canvas) {
      if (canvas.classList.contains('example')) {
        drawExampleGradients(canvas, defs);
        addValueText(container, defs);
      } else {
        var typeBits = (canvas.getAttribute('data-type') || '').split('-');
        var channel = typeBits[0] || 'r';
        var prePost = typeBits[1] || 'post';
        createBlendGraph(canvas, {
          type: prePost,
          channel: channel,
          defs: defs
        });
        graphs.push(canvas);
      }
    });

    // GREAT BIG LAZY HACK
    var frag = document.createDocumentFragment();
    defs.states.forEach(function (_, i) {
      var el = document.createElement('div');
      el.className = 'linked-step-hack';
      el.setAttribute('data-linked-step', i);
      frag.appendChild(el);
    });
    container.appendChild(frag);

    container.defs = defs;
    container.graphs = graphs;
  });

  var graphPlugin = function () {
    return function (deck) {
      var targets = deck.slides.map(function (slide) {
        return slide.graphs && slide;
      });

      deck.on('linked-step-change', function (event) {
        var slideIndex = event.slide;
        var target = targets[slideIndex];
        if (!target) {
          return;
        }

        var defs = target.defs;
        var stateIndex = event.step;
        var state = defs.states[stateIndex];
        if (state) {
          drawBlendGraphs(target.graphs, state);
        }
      });
    };
  };

  return graphPlugin;
}

module.exports = setupGraphs;

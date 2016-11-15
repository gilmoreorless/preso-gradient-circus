//// DEFINITIONS

var rgbaBits = ['r', 'g', 'b', 'a'];

var channelColours = {
  r: {source: 'hsl(0, 100%, 50%)', bg: 'hsl(0, 100%, 80%)', sourcePost: 'hsl(0, 80%, 20%)'},
  a: {source: '#666'}
};

var demoDefs = {
  'red-black': {
    from: [255, 0, 0, 1],
    to:   [  0, 0, 0, 1]
  },
  'red-trans': {
    from: [255, 0, 0, 1],
    to:   [  0, 0, 0, 0]
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
function drawBlendGraph(canvas, opts) {
  console.log('drawBlendGraph', canvas, opts);
  var size = getCanvasSize(canvas);
  var width = size.width;
  var height = size.height;
  var ctx = canvas.getContext('2d');

  var from = opts.defs.from.map(normaliseRgba);
  var to = opts.defs.to.map(normaliseRgba);
  var channel = opts.channel;
  var chIdx = rgbaBits.indexOf(channel);
  var isColourChannel = channel !== 'a';
  var colours = channelColours[channel];
  var x, y, perc, col, alpha;

  var yPos = function (val) {
    return (1 - val) * height;
  };

  // Draw the background colour
  if (isColourChannel) {
    ctx.fillStyle = colours.bg;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (x = 0; x <= width; x++) {
      perc = x / width;
      col = lerp(from[chIdx], to[chIdx], perc);
      alpha = lerp(from[3], to[3], perc);
      // if (opts.isPremul) {
      //   y = col + (1 - alpha);
      // } else {
        y = (col * alpha) + (1 - alpha);
      // }
      ctx.lineTo(x, yPos(y));
    }
    ctx.lineTo(width, height);
    ctx.fill();
  }

  // Draw the primary colour
  ctx.fillStyle = colours.source;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, yPos(from[chIdx]));
  ctx.lineTo(width, yPos(to[chIdx]));
  ctx.lineTo(width, height);
  ctx.fill();

  // Draw the post-multiplied marker line
  if (isColourChannel) {
    ctx.strokeStyle = colours.sourcePost;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (x = 0; x <= width; x++) {
      perc = x / width;
      col = lerp(from[chIdx], to[chIdx], perc);
      alpha = lerp(from[3], to[3], perc);
      // if (opts.isPremul) {
      //   y = col;
      // } else {
        y = col * alpha;
      // }
      ctx.lineTo(x, yPos(y));
    }
    ctx.lineTo(width, height);
    ctx.stroke();
  }
}


//// INITIALISER

function setupGraphs(selector) {
  each.call(document.querySelectorAll(selector), function (container) {
    var defId = container.getAttribute('data-demo-def');
    var defs = defId ? demoDefs[defId] : null;
    if (!defs) {
      return;
    }

    each.call(container.querySelectorAll('canvas'), function (canvas) {
      if (canvas.classList.contains('example')) {
        drawExampleGradients(canvas, defs);
        addValueText(container, defs);
      } else {
        var typeBits = (canvas.getAttribute('data-type') || '').split('-');
        var channel = typeBits[0] || 'r';
        var prePost = typeBits[1] || 'post';
        drawBlendGraph(canvas, {
          type: prePost,
          channel: channel,
          defs: defs
        });
      }
    });
  });
}

module.exports = setupGraphs;

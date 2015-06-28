// Setup
var each = Array.prototype.forEach;

each.call(document.querySelectorAll('[data-code-colour]'), function (elem) {
  var colour = elem.textContent.trim();
  var preview = document.createElement('span');
  preview.className = 'code-colour-preview';
  preview.style.backgroundColor = colour;
  elem.insertBefore(preview, elem.firstChild);
});

function updateBlendDemo(stage) {
  var colours = {
    source: [255, 0, 0, 0.6],
    dest: [255, 255, 255, 1],
    output: [, , , 1]
  };
  var i;

  stage = +stage || 0;
  if (stage) {
    if (stage >= 1) {
      for (i = 0; i < 3; i++) {
        colours.source[i] *= colours.source[3];
      }
    }
    if (stage >= 2) {
      for (i = 0; i < 4; i++) {
        colours.dest[i] *= (1 - colours.source[3]);
      }
    }
  }

  for (i = 0; i < 3; i++) {
    colours.output[i] = colours.source[i] + colours.dest[i];
  }

  var bits = ['red', 'green', 'blue', 'alpha'];
  each.call(document.querySelectorAll('.demo-blend-basic tr'), function (row) {
    var bit = row.className.replace('channel-', '');
    var bitIdx = bits.indexOf(bit);
    if (bitIdx === -1) {
      return;
    }
    each.call(row.children, function (cell) {
      var type = cell.getAttribute('data-type');
      if (!type) {
        return;
      }
      var code = cell.querySelector('code');
      var fill = cell.querySelector('.channel-fill');
      var value = colours[type][bitIdx];
      if (code) {
        code.textContent = value;
      }
      if (fill) {
        var perc = bit === 'alpha' ? value : value / 255;
        fill.style.height = (perc * 100) + '%';
      }
    });
  });
}
updateBlendDemo();

function lerp(from, to, perc) {
  return (to - from) * perc + from;
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
    ctx.fillStyle = opts.colour[1];
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
  ctx.fillStyle = opts.colour[0];
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, yPos(from[defIdx]));
  ctx.lineTo(width, yPos(to[defIdx]));
  ctx.lineTo(width, height);
  ctx.fill();

  // 50% marker line
  // ctx.strokeStyle = 'hsl(240, 100%, 50%)';
  // ctx.beginPath();
  // ctx.moveTo(width / 2, 0);
  // ctx.lineTo(width / 2, height);
  // ctx.stroke();
}
drawBlendGraph.defs = {
  post: {from: [1, 0.5], to: [0, 0]},
  pre: {from: [0.5, 0.5], to: [0, 0]},
  post2: {from: [1, 1], to: [0, 0.2]},
  pre2: {from: [1, 1], to: [0, 0.2]},
};
drawBlendGraph.colours = {
  red: ['hsl(0, 100%, 50%)', 'hsl(0, 100%, 80%)'],
  alpha: ['#666', '#aaa']
};
each.call(document.querySelectorAll('.demo-blend-gradient canvas'), function (canvas) {
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

  drawBlendGraph(canvas, {
    type: defBits[1],
    colour: colour,
    isPremul: isPremul,
    defs: defValues
  });
});


// Default bespoke plugins
var bespoke = require('bespoke'),
  classes = require('bespoke-classes'),
  state = require('bespoke-state'),
  keys = require('bespoke-keys'),
  touch = require('bespoke-touch'),
  backdrop = require('bespoke-backdrop'),
  scale = require('bespoke-scale'),
  hash = require('bespoke-hash');

// Custom plugins
var linkedBullets = require('./plugin-linked-steps');

// Grand finale
var generateLogo = require('./generate-logo');
var logoHolder = document.querySelector('.demo-logo .showcase-target');
generateLogo(logoHolder);

// Background image layering demos
var bgImageShowcase = require('./bgimage-showcase');
var showcasePlugin = function () {
  return function (deck) {
    var targets = deck.slides.map(function (slide) {
      var hasShowcase = slide.hasAttribute('data-bgimage-showcase');
      if (hasShowcase) {
        var target = slide.querySelector('.showcase-target');
        if (target) {
          return target;
        }
      }
    });

    deck.on('activate', function (event) {
      var target = targets[event.index];
      if (target) {
        bgImageShowcase.inspect(target, {
          container: target.parentNode,
          padding: 40,
          startMode: target.getAttribute('data-showcase-start-mode')
        });
      }
    });

    deck.on('deactivate', function (event) {
      var target = targets[event.index];
      if (target) {
        bgImageShowcase.stop();
      }
    });
  };
};

// Bespoke.js
var deck = bespoke.from('article', [
  classes(),
  state(),
  keys(),
  touch(),
  linkedBullets(),
  showcasePlugin(),
  backdrop(),
  scale(),
  hash()
]);

// Various Lea Verou libraries loaded via bower_components
require('prism');
require('prefixfree');
require('conic-gradient');

// Custom events
deck.on('linked-step-change', function (event) {
  updateBlendDemo(event.step);
});


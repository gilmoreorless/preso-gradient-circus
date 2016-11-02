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

// Blending colour graphs
var blendingGraph = require('./blending-graph');
blendingGraph('.demo-blend-gradient');

// Grand finale
var generateLogo = require('./generate-logo');
var logoHolder = document.querySelector('.demo-logo .showcase-target');
if (!logoHolder.classList.contains('redacted')) {
  generateLogo(logoHolder);
}

// "Deep dive" images that open iframes
var body = document.body;
var frameHolder = document.createElement('div');
frameHolder.className = 'deep-dive-frame-holder';
body.appendChild(frameHolder);

var ret = document.createElement('a');
ret.className = 'deep-dive-return';
ret.addEventListener('click', hideDeepDive, false);
frameHolder.appendChild(ret);

function showDeepDive(iframe) {
  body.classList.add('show-sub-frame');
  iframe.classList.add('visible');
}

function hideDeepDive() {
  body.classList.remove('show-sub-frame');
  setTimeout(function () {
    each.call(frameHolder.querySelectorAll('.visible'), function (frame) {
      frame.classList.remove('visible');
    });
  }, 1500);
}

document.addEventListener('keyup', function (e) {
  if (e.keyCode === 27) { // Escape
    hideDeepDive();
  }
}, true);

each.call(document.querySelectorAll('[data-href]'), function (img) {
  var href = img.getAttribute('data-href');

  // Wrap the image with a link
  var a = document.createElement('a');
  a.className = 'deep-dive-link';
  a.href = href;
  img.parentNode.insertBefore(a, img);
  a.appendChild(img);

  // Create an iframe
  var iframe = document.createElement('iframe');
  iframe.onload = function () {
    console.log('LOADED', iframe);
  };
  iframe.src = href;
  iframe.className = 'deep-dive-frame';
  frameHolder.appendChild(iframe);

  a.addEventListener('click', function (e) {
    e.preventDefault();
    showDeepDive(iframe);
  }, false);
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
          startMode: target.getAttribute('data-showcase-start-mode'),
          timing: target.getAttribute('data-showcase-timing')
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

// Play/pause videos
document.addEventListener('keyup', function (e) {
  if (e.keyCode === 80) {  // 'P'
    var index = deck.slide();
    var slide = deck.slides[index];
    var video = slide.querySelector('video');
    if (video) {
      var isPaused = video.paused;
      video[isPaused ? 'play' : 'pause']();
    }
  }
}, false);

// Autoplay videos and image swaps
var autostop = {};
var swapping = {};

deck.on('activate', function (event) {
  var video = event.slide.querySelector('video[data-autoplay-slide]');
  if (video) {
    video.play();
    autostop[event.index] = video;
  }
  var img = event.slide.querySelector('img[data-swap-src]');
  if (img) {
    img.swapSrc1 = img.src;
    img.swapSrc2 = img.getAttribute('data-swap-src');
    var cache = new Image();
    cache.src = img.swapSrc2;

    var timeout = (parseInt(img.getAttribute('data-swap-time'), 10) || 1) * 1000;
    var timer = setInterval(function () {
      img.src = (img.src === img.swapSrc1) ? img.swapSrc2 : img.swapSrc1;
    }, timeout);

    swapping[event.index] = {img: img, timer: timer};
  }
});
deck.on('deactivate', function (event) {
  if (autostop[event.index]) {
    autostop[event.index].pause();
    delete autostop[event.index];
  }
  if (swapping[event.index]) {
    clearInterval(swapping[event.index].timer);
    var img = swapping[event.index].img;
    img.src = img.swapSrc1;
    delete swapping[event.index];
  }
});

// Analytics
var _gaq = window._gaq = _gaq || [];
if (~location.hostname.indexOf('github.io')) {
  _gaq.push(['_setAccount', 'UA-8341018-3']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
}

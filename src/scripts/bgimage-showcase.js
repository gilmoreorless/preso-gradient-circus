var bgImageShowcase = module.exports = {
  _active: false,
  _inspected: null,
  _showcase: null
};


/*** PUBLIC API ***/

bgImageShowcase.start = function () {
  if (!bgImageShowcase._active) {
    document.addEventListener('keypress', showcaseKeyHandler, false);
    bgImageShowcase._active = true;
  }
};

bgImageShowcase.stop = function () {
  bgImageShowcase._active = false;
  bgImageShowcase._inspected = null;
  if (bgImageShowcase._showcase) {
    bgImageShowcase._showcase.destroy();
  }
  bgImageShowcase._showcase = null;
  document.removeEventListener('keypress', showcaseKeyHandler, false);
};

bgImageShowcase.inspect = function (elem, options) {
  bgImageShowcase.start();
  bgImageShowcase._inspected = elem;
  if (bgImageShowcase._showcase) {
    bgImageShowcase._showcase.destroy();
  }
  bgImageShowcase._showcase = new Showcase(elem, options);
};


/*** INTERNAL UTILITES ***/

function showcaseKeyHandler(e) {
  if (
    bgImageShowcase._showcase &&
    e.keyCode >= 49 &&  // Key = 1
    e.keyCode <= 52 &&  // Key = 4
    !e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey  // No modifiers
  ) {
    var modes = {
      49: 'MODE_COMBINED',
      50: 'MODE_3D',
      51: 'MODE_3D_EXPANDED',
      52: 'MODE_EXPLODED'
    };
    bgImageShowcase._showcase.setMode(modes[e.keyCode]);
  }
}

function trim(str) {
  return str.trim();
}


/*** SHOWCASE HELPERS ***/

/**
 * Super-basic parser for `background-image` values.
 * Ideally I'd just delegate to GradientParser, but it only handles
 * gradient syntax (so breaks on actual images) and has bugs with
 * some valid radial-gradient values;
 */
function parseImages(cssText) {
  // return GradientParser.parse(cssText);

  var images = [];
  var tokens = /[,\(\)]/;
  var parens = 0;
  var buffer = '';

  while (cssText.length) {
    var match = tokens.exec(cssText);
    if (!match) {
      break;
    }
    var char = match[0];
    var ignoreChar = false;
    switch (char) {
      case ',':
        if (!parens) {
          images.push(buffer.trim());
          buffer = '';
          ignoreChar = true;
        }
        break;
      case '(':
        parens++;
        break;
      case ')':
        parens--;
        break;
    }

    var index = match.index + 1;
    buffer += cssText.slice(0, ignoreChar ? index - 1 : index);
    cssText = cssText.slice(index);
  }

  if (buffer.length || cssText.length) {
    images.push((buffer + cssText).trim());
  }

  return images;
}

function parseStyles(computedStyle) {
  var images = [];
  var bgColor = computedStyle.backgroundColor;
  var bgImage = computedStyle.backgroundImage;
  var bgPos = computedStyle.backgroundPosition;
  var bgRepeat = computedStyle.backgroundRepeat;
  var bgSize = computedStyle.backgroundSize;

  var parsed = parseImages(bgImage);
  var positions = bgPos.split(',').map(trim);
  var sizes = bgSize.split(',').map(trim);
  var repeat = bgRepeat.split(',').map(trim);

  for (var i = 0, ii = parsed.length; i < ii; i++) {
    var iPos = i % positions.length;
    var iSize = i % sizes.length;
    var iRepeat = i % repeat.length;
    images.push({
      // image: GradientParser.stringify(parsed[i]),
      image: parsed[i],
      position: positions[iPos],
      size: sizes[iSize],
      repeat: repeat[iRepeat]
    });
  }
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    images.push({
      color: bgColor
    });
  }

  return images;
}

function buildExploded() {
  this.container.style.width = this.dims.width;
  this.container.style.height = this.dims.height;

  var i = this.images.length;
  while (i--) {
    var image = this.images[i];
    var elem = document.createElement('div');
    elem.className = 'bgimage-showcase-layer';
    elem.style.width = this.dims.width;
    elem.style.height = this.dims.height;
    if (image.color) {
      elem.style.backgroundColor = image.color;
    } else {
      elem.style.backgroundImage = image.image;
      elem.style.backgroundPosition = image.position;
      elem.style.backgroundSize = image.size;
      elem.style.backgroundRepeat = image.repeat;
    }
    this.container.appendChild(elem);
    this.layers.push(elem);
  }
}

function runLayout() {
  var layout = Showcase.layouts[this.mode];
  if (layout) {
    this.container.className = 'bgimage-showcase-container' +
      ' bgimage-showcase-timing-' + this.timing +
      ' bgimage-showcase-mode-' + this.mode;
    layout.call(this);
  }
}


/*** SHOWCASE CLASS ***/

var PADDING = 20;

function Showcase(elem, options) {
  this.options = options || {};
  this.source = elem;
  this.mode = this.options.startMode || Showcase.modes.MODE_COMBINED;
  this.padding = this.options.padding || PADDING;
  this.timing = this.options.timing || 'fast';
  this.container = null;
  this.layers = [];
  this._style = '';
  this.dims = {};
  this.images = [];

  this.setup();
  this.refresh();
}

Showcase.modes = {
  MODE_COMBINED: 'combined',
  MODE_EXPLODED: 'exploded',
  MODE_3D: '3d',
  MODE_3D_EXPANDED: '3d-expanded'
};

Showcase.prototype.setMode = function (mode) {
  if (Showcase.modes.hasOwnProperty(mode)) {
    mode = Showcase.modes[mode];
  }
  this.mode = mode;
  this.refresh();
};

Showcase.prototype.setup = function () {
  if (this.container) {
    return false;
  }
  var optParent = this.options.container;
  // var bounds = this.source.getBoundingClientRect();
  this.container = document.createElement('div');
  this.container.className = 'bgimage-showcase-container bgimage-showcase-timing-' + this.timing;
  this.container.style.left = (this.source.offsetLeft - this.padding) + 'px';
  this.container.style.top = (this.source.offsetTop - this.padding) + 'px';
  this.container.style.padding = this.padding + 'px';
  (optParent || document.body).appendChild(this.container);
  if (optParent) {
    optParent.classList.add('bgimage-showcase-active');
  }
  return true;
};

Showcase.prototype.refresh = function () {
  // Inspect the element's gradient
  var style = getComputedStyle(this.source);
  if (style.background !== this._style) {
    this._style = style.background;
    this.dims = {
      width: style.width,
      height: style.height
    };
    this.images = parseStyles(style);
    this.clean();
    buildExploded.call(this);
  }
  runLayout.call(this);
};

Showcase.prototype.clean = function () {
  this.layers = [];
  this.container.innerHTML = '';
};

Showcase.prototype.destroy = function () {
  this.clean();
  this.container.parentNode.removeChild(this.container);
  if (this.options.container) {
    this.options.container.classList.remove('bgimage-showcase-active');
  }
};


// LAYOUTS

Showcase.layouts = {};

Showcase.layouts[Showcase.modes.MODE_COMBINED] = function () {
  this.container.style.height = this.dims.height;
  this.layers.forEach(function (layer) {
    layer.style.transform = 'translate(0)';
  });
};

Showcase.layouts[Showcase.modes.MODE_EXPLODED] = function () {
  var height = parseFloat(this.dims.height) || 0;
  var yPos = function (count) {
    return ((height + this.padding) * count) + 'px';
  };
  var count = this.layers.length;
  this.container.style.height = yPos.call(this, count);
  var i = count;
  while (i--) {
    this.layers[i].style.transform = 'translateY(' + yPos.call(this, count - i - 1) + ')';
  }
};

function ShowcaseLayout3D(multiplier) {
  return function () {
    var height = parseFloat(this.dims.height) || 0;
    var yPos = function (count) {
      return (PADDING * multiplier * count) + 'px';
    };
    var count = this.layers.length;
    this.container.style.height = (this.padding * count * multiplier / 2 + height) + 'px';
    var i = count;
    var extra = 'rotateX(50deg) rotateZ(-45deg) scale(0.8)';
    while (i--) {
      this.layers[i].style.transform = 'translateY(' + yPos.call(this, count - i - 1) + ') ' + extra;
    }
  };
}

Showcase.layouts[Showcase.modes.MODE_3D] = ShowcaseLayout3D(2);
Showcase.layouts[Showcase.modes.MODE_3D_EXPANDED] = ShowcaseLayout3D(5);

module.exports = function (elem) {
             // [white, grey, light blue, dark blue, black]
  var colours = ['#FFF', '#EBEBEB', '#33A9DC', '#1572B6', '#131313'];

  /**
   * Calculate the angle and stop offsets for a gradient that goes from
   * corner to corner within a given box.
   *
   * @param  {array} dims   Box dimensions as [w, h]
   * @param  {int}   start  Start corner for cross line
   * @param  {int}   end    End corner for cross line
   * @return {object}       {angle, stops}
   *
   * Start/end corners are numbered 1-4:
   * 1    2
   *  ----
   *  |  |
   *  ----
   * 4    3
   */
  function getBoxBisector(dims, start, end) {
    var angle = 0, stop = '50%';
    var width = dims[0] || 1;
    var height = dims[1] || 1;

    if (start === end) {
      return {angle: 0, stops: ['fill']};
    }
    var se = start + end;
    if (se % 2) {
      if (se === 3) {
        angle = start === 1 ? 90 : 270;
      } else if (se === 5) {
        angle = start > 2 ? 0 : 180;
      } else {
        angle = start === 4 ? 90 : 270;
      }
      return {
        angle: angle,
        stops: [stop]
      };
    }

    var tanX = start > 2 ? width : -width;
    var tanY = (start === 1 || start === 4) ? height : -height;
    var rads = Math.atan2(tanY, tanX);
    angle = rads / Math.PI * 180;

    // http://dev.w3.org/csswg/css-images/#linear-gradient-syntax
    var gradLen = Math.abs(width * Math.sin(rads)) + Math.abs(height * Math.cos(rads));
    stop = Math.floor(gradLen / 2);
    var stops = [stop];
    stops.feather = true;

    return {
      angle: angle,
      stops: stops
    };
  }


  // Re-usable bits
  var stroke3Height = 16;
  var stroke3LeftBox = getBoxBisector([2, stroke3Height], 4, 2);
  var stroke3RightBox = getBoxBisector([7, 82], 3, 1);
  stroke3RightBox.stops.push(22);
  var serif3LeftBox = getBoxBisector([3, 25], 4, 2);
  serif3LeftBox.stops.push(18.5);

  var serif3BaseBox = getBoxBisector([32, 9], 4, 2);
  serif3BaseBox.stops.push(24);
  var stroke3BaseBox = getBoxBisector([34, 9], 3, 1);
  stroke3BaseBox.stops.push(24);

  var shieldSideSize = [12, 132];
  var shieldSideLeftBox = getBoxBisector(shieldSideSize, 4, 2);
  var shieldSideRightBox = getBoxBisector(shieldSideSize, 3, 1);

  var shieldBaseSize = [53, 14];
  var shieldBaseLeftBox = getBoxBisector(shieldBaseSize, 4, 2);
  var shieldBaseRightBox = getBoxBisector(shieldBaseSize, 3, 1);

  var smallShieldSideSize = [10, 112];
  var smallShieldSideBox = getBoxBisector(smallShieldSideSize, 3, 1);
  var smallShieldBaseSize = [43, 12];
  var smallShieldBaseBox = getBoxBisector(smallShieldBaseSize, 3, 1);

  /**
   * Array of part objects. Each part has options:
   *
   - col:   Index of colour to use;       default = 0
   - size:  [x, y] for bg size;           default = [100%, 100%]
   - pos:   [x, y] for bg position;       default = [0, 0]
   - stops: Array of stops for
            alternating on/off colour;    leave blank for full colour fill
   - type:  'linear' or 'radial';         default = 'linear'
   - (FOR type='linear'):
    \- angle: Angle for gradient (deg);   default = 180 (to bottom)
   - (FOR type='radial'):
    \- at: Position for gradient centre;  default = <empty>
   */
  var gradientParts = [
    // "CSS"
    {col:4, pos:[88,15], size:[23,11], angle:45, stops:[7,15.5]},
    {col:4, pos:[115,15], size:[23,11], angle:45, stops:[7,15.5]},
    {col:4, pos:[64,8], size:[8,25], angle:180, invert:true},
    {col:4, pos:[64,8], size:[74,7], angle:90, stops:[20,24, 47,51], invert:true},
    {col:4, pos:[64,26], size:[74,7], angle:90, stops:[20,24, 47,51], invert:true},

    // White "3" parts
    {col:0, pos:[118.5,70], size:[23,82], angle:stroke3RightBox.angle, stops:stroke3RightBox.stops},
    {col:0, pos:[100,70], size:[35,stroke3Height], angle:90},
    {col:0, pos:[100,103], size:[30,stroke3Height], angle:90},
    {col:0, pos:[100,135], size:[34,27], angle:stroke3BaseBox.angle, stops:stroke3BaseBox.stops},

    // Grey "3" parts
    {col:1, pos:[60,70], size:[45,stroke3Height], angle:stroke3LeftBox.angle, stops:stroke3LeftBox.stops},
    {col:1, pos:[81,103], size:[25,stroke3Height], angle:stroke3LeftBox.angle, stops:stroke3LeftBox.stops},
    {col:1, pos:[65,127], size:[18,25], angle:serif3LeftBox.angle, stops:serif3LeftBox.stops},
    {col:1, pos:[68,135], size:[32,27], angle:serif3BaseBox.angle, stops:serif3BaseBox.stops},

    // Shield highlight
    {col:2, pos:[100,55], size:[54,112], angle:smallShieldSideBox.angle, stops:smallShieldSideBox.stops},
    {col:2, pos:[100,167], size:smallShieldBaseSize, angle:smallShieldBaseBox.angle, stops:smallShieldBaseBox.stops},

    // Shield background
    {col:3, pos:[35,44], size:[70,132], angle:shieldSideLeftBox.angle, stops:shieldSideLeftBox.stops},
    {col:3, pos:[95,44], size:[70,132], angle:shieldSideRightBox.angle, stops:shieldSideRightBox.stops},
    {col:3, pos:[47,176], size:shieldBaseSize, angle:shieldBaseLeftBox.angle, stops:shieldBaseLeftBox.stops},
    {col:3, pos:[100,176], size:shieldBaseSize, angle:shieldBaseRightBox.angle, stops:shieldBaseRightBox.stops},
  ];

  function unit(num) {
    if (typeof num !== 'number' || num === 0) {
      return num;
    }
    return num + 'px';
  }

  function dims(arr) {
    return arr.map(unit).join(' ');
  }


  var sizes = [];
  var positions = [];
  var images = [];

  gradientParts.forEach(function (part) {
    var colour = colours[part.col || 0];

    if (!Object.keys(part).length) {
      return;
    }

    sizes.push(dims(part.size || ['100%', '100%']));
    positions.push(dims(part.pos || [0, 0]));

    var imageType = (part.type || 'linear') + '-gradient';
    var image = [];
    if (imageType === 'radial-gradient') {
      var positioning = 'farthest-side';
      if (part.at) {
        positioning += ' at ' + part.at;
      }
      image.push(positioning);
    } else {
      image.push((part.angle === undefined ? 180 : part.angle) + 'deg');
    }
    var on = !!part.invert;
    var stops = part.stops || ['fill'];
    var feather = !!stops.feather;
    stops.forEach(function (stop) {
      if (stop === 'fill') {
        image.push(colour + ' 0%', colour + ' 100%');
        return;
      }
      var cols = on ? [colour, 'transparent'] : ['transparent', colour];
      var len1 = unit(stop);
      var len2 = feather ? unit(stop + 1) : len1;
      // var len1 = feather ? unit(stop - .5) : len1;
      // var len2 = feather ? unit(stop + .5) : len1;
      image.push(cols[0] + ' ' + len1, cols[1] + ' ' + len2);
      on = !on;
    });
    images.push(imageType + '(' + image.join(', ') + ')');
  });

  elem.style.backgroundSize = sizes.join(', ');
  elem.style.backgroundPosition = positions.join(', ');
  elem.style.backgroundColor = colours[0];
  elem.style.backgroundImage = images.join(', ');
};

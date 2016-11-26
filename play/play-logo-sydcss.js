var doStuff = (function () {
  var elem = document.querySelector('.js-logo');

  var colours = ['#FFF', '#D9542B'];
//   colours = ['lime', 'blue', 'red'];

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


  var tmp;

  // Re-usable bits
  var headJoinTopSize = [30, 7];
  var headJoinSideSize = [5, 16];
  var headJoinTopLeftGradient = getBoxBisector(headJoinTopSize, 1, 3);
  var headJoinTopRightGradient = getBoxBisector(headJoinTopSize, 2, 4);
  tmp = headJoinTopLeftGradient.stops[0];
  var headJoinTopStops = [tmp - 1, tmp + 1];
  headJoinTopStops.feather = true;
  var headJoinSideLeftGradient = getBoxBisector(headJoinSideSize, 1, 3);
  var headJoinSideRightGradient = getBoxBisector(headJoinSideSize, 2, 4);
  tmp = headJoinSideLeftGradient.stops[0];
  var headJoinSideStops = [tmp - 1, tmp + 1];
  headJoinSideStops.feather = true;

  var topPointSize = [9, 24];
  var topPointGradient = getBoxBisector(topPointSize, 1, 3);
  var topPointExclusionGradient = getBoxBisector(topPointSize, 2, 4);

  var poleSize = [2, 49];
  var poleCurveSize = [9, 9];
  var poleCurveStops = [6.5, 8.9];
  poleCurveStops.feather = true;

  var earSize = [18, 18];
  var earStops = ['99%'];

  var eyeSize = [12, 12];
  var eyeStops = ['99%'];

  var armUpperSize = [8, 17];
  var armLowerSize = [15, 16];

  var armLeftUpperGradient = getBoxBisector([7, 4], 1, 3);
  var armLeftLowerGradient = getBoxBisector([6, 3], 4, 2);
  var armLeftLowerExclusionGradient = getBoxBisector([7, 12], 1, 3);
  tmp = getBoxBisector([17, 27], 1, 3);
  var armLeftLowerExclusionStops = [armLeftLowerExclusionGradient.stops[0], tmp.stops[0]];
  armLeftLowerExclusionStops.feather = true;
  
  var armRightUpperGradient = getBoxBisector([7, 4], 2, 4);
  var armRightLowerGradient = getBoxBisector([6, 3], 3, 1);
  var armRightLowerExclusionGradient = getBoxBisector([6, 11], 2, 4);
  tmp = getBoxBisector([16, 27], 2, 4);
  var armRightLowerExclusionStops = [armRightLowerExclusionGradient.stops[0], tmp.stops[0]];
  armRightLowerExclusionStops.feather = true;

  var handSize = [16, 18];
  var handStops = [4.5, 7.5];
  handStops.feather = true;
  var handExclusionSize = [16, 13];
  var handExclusionGradientSize = [16, 10];
  var handLeftExclusionGradient = getBoxBisector(handExclusionGradientSize, 2, 4);
  var handRightExclusionGradient = getBoxBisector(handExclusionGradientSize, 1, 3);

  var jetSize = [11, 14];
  var jetGradientLeft = getBoxBisector(jetSize, 1, 3);
  var jetGradientRight = getBoxBisector(jetSize, 2, 4);

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
    \- ??
   */
  var gradientParts = [
    // Left head join
    {size: headJoinTopSize, pos: [71, 3], angle: headJoinTopLeftGradient.angle, stops: headJoinTopStops, invert: true},
    {size: headJoinSideSize, pos: [68, 8], angle: headJoinSideLeftGradient.angle, stops: headJoinSideStops, invert: true},
    // Right head join
    {size: headJoinTopSize, pos: [100, 3], angle: headJoinTopRightGradient.angle, stops: headJoinTopStops, invert: true},
    {size: headJoinSideSize, pos: [128, 8], angle: headJoinSideRightGradient.angle, stops: headJoinSideStops, invert: true},
    // Top point exclusion
    {col: 1, size: [9, 24], pos: [101, 0], angle: topPointExclusionGradient.angle, stops: topPointExclusionGradient.stops},
    // Top point
    {size: [17, 24], pos: [92, 0], angle: topPointGradient.angle, stops: topPointGradient.stops, invert: true},
    // Ear exclusions
    {col: 1, size: [89, 26], pos: [56, 33], angle: 90, stops: [11, 78]},
    // Left ear
    {type: 'radial', size: earSize, pos: [48, 37], stops: earStops},
    // Left pole
    {size: poleSize, pos: [58, 21]},
    {type: 'radial', size: poleCurveSize, pos: [58, 13], at: 'right bottom', stops: poleCurveStops, invert: true},
    {type: 'radial', size: poleCurveSize, pos: [58, 68], at: 'right top', stops: poleCurveStops, invert: true},
    // Right ear
    {type: 'radial', size: earSize, pos: [135, 37], stops: earStops},
    // Right pole
    {size: poleSize, pos: [141, 21]},
    {type: 'radial', size: poleCurveSize, pos: [134, 13], at: 'left bottom', stops: poleCurveStops, invert: true},
    {type: 'radial', size: poleCurveSize, pos: [134, 68], at: 'left top', stops: poleCurveStops, invert: true},
    // Eyes
    {col: 1, type: 'radial', size: eyeSize, pos: [75, 40], stops: eyeStops},
    {col: 1, type: 'radial', size: eyeSize, pos: [114, 40], stops: eyeStops},
    // Head
    {size: [67, 44], pos: [67, 24]},
    // Left hand
    {col: 1, size: handExclusionSize, pos: [56, 131], angle: handLeftExclusionGradient.angle, stops: handLeftExclusionGradient.stops, invert: true},
    {type: 'radial', size: handSize, pos: [56, 126], stops: handStops, invert: true},
    // Left upper arm
    {size: armUpperSize, pos: [72, 95], angle: armLeftUpperGradient.angle, stops: armLeftUpperGradient.stops, invert: true},
    // Left lower arm
    {col: 1, size: armLowerSize, pos: [65, 111], angle: armLeftLowerExclusionGradient.angle, stops: armLeftLowerExclusionStops},
    {size: armLowerSize, pos: [65, 111], angle: armLeftLowerGradient.angle, stops: armLeftLowerGradient.stops, invert: true},
    // Right hand
    {col: 1, size: handExclusionSize, pos: [129, 131], angle: handRightExclusionGradient.angle, stops: handRightExclusionGradient.stops, invert: true},
    {type: 'radial', size: handSize, pos: [129, 126], stops: handStops, invert: true},
    // Right upper arm
    {size: armUpperSize, pos: [121, 95], angle: armRightUpperGradient.angle, stops: armRightUpperGradient.stops, invert: true},
    // Right lower arm
    {col: 1, size: armLowerSize, pos: [121, 111], angle: armRightLowerExclusionGradient.angle, stops: armRightLowerExclusionStops},
    {size: armLowerSize, pos: [121, 111], angle: armRightLowerGradient.angle, stops: armRightLowerGradient.stops, invert: true},
    // Legs exclusion
    {col: 1, size: [37, 29], pos: [82, 139], angle: 90, stops: [2, 12, 25, 35]},
    // Feet exclusion
    {col: 1, size: [7, 9], pos: [97, 170], angle: 90},
    // Body, legs & feet
    {size: [37, 103], pos: [82, 75], angle: 180, stops: [2.5, 20.5, 61.5, 65.5, 92.5, 96.5]},
    // Neck
    {size: [21, 8], pos: [90, 85]},
    // Left jet
    {size: jetSize, pos: [82, 186], angle: jetGradientLeft.angle, stops: jetGradientLeft.stops},
    // Right jet
    {size: jetSize, pos: [108, 186], angle: jetGradientRight.angle, stops: jetGradientRight.stops}
  ];

  /* TESTING ONLY *
  gradientParts = [];
  var testBox = [23, 40];
  for (var s = 1; s < 5; s++) {
    for (var e = 1; e < 5; e++) {
      var g = getBoxBisector(testBox, s, e);
      gradientParts.push({
        size: testBox,
        pos: [(e - 1) * 33, (s - 1) * 50],
        angle: g.angle,
        stops: g.stops
      });
      gradientParts.push({
        col: 1,
        size: testBox,
        pos: [(e - 1) * 33, (s - 1) * 50]
      });
    }
  }
  console.log(gradientParts);
  /* END TESTING */

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
    var on = !part.invert;
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
      image.push(cols[0] + ' ' + len1, cols[1] + ' ' + len2);
      on = !on;
    });
    images.push(imageType + '(' + image.join(', ') + ')');
  });

  elem.style.backgroundSize = sizes.join(', ');
  elem.style.backgroundPosition = positions.join(', ');
  elem.style.backgroundImage = images.join(', ');
});

doStuff();

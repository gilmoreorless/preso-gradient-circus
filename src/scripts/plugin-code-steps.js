/**
 * This is copied from bespoke-bullets then customised to handle linked code steps.
 * I should make it a proper separate plugin sometime.
 */
module.exports = function() {
  return function(deck) {
    var activeSlideIndex,
      activeStepIndex,

      bullets = deck.slides.map(function(slide) {
        if (!slide.hasAttribute('data-code-steps')) {
          return [];
        }
        var steps = [];
        var stepNodes = [].slice.call(slide.querySelectorAll('[data-code-step]'), 0);
        stepNodes.forEach(function (step) {
          var stepNum = step.getAttribute('data-code-step');
          if (stepNum) {
            stepNum = parseInt(stepNum, 10) || 0;
            var substeps = steps[stepNum];
            if (!substeps) {
              substeps = steps[stepNum] = {stepNum: stepNum, parts: []};
            }
            substeps.parts.push(step);
          }
        });
          // Re-index the possibly sparse array
        return steps.filter(function (s) {
          return s;
        });
      }),

      next = function() {
        var nextSlideIndex = activeSlideIndex + 1;

        if (activeSlideHasBulletByOffset(1)) {
          activateBullet(activeSlideIndex, activeStepIndex + 1);
          return false;
        } else if (bullets[nextSlideIndex]) {
          activateBullet(nextSlideIndex, 0);
        }
      },

      prev = function() {
        var prevSlideIndex = activeSlideIndex - 1;

        if (activeSlideHasBulletByOffset(-1)) {
          activateBullet(activeSlideIndex, activeStepIndex - 1);
          return false;
        } else if (bullets[prevSlideIndex]) {
          activateBullet(prevSlideIndex, bullets[prevSlideIndex].length - 1);
        }
      },

      activateBullet = function(slideIndex, stepIndex) {
        activeSlideIndex = slideIndex;
        activeStepIndex = stepIndex;

        bullets.forEach(function(slide, s) {
          slide.forEach(function(step, st) {
            step.parts.forEach(function(part) {
              part.classList.add('code-steps-step');

              if (s < slideIndex || s === slideIndex && st <= stepIndex) {
                part.classList.add('code-steps-step-active');
                part.classList.remove('code-steps-step-inactive');
              } else {
                part.classList.add('code-steps-step-inactive');
                part.classList.remove('code-steps-step-active');
              }

              if (s === slideIndex && st === stepIndex) {
                part.classList.add('code-steps-step-current');
              } else {
                part.classList.remove('code-steps-step-current');
              }
            });
          });
        });
      },

      activeSlideHasBulletByOffset = function(offset) {
        return bullets[activeSlideIndex][activeStepIndex + offset] !== undefined;
      };

    deck.on('next', next);
    deck.on('prev', prev);

    deck.on('slide', function(e) {
      activateBullet(e.index, 0);
    });

    activateBullet(0, 0);
  };
};

/**
 * This is copied from bespoke-bullets then customised to handle linked code steps.
 * I should make it a proper separate plugin sometime.
 */
module.exports = function() {
  return function(deck) {
    var activeSlideIndex,
      activeStepIndex,

      bullets = deck.slides.map(function(slide) {
        var steps = [];
        var stepNodes = [].slice.call(slide.querySelectorAll('[data-linked-step]'), 0);
        var indicators = [].slice.call(slide.querySelectorAll('[data-linked-indicator]'), 0);
        if (slide.hasAttribute('data-linked-indicator')) {
          indicators.unshift(slide);
        }
        stepNodes.forEach(function (step) {
          var stepNum = step.getAttribute('data-linked-step');
          if (stepNum) {
            stepNum = parseInt(stepNum, 10) || 0;
            var substeps = steps[stepNum];
            if (!substeps) {
              substeps = steps[stepNum] = {stepNum: stepNum, parts: []};
            }
            substeps.parts.push(step);
          }
        });
        if (!steps.length) {
          return {indicators: [], steps: []};
        }
        // Re-index the possibly sparse array
        steps = steps.filter(function (s) {
          return s;
        });
        // Insert a step "0" if needed (to hide first steps)
        if (steps[0].stepNum > 0) {
          steps.unshift({stepNum: 0, parts: []});
        }
        return {
          indicators: indicators,
          steps: steps
        };
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
          slide.steps.forEach(function(step, st) {
            step.parts.forEach(function(part) {
              part.classList.add('linked-step');

              if (s < slideIndex || s === slideIndex && st <= stepIndex) {
                part.classList.add('linked-step-active');
                part.classList.remove('linked-step-inactive');
              } else {
                part.classList.add('linked-step-inactive');
                part.classList.remove('linked-step-active');
              }

              if (s === slideIndex && st === stepIndex) {
                part.classList.add('linked-step-current');
              } else {
                part.classList.remove('linked-step-current');
              }
            });
          });

          slide.indicators.forEach(function(indicator) {
            indicator.setAttribute('data-linked-current-step', stepIndex);
          });
        });

        deck.fire('linked-step-change', {
          slide: slideIndex,
          step: stepIndex
        });
      },

      activeSlideHasBulletByOffset = function(offset) {
        return bullets[activeSlideIndex].steps[activeStepIndex + offset] !== undefined;
      };

    deck.on('next', next);
    deck.on('prev', prev);

    deck.on('slide', function(e) {
      activateBullet(e.index, 0);
    });

    activateBullet(0, 0);
  };
};

(function() {
  var app;

  app = angular.module("ngOnboarding", []);

  app.provider("ngOnboardingDefaults", function() {
    return {
      options: {
        overlay: true,
        overlayOpacity: 0.6,
        overlayClass: 'onboarding-overlay',
        popoverClass: 'onboarding-popover',
        titleClass: 'onboarding-popover-title',
        contentClass: 'onboarding-popover-content',
        arrowClass: 'onboarding-arrow',
        buttonContainerClass: 'onboarding-button-container',
        buttonClass: "onboarding-button",
        showButtons: true,
        nextButtonText: 'Next',
        previousButtonText: 'Previous',
        showDoneButton: true,
        doneButtonText: 'Done',
        closeButtonClass: 'onboarding-close-button',
        closeButtonText: '&times;',
        stepClass: 'onboarding-step-info',
        showStepInfo: true
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

  app.directive('onboardingPopover', [
    'ngOnboardingDefaults', '$sce', '$timeout', function(ngOnboardingDefaults, $sce, $timeout) {
      return {
        restrict: 'E',
        scope: {
          enabled: '=',
          steps: '=',
          onFinishCallback: '=',
          index: '=stepIndex'
        },
        replace: true,
        link: function(scope, element, attrs) {
          var attributesToClear, curStep, prevStep, setupOverlay, setupPositioning;
          curStep = null;
          prevStep = null;
          attributesToClear = ['title', 'top', 'right', 'bottom', 'left', 'width', 'height', 'position', 'arrowOffset'];
          scope.stepCount = scope.steps.length;
          scope.showPopover = false;
          scope.next = function() {
            prevStep = curStep;
            return scope.index = scope.index + 1;
          };
          scope.previous = function() {
            prevStep = curStep;
            return scope.index = scope.index - 1;
          };
          scope.close = function() {
            scope.enabled = false;
            setupOverlay(false);
            if (scope.onFinishCallback) {
              return scope.onFinishCallback();
            }
          };
          scope.$watch('enabled', function(newVal, oldVal) {
            if (newVal && !scope.index) {
              return scope.index = 0;
            }
          });
          scope.$watch('index', function(newVal, oldVal) {
            var attr, k, v, _i, _len;
            if (newVal === null) {
              scope.enabled = false;
              setupOverlay(false);
              return;
            }
            scope.showPopover = false;
            curStep = scope.steps[scope.index];
            scope.lastStep = scope.index + 1 === scope.steps.length;
            scope.showNextButton = scope.index + 1 < scope.steps.length;
            scope.showPreviousButton = scope.index > 0;
            for (_i = 0, _len = attributesToClear.length; _i < _len; _i++) {
              attr = attributesToClear[_i];
              scope[attr] = null;
            }
            for (k in ngOnboardingDefaults) {
              v = ngOnboardingDefaults[k];
              if (curStep[k] === void 0) {
                scope[k] = v;
              }
            }
            for (k in curStep) {
              v = curStep[k];
              scope[k] = v;
            }
            scope.description = $sce.trustAsHtml(scope.description);
            scope.nextButtonText = $sce.trustAsHtml(scope.nextButtonText);
            scope.previousButtonText = $sce.trustAsHtml(scope.previousButtonText);
            scope.doneButtonText = $sce.trustAsHtml(scope.doneButtonText);
            scope.closeButtonText = $sce.trustAsHtml(scope.closeButtonText);
            return $timeout(function() {
              setupOverlay();
              return setupPositioning();
            }, 0);
          });
          setupOverlay = function(showOverlay) {
            if (showOverlay == null) {
              showOverlay = true;
            }
            if (prevStep) {
              $(prevStep['attachTo']).removeClass('onboarding-focus');
            }
            if (curStep) {
              $(curStep['attachTo']).removeClass('onboarding-focus');
            }
            if (showOverlay) {
              if (curStep['attachTo'] && scope.overlay) {
                return $(curStep['attachTo']).addClass('onboarding-focus');
              }
            }
          };
          return setupPositioning = function() {
            var arrowOffset, attachTo, bottom, left, newLeft, popoverWidth, right, targetCenter, top, windowWidth, xMargin, yMargin;
            attachTo = curStep['attachTo'];
            scope.position = curStep['position'];
            scope.showPopover = false;
            xMargin = 15;
            yMargin = 15;
            if (attachTo) {
              if (!(scope.left || scope.right || scope.arrowOffset)) {
                left = null;
                right = null;
                newLeft = null;
                arrowOffset = null;
                if (scope.position === 'right') {
                  left = $(attachTo).offset().left + $(attachTo).outerWidth() + xMargin;
                } else if (scope.position === 'left') {
                  right = $(window).width() - $(attachTo).offset().left + xMargin;
                } else if (scope.position === 'top' || scope.position === 'bottom') {
                  left = $(attachTo).offset().left;
                  popoverWidth = parseInt(curStep['width'].replace("px", ""));
                  windowWidth = $(window).width();
                  if (left + popoverWidth >= windowWidth) {
                    targetCenter = $(attachTo).width() / 2;
                    newLeft = windowWidth - popoverWidth - xMargin;
                    arrowOffset = left + targetCenter - newLeft;
                    left = newLeft;
                  }
                }
                if (curStep['xOffset']) {
                  if (left !== null) {
                    left = left + curStep['xOffset'];
                  }
                  if (right !== null) {
                    right = right - curStep['xOffset'];
                  }
                }
                scope.left = left;
                scope.right = right;
                scope.arrowOffset = arrowOffset;
              }
              if (!(scope.top || scope.bottom)) {
                top = null;
                bottom = null;
                if (scope.position === 'left' || scope.position === 'right') {
                  top = $(attachTo).offset().top;
                } else if (scope.position === 'bottom') {
                  top = $(attachTo).offset().top + $(attachTo).outerHeight() + yMargin;
                } else if (scope.position === 'top') {
                  bottom = $(window).height() - $(attachTo).offset().top + yMargin;
                }
                if (curStep['yOffset']) {
                  if (top !== null) {
                    top = top + curStep['yOffset'];
                  }
                  if (bottom !== null) {
                    bottom = bottom - curStep['yOffset'];
                  }
                }
                scope.top = top;
                scope.bottom = bottom;
              }
            }
            if (scope.position && scope.position.length) {
              scope.positionClass = "onboarding-" + scope.position;
            } else {
              scope.positionClass = null;
            }
            return scope.showPopover = true;
          };
        },
        template: "<div class='onboarding-container' ng-show='enabled'>\n  <div class='{{overlayClass}}' ng-style='{opacity: overlayOpacity}', ng-show='overlay'></div>\n  <div class='{{popoverClass}} {{positionClass}}' ng-style=\"{width: width, height: height, left: left, top: top, right: right, bottom: bottom}\" ng-show='showPopover'>\n    <div class='{{arrowClass}}' ng-style='{left: arrowOffset}'></div>\n    <div class=\"onboarding-header\">\n      <h3 class='{{titleClass}}' ng-show='title' ng-bind='title'></h3>\n      <a href='' ng-click='close()' class='{{closeButtonClass}}' ng-bind-html='closeButtonText'></a>\n    </div>\n    <div class='{{contentClass}}'>\n      <p ng-bind-html='description'></p>\n    </div>\n    <div class='{{buttonContainerClass}}' ng-show='showButtons'>\n      <span ng-show='showStepInfo' class='{{stepClass}}'>Step {{index + 1}} of {{stepCount}}</span>\n      <a href='' ng-click='previous()' ng-show='showPreviousButton' class='{{buttonClass}}' ng-bind-html='previousButtonText'></a>\n      <a href='' ng-click='next()' ng-show='showNextButton' class='{{buttonClass}}' ng-bind-html='nextButtonText'></a>\n      <a href='' ng-click='close()' ng-show='showDoneButton && lastStep' class='{{buttonClass}}' ng-bind-html='doneButtonText'></a>\n    </div>\n  </div>\n</div>"
      };
    }
  ]);

}).call(this);

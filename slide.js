
(function ($) {


    $.fn.multislider = function (data, callback) {


        var $multislider = $(this);
        var $msContent = $multislider.find('.MS-content');
        var $msRight = $multislider.find('button.MS-right');
        var $msLeft = $multislider.find('button.MS-left');
        var $imgFirst = $msContent.find('.item:first');


        if (typeof data === 'string') {
            getStringArgs(data);
            return $multislider;
        } else if (typeof data === 'object' || typeof data === 'undefined') {
            init();
        }


        var $imgLast,
            totalWidth,
            numberVisibleSlides,
            animateDistance,
            animateSlideRight,
            animateSlideLeft,
            defaults,
            settings,
            animateDuration,
            autoSlideInterval;

        function init() {
            minifyContent();
            createSettings();
            saveData();
            selectAnimations();
        }



        $msRight.on('click', animateSlideLeft);
        $msLeft.on('click', animateSlideRight);
        $multislider.on('click', '.MS-right, .MS-left', resetInterval);
        $(window).on('resize', findItemWidth);



        function pauseAbove() {
            if (window.innerWidth > settings.pauseAbove) { $multislider.addClass('ms-PAUSE'); }
            $(window).on('resize', function () {
                if (window.innerWidth > settings.pauseAbove) {
                    $multislider.addClass('ms-PAUSE');
                } else {
                    $multislider.removeClass('ms-PAUSE');
                }
            });
        }

        function pauseBelow() {
            if (window.innerWidth < settings.pauseBelow) { $multislider.addClass('ms-PAUSE'); }
            $(window).on('resize', function () {
                if (window.innerWidth < settings.pauseBelow) {
                    $multislider.addClass('ms-PAUSE');
                } else {
                    $multislider.removeClass('ms-PAUSE');
                }
            });
        }

        function getStringArgs(str) {
            if (typeof $multislider.data(str) !== 'undefined') {
                $multislider.data(str)();
            } else {
                console.error("Multislider currently only accepts the following methods: next, prev, pause, play");
            }
        }

        function saveData() {
            $multislider.data({
                "pause": function () { $multislider.addClass('ms-PAUSE'); },
                "unPause": function () { $multislider.removeClass('ms-PAUSE'); },
                "continuous": function () { $multislider.removeClass('ms-PAUSE'); continuousLeft(); },
                "next": function () { overRidePause(singleLeft); },
                "nextAll": function () { overRidePause(allLeft); },
                "prev": function () { overRidePause(singleRight); },
                "prevAll": function () { overRidePause(allRight); },
                "settings": settings
            });
        }

        function overRidePause(animation) {
            if ($multislider.hasClass('ms-PAUSE')) {
                $multislider.removeClass('ms-PAUSE');
                animation();
                $multislider.addClass('ms-PAUSE');
            } else {
                animation();
            }
            resetInterval();
        }

        function minifyContent() {
            $msContent.contents().filter(function () {
                return (this.nodeType == 3 && !/\S/.test(this.nodeValue));
            }).remove();
        }

        function createSettings() {
            defaults = settings || {
                continuous: false,
                slideAll: false,
                interval: 2000,
                duration: 500,
                hoverPause: true,
                pauseAbove: null,
                pauseBelow: null
            };

            settings = $.extend({}, defaults, data);

            findItemWidth();
            animateDuration = settings.duration;

            if (settings.hoverPause) { pauseHover(); }
            if (settings.continuous !== true && settings.interval !== 0 && settings.interval !== false && settings.autoSlide !== false) { autoSlide(); }
            if (settings.pauseAbove !== null && typeof settings.pauseAbove === 'number') { pauseAbove(); }
            if (settings.pauseBelow !== null && typeof settings.pauseBelow === 'number') { pauseBelow(); }
        }

        function selectAnimations() {
            if (settings.continuous) {
                settings.autoSlide = false;
                continuousLeft();
            } else if (settings.slideAll) {
                animateSlideRight = $multislider.data('prevAll');
                animateSlideLeft = $multislider.data('nextAll');
            } else {
                animateSlideRight = $multislider.data('prev');
                animateSlideLeft = $multislider.data('next');
            }
        }

        function findItemWidth() {
            reTargetSlides();
            animateDistance = $imgFirst.width();
            var left = parseInt($msContent.find('.item:first').css('padding-left'));
            var right = parseInt($msContent.find('.item:first').css('padding-right'));
            if (left !== 0) { animateDistance += left; }
            if (right !== 0) { animateDistance += right; }
        }

        function autoSlide() {
            autoSlideInterval = setInterval(function () {
                if (!$multislider.hasClass('ms-PAUSE')) {
                    animateSlideLeft();
                }
            }, settings.interval);
        }

        function resetInterval() {
            if (settings.interval !== 0 && settings.interval !== false && settings.continuous !== true) {
                clearInterval(autoSlideInterval);
                autoSlide();
            }
        }

        function reTargetSlides() {
            $imgFirst = $msContent.find('.item:first');
            $imgLast = $msContent.find('.item:last');
        }

        function isItAnimating(callback) {
            if (!$multislider.hasClass('ms-animating') &&
                !$multislider.hasClass('ms-HOVER') &&
                !$multislider.hasClass('ms-PAUSE')) {
                $multislider.trigger('ms.before.animate');
                $multislider.addClass('ms-animating');
                callback();
            }
        }

        function doneAnimating() {
            if ($multislider.hasClass('ms-animating')) {
                $multislider.removeClass('ms-animating');
                $multislider.trigger('ms.after.animate');
            }
        }

        function pauseHover() {
            if (settings.continuous) {
                $msContent.on('mouseover', function () {
                    doneAnimating();
                    $msContent.children('.item:first').stop();
                });
                $msContent.on('mouseout', function () {
                    continuousLeft();
                });
            } else {
                $msContent.on('mouseover', function () {
                    $multislider.addClass('ms-HOVER');
                });
                $msContent.on('mouseout', function () {
                    $multislider.removeClass('ms-HOVER');
                });
            }
        }

        function midAnimateResume() {
            animateDuration = settings.duration;
            var currentMargin = parseFloat($msContent.find('.item:first').css("margin-left"));
            var percentageRemaining = 1 - (currentMargin / -(animateDistance - 1));
            animateDuration = percentageRemaining * animateDuration;
        }

        function calcNumSlidesToMove() {
            totalWidth = $msContent.width();
            numberVisibleSlides = Math.floor(totalWidth / animateDistance);
        }


        function continuousLeft() {
            isItAnimating(function () {
                reTargetSlides();
                midAnimateResume();
                $imgFirst.animate(
                    { marginLeft: -(animateDistance + 1) },
                    {
                        duration: animateDuration,
                        easing: "linear",
                        complete: function () {
                            $imgFirst.insertAfter($imgLast).removeAttr("style");
                            doneAnimating();
                            continuousLeft();
                        }
                    }
                );
            });
        }

        function allLeft() {
            isItAnimating(function () {
                reTargetSlides();
                calcNumSlidesToMove();

                var $clonedItemSet = $msContent.children('.item').clone();
                var filteredClones = $clonedItemSet.splice(0, numberVisibleSlides);

                $msContent.append(filteredClones);

                $imgFirst.animate(
                    { marginLeft: -totalWidth }, {
                    duration: animateDuration,
                    easing: "swing",
                    complete: function () {
                        $($msContent.children('.item').splice(0, numberVisibleSlides)).remove();
                        doneAnimating();
                    }
                }
                );
            });
        }

        function allRight() {
            isItAnimating(function () {
                reTargetSlides();
                calcNumSlidesToMove();

                var numberTotalSlides = $msContent.children('.item').length;
                var $clonedItemSet = $msContent.children('.item').clone();
                var filteredClones = $clonedItemSet.splice(numberTotalSlides - numberVisibleSlides, numberTotalSlides);

                $($(filteredClones)[0]).css('margin-left', -totalWidth);
                $msContent.prepend(filteredClones);

                reTargetSlides();

                $imgFirst.animate(
                    {
                        marginLeft: 0
                    }, {
                    duration: animateDuration,
                    easing: "swing",
                    complete: function () {
                        numberTotalSlides = $msContent.find('.item').length;
                        $($msContent.find('.item').splice(numberTotalSlides - numberVisibleSlides, numberTotalSlides)).remove();
                        $imgFirst.removeAttr('style');
                        doneAnimating();
                    }
                }
                );
            });
        }

        function singleLeft() {
            isItAnimating(function () {
                reTargetSlides();
                $imgFirst.animate(
                    {
                        marginLeft: -animateDistance
                    }, {
                    duration: animateDuration,
                    easing: "swing",
                    complete: function () {
                        $imgFirst.detach().removeAttr('style').appendTo($msContent);
                        doneAnimating();
                    }
                }
                );
            });
        }

        function singleRight() {
            isItAnimating(function () {
                reTargetSlides();
                $imgLast.css('margin-left', -animateDistance).prependTo($msContent);
                $imgLast.animate(
                    {
                        marginLeft: 0
                    }, {
                    duration: animateDuration,
                    easing: "swing",
                    complete: function () {
                        $imgLast.removeAttr("style");
                        doneAnimating();
                    }
                }
                );
            });
        }
        return $multislider;
    }
})(jQuery);
(function ($) {
    if ('undefined' === typeof window.infiniteSlider) {

        function devError(m) {
            console.log("jInfiniteSlider: devError: " + m);
        }


        window.infiniteSlider = function (options) {
            //------------------------------------------------------------------------------/
            // TOOLS
            //------------------------------------------------------------------------------/
            function debug() {
                //console.log("offset: " + offset);
                var jFirst = d.sliderFindItemsCb(jSlider).first();
                var jLast = d.sliderFindItemsCb(jSlider).last();
                var firstPage = (jSlider.position().left >= 0);
                var lastItemRightBoundary = parseInt(jLast.offset().left) + jFullSet.outerWidth();
                var lastPage = (lastItemRightBoundary - getMoveIncrement() <= parseInt(jSlider.parent().offset().left));
                screenDebug({
                    offset: offset,
                    first: jFirst.offset().left,
                    last: lastItemRightBoundary,
                    sliderParent: jSlider.parent().offset().left,
                    slider: jSlider.offset().left,
                    sliderPos: jSlider.position().left,
                    mi: getMoveIncrement(),
                    firstPage: firstPage,
                    lastPage: lastPage
                });
            }

            function getMoveIncrement() {
                return d.moveIncrement();
            }


            function getNbVisibleItems() {
                var w = d.getContainerWidthCb();
                var iw = jFullSet.outerWidth(true); // note: this returns the width of only one element (despite what you might think)
                return parseInt(Math.floor(w / iw));
            }

            function prependClones() {
                var cl = jFullSet.clone();
                jSlider.prepend(cl);
                var ret = cl.outerWidth(true) * nbOriginalItems;

                lOff -= ret;
                jSlider.css({
                    left: lOff + "px"
                });
                return ret;
            }

            function appendClones() {
                var cl = jFullSet.clone();
                jSlider.append(cl);
                return cl.outerWidth(true) * nbOriginalItems;
            }


            function move(the_offset) {


                var delta;
                if (the_offset > offset) { // user clicked left
                    delta = the_offset - offset;
                    visibleLeft -= delta;
                    visibleRight -= delta;
                }
                else { // user clicked right
                    delta = offset - the_offset;
                    visibleLeft += delta;
                    visibleRight += delta;
                }

                offset = the_offset;
                zis.executeMove(offset);
                stabilize();
            }

            function stabilize() {

                if (true === d.infinite) {

                    var x, clones, genWidth;
                    x = nbSafeMi * getMoveIncrement() - (generatedRight - visibleRight);
                    while (x > 0) {
                        genWidth = appendClones();
                        x -= genWidth;
                        generatedRight += genWidth;
                    }


                    x = nbSafeMi * getMoveIncrement() - (visibleLeft - generatedLeft);
                    while (x > 0) {
                        genWidth = prependClones();
                        x -= genWidth;
                        generatedLeft -= genWidth;
                    }
                }
            }

            function callDetectFirstLastPage(isLeft) {
                if (false === d.infinite) {

                    var jLast = d.sliderFindItemsCb(jSlider).last();
                    var firstItemLeftBoundary = jSlider.position().left;
                    var lastItemRightBoundary = parseInt(jLast.offset().left) + jFullSet.outerWidth();
                    var firstItemLeftBoundaryAfter, lastItemRightBoundaryAfter;

                    var mi = getMoveIncrement();
                    if (true === isLeft) {
                        firstItemLeftBoundaryAfter = firstItemLeftBoundary + mi;
                        lastItemRightBoundaryAfter = lastItemRightBoundary + mi;
                    }
                    else {
                        firstItemLeftBoundaryAfter = firstItemLeftBoundary - mi;
                        lastItemRightBoundaryAfter = lastItemRightBoundary - mi;
                    }

                    var info = d.getFirstLastPageCb(firstItemLeftBoundary, lastItemRightBoundary, firstItemLeftBoundaryAfter, lastItemRightBoundaryAfter);
                    if (false === d.onFirstLastPage(info[0], info[1], info[2], info[3], isLeft)) {
                        return false;
                    }
                }
                return true;
            }
            
            //------------------------------------------------------------------------------/
            // INIT
            //------------------------------------------------------------------------------/
            var zis = this;
            var lOff = 0;
            var nbOriginalItems = 0;
            var nbSafeMi = 2;
            var d = $.extend({
                /**
                 * @param slider - jHandle representing the slider: the element which contains the items.
                 *
                 * The slider should be positioned inside a so called slider_container element.
                 * Note: the slider_container element is not handled by this object.
                 *
                 */
                slider: null,
                /**
                 * @param moveIncrement - callback used to return the length of a left/right move.
                 *
                 *          int:lengthInPx      function(  )
                 *
                 *
                 * By default (if null), it returns the width of the jSlider's element.
                 * This method is used when the user clicks on a left/right slider control button.
                 *
                 */
                moveIncrement: null,
                /**
                 * @param sliderFindItemsCb - callback to find the items.
                 *
                 *                  void    function ( jHandle:jSlider )
                 *
                 * It is used to mark original items (used for internal purposes).
                 * By default, it selects all top level children of the slider element.
                 *
                 */
                sliderFindItemsCb: null,
                /**
                 * @param getContainerWidthCb - callback used to access the width of the slider's container element.
                 * By default, the slider container is the slider parent.
                 *
                 * This is used to recalculate the mi (move increment value),
                 * in case the user resizes the screen AND the slider container's width is not
                 * fixed (use percentage for instance).
                 *
                 */
                getContainerWidthCb: null,
                /**
                 * @param isInfinite - bool, whether or not to use the infinite system.
                 * By default this is true; you can set it to false to have a "normal" slider behaviour.
                 *
                 */
                infinite: true,
                /**
                 * @param onFirstLastPage - callback
                 *
                 * - this work only in finite mode (it doesn't make sense if infinite mode is true)
                 * - return false to cancel the slide movement
                 * - is called before any movement, and allows you to take action depending on whether
                 *          the plugin estimates that you would land on the first or last page.
                 *
                 *          You can use the getFirstLastPageCb to override the plugin's default estimation mechanism.
                 *
                 *          This function was added so that one can show/hide the slider's movement control when
                 *          necessary.
                 *
                 *          Note: the concept of page is inherent to this callback.
                 *          It's only relevant in finite mode.
                 *          Basically, when the slider is started, you are on the first page,
                 *          and theoretically you would be on the last page if, after a right slide the last item
                 *          wouldn't be visible.
                 *
                 *
                 * - isFirst: bool, estimation of whether or not the slide is on the first page
                 * - isLast: bool, estimation of whether or not the slide is on the last page
                 * - willLandOnFirst: bool, estimation of whether or not the slide would be on the first page after the move
                 * - willLandOnLast: bool, estimation of whether or not the slide would be on the last page after the move
                 * - moveLeft: bool (if true, it slides to the left, if false, it slides to the right)
                 * 
                 * 
                 * Personal note:
                 *      this system works, but is not very reliable: in particular if the user clicks repeatedly 
                 *      very fast on the left control for instance, she would be able to go past the left boundary,
                 *      and the same logic applies to the right.
                 *      It wouldn't be too hard to implement a more reliable system (keep track of a virtual slider 
                 *      position, rather than the real slider pos which depends on the time needed to actually 
                 *      complete the slide), but I thought it was necessary...
                 *      
                 *
                 *
                 */
                onFirstLastPage: function (isFirst, isLast, willLandOnFirst, willLandOnLast, moveLeft) {
                    if (
                        (true === isFirst && true === moveLeft) ||
                        (true === isLast && false === moveLeft)
                    ) {
                        return false;
                    }
                },
                /**
                 * @param getFirstLastPageCb - callback
                 * Decide whether or not the user is currently on the first/last page, and whether or not the user
                 * will be on the first/last page after the move was performed.
                 * 
                 * 
                 * The arguments are:
                 * 
                 *      firstItemLeftBoundary: int, the offset of the leftmost item's left boundary in the slider (compared to the viewport) 
                 *      lastItemRightBoundary: int, the offset of the rightmost item's right boundary in the slider 
                 *      firstItemLeftBoundaryAfter: int, the offset of the leftmost item's left boundary in the slider, if the slide was performed
                 *      lastItemRightBoundaryAfter: int, the offset of the rightmost item's right boundary in the slider, if the slide was performed
                 * 
                 * Returns an array of four elements: [isFirstPage, isLastPage, willLandOnFirstPage, willLandOnLastPage];
                 */
                getFirstLastPageCb: function (firstItemLeftBoundary, lastItemRightBoundary, firstItemLeftBoundaryAfter, lastItemRightBoundaryAfter) {
                    var firstPage = (firstItemLeftBoundary >= 0);
                    var lastPage = (lastItemRightBoundary - getMoveIncrement() <= parseInt(jSlider.parent().offset().left));
                    var willLandOnFirst = (firstItemLeftBoundaryAfter >= 0);
                    var willLandOnLast = (lastItemRightBoundaryAfter - getMoveIncrement() <= parseInt(jSlider.parent().offset().left));
                    return [firstPage, lastPage, willLandOnFirst, willLandOnLast];
                }
            }, options);

            var jSlider = d.slider;
            this.jSlider = jSlider;
            var jFullSet = null;
            var offset = 0;
            if (!d.slider instanceof jQuery) {
                devError("slider must be an instance of jQuery");
            }


            if (null === d.sliderFindItemsCb) {
                d.sliderFindItemsCb = function (jTheSlider) {
                    return jTheSlider.find('>');
                };
            }

            jFullSet = d.sliderFindItemsCb(this.jSlider);
            nbOriginalItems = jFullSet.length;
            if (null === d.moveIncrement) {
                d.moveIncrement = function () {
                    return jFullSet.outerWidth(true) * getNbVisibleItems();
                };
            }

            if (null === d.getContainerWidthCb) {
                d.getContainerWidthCb = function () {
                    return jSlider.parent().width();
                };
            }

            // define coordinates
            var visibleLeft = 0;
            var visibleRight = getMoveIncrement();
            var generatedLeft = visibleLeft;
            var generatedRight = visibleRight;
            stabilize();
            //setInterval(debug, 1000);

            //------------------------------------------------------------------------------/
            // API
            //------------------------------------------------------------------------------/
            this.moveLeft = function () {
                if (false !== callDetectFirstLastPage(true)) {
                    move(offset + getMoveIncrement());
                }
            };
            this.moveRight = function () {
                if (false !== callDetectFirstLastPage(false)) {
                    move(offset - getMoveIncrement());
                }
            };
        };

        window.infiniteSlider.prototype = {
            executeMove: function (offset) {
                this.jSlider.css({
                    transform: "translate3d(" + offset + "px, 0px, 0px)"
                });
            }
        };
    }
})(jQuery);
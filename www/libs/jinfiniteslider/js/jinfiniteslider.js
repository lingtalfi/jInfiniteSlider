(function ($) {
    if ('undefined' === typeof window.infiniteSlider) {

        function devError(m) {
            console.log("jInfiniteSlider: devError: " + m);
        }

        window.infiniteSlider = function (options) {
            //------------------------------------------------------------------------------/
            // TOOLS
            //------------------------------------------------------------------------------/
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


            //------------------------------------------------------------------------------/
            // INIT
            //------------------------------------------------------------------------------/
            var zis = this;
            var lOff = 0;
            var nbOriginalItems = 0;
            var nbSafeMi = 2;
            var d = $.extend({
                /**
                 * @param slider: jHandle representing the slider: the element which contains the items.
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
                getContainerWidthCb: null
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


            //------------------------------------------------------------------------------/
            // API
            //------------------------------------------------------------------------------/
            this.moveLeft = function () {
                move(offset + getMoveIncrement());
            };
            this.moveRight = function () {
                move(offset - getMoveIncrement());
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
 /*
  *  UIScrollView.js
  *  Author: Oscar Sobrevilla (oscar.sobrevilla@gmail.com)
  *  Version: 0.1 (beta)
  */
 UIScrollView = (function (win, doc) {
   var m = Math,
     dummyStyle = doc.createElement('div').style,
     vendor = (function () {
       var vendors = 't,webkitT,MozT,msT,OT'.split(','),
         t,
         i = 0,
         l = vendors.length;
       for (; i < l; i++) {
         t = vendors[i] + 'ransform';
         if (t in dummyStyle) {
           return vendors[i].substr(0, vendors[i].length - 1);
         }
       }
       return false;
     })(),
     cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',
     // Style properties
     transform = prefixStyle('transform'),
     transitionProperty = prefixStyle('transitionProperty'),
     transitionDuration = prefixStyle('transitionDuration'),
     transformOrigin = prefixStyle('transformOrigin'),
     transitionTimingFunction = prefixStyle('transitionTimingFunction'),
     transitionDelay = prefixStyle('transitionDelay'),
     backfaceVisibility = prefixStyle('backfaceVisibility'),
     perspective = prefixStyle("perspective"),
     // Browser capabilities
     isAndroid = (/android/gi).test(navigator.appVersion),
     isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
     isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
     has3d = prefixStyle('perspective') in dummyStyle,
     hasTouch = 'ontouchstart' in window && !isTouchPad,
     hasTransform = vendor !== false,
     hasTransitionEnd = prefixStyle('transition') in dummyStyle,
     RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
     START_EV = hasTouch ? 'touchstart' : 'mousedown',
     MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
     END_EV = hasTouch ? 'touchend' : 'mouseup',
     CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
     TRNEND_EV = (function () {
       if (vendor === false) return false;
       var transitionEnd = {
         '': 'transitionend',
         'webkit': 'webkitTransitionEnd',
         'Moz': 'transitionend',
         'O': 'otransitionend',
         'ms': 'MSTransitionEnd'
       };
       return transitionEnd[vendor];
     })(),
     nextFrame = (function () {
       return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
         return setTimeout(callback, 1000 / 60);
       };
     })(),
     cancelFrame = (function () {
       return window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout;
     })(),
     UIScrollView = function (target, views, options) {
       var that = this,
         i;
       this.options = {
         height: 800,
         width: 600,
         axis: 'x',
         margin: 0,
         loop: true,
         slideSpeed: 250,
         swipe: true,
         index: 0,
         gesture: true,
         preventDefaultTouchEvents: true,
         onBeforeSlide: null,
         onChangeView: null
       };
       // Copy settings
       this.setOptions(options);
       this.views = views || [];
       this.index = this.options.index;
       this.lastIndex = this.index;
       this.enabled = true;
       this.isSliding = false;
       this.el = doc.createElement('div');
       this.el.className = 'scrollviewer';
       this.dom = {};
       this.dom.target = target;
       this.dom.target.style.height = this.options.height + 'px';
       this.dom.target.style.width = this.options.width + 'px';
       this.dom.target.style.overflowY = 'scroll';
       this._bind(RESIZE_EV, window);
       this._bind(START_EV);
       this._bind('scroll', this.dom.target);
       this.dom.target.appendChild(this.el);
     };
   UIScrollView.prototype = {
     constructor: UIScrollView,
     setOptions: function (options) {
       var i;
       for (i in options) this.options[i] = options[i];
     },
     refresh: function () {
       this.dom.target.style.height = this.options.height + 'px';
       this.dom.target.style.width = this.options.width + 'px';
     },
     _bind: function (type, el, bubble) {
       (el || this.el).addEventListener(type, this, !! bubble);
     },
     _unbind: function (type, el, bubble) {
       (el || this.el).removeEventListener(type, this, !! bubble);
     },
     enable: function () {
       this.enabled = true;
       this._bind(START_EV);
     },
     disable: function () {
       this.enabled = false;
       this._unbind(START_EV);
     },
     goTo: function (index) {
       if (!isNaN(index))
         this.scrollTo(Number(index));
       else
         throw 'ScrollViewer: Error, @index param no valid';
     },
     prev: function () {
       this.scrollTo(this.index - 1);
     },
     next: function () {
       this.scrollTo(this.index + 1);
     },
     show: function (view) {
       for (v in this.views)
         this.el.appendChild(this.views[v].render());
     },
     getViews: function (indexes) {
       var i, j, retval = [],
         view;
       for (i = 0, j = indexes.length; i < j; i++) {
         view = this.views[indexes[i]];
         retval.push(view);
       }
       return retval;
     },
     getView: function (index) {
       return this.views[index == undefined ? this.index : index];
     },
     getNextView: function () {
       var nextIndex = this.index + 1;
       if (nextIndex > this.views.length - 1) {
         nextIndex = 0;
       }
       return this.getView(nextIndex)
     },
     getPrevView: function () {
       var prevIndex = this.index - 1
       if (prevIndex < 0) {
         prevIndex = this.views.length - 1;
       }
       return this.getView(prevIndex);
     },
     getIndex: function () {
       return Math.floor(this.dom.target.scrollTop / this.options.height);
     },
     scrolling: function () {
       var index = this.getIndex();
       if (Math.abs(this.index - index) == 1) {
         this.index = index;
         this.options.onChangeView && this.options.onChangeView.call(this, index);
       }
     },
     scrollTo: function (index) {
       this.index = index;
       this.dom.target.scrollTop = this.getView(index).render().offsetTop;
       this.options.onChangeView && this.options.onChangeView.call(this, index);
     },
     handleEvent: function (e) {
       switch (e.type) {
       case 'scroll':
         this.scrolling(e);
         break;
       case RESIZE_EV:
         this._resize();
         break;
       case TRNEND_EV:
         this._transitionEnd(e);
         break;
       }
     },
     _resize: function () {}
   };

   function prefixStyle(style) {
     if (vendor === '') return style;
     style = style.charAt(0).toUpperCase() + style.substr(1);
     return vendor + style;
   }
   return UIScrollView;
 }(window, window.document))
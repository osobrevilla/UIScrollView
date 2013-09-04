 /*
  *  UIScrollView.js
  *  Author: Oscar Sobrevilla (oscar.sobrevilla@gmail.com)
  *  Version: 0.1 (beta)
  */
 UIScrollView = (function (win, doc) {
   var hasTouch = 'ontouchstart' in window,
     touchScroll = function (id) {
       if (hasTouch) { //if touch events exist...
         var el = id || document.getElementById(id);
         var scrollStartPos = 0;
         el.addEventListener("touchstart", function (event) {
           scrollStartPos = this.scrollTop + event.touches[0].pageY;
           //event.preventDefault(); <-- This line can be removed
         }, false);
         el.addEventListener("touchmove", function (event) {
           this.scrollTop = scrollStartPos - event.touches[0].pageY;
           event.preventDefault();
         }, false);
       }
     },
     UIScrollView = function (target, views, options) {
       var that = this,
         i;
       this.options = {
         height: 800,
         width: 600,
         margin: 0,
         index: 0,
         onChangeView: null
       };
       // Copy settings
       this.setOptions(options);
       this.views = views || [];
       this.index = this.options.index;
       this.lastIndex = this.index;
       this.enabled = true;
       this.el = doc.createElement('div');
       this.el.className = 'scrollviewer';
       this.dom = {};
       this.dom.target = target;
       this.dom.target.style.height = '100%';
       this.dom.target.style.width = '100%';
       this.dom.target.style.overflowY = 'scroll';
       this._bind('scroll', this.dom.target);
       this.dom.target.appendChild(this.el);
       touchScroll(this.el.parentNode);
     };
   UIScrollView.prototype = {
     constructor: UIScrollView,
     setOptions: function (options) {
       var i;
       for (i in options) this.options[i] = options[i];
     },
     _bind: function (type, el, bubble) {
       (el || this.el).addEventListener(type, this, !! bubble);
     },
     _unbind: function (type, el, bubble) {
       (el || this.el).removeEventListener(type, this, !! bubble);
     },
     goTo: function (index) {
       if (!isNaN(index))
         this.scrollTo(Number(index));
       else
         throw 'UIScrollView: Error, @index param no valid';
     },
     prev: function () {
       this.scrollTo(this.index - 1);
     },
     next: function () {
       this.scrollTo(this.index + 1);
     },
     show: function (view) {
       var v;
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
       return Math.floor(this.dom.target.scrollTop / this.options.height)
     },
     scrolling: function () {
       var index = this.getIndex();
       if (this.index !== index) {
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
       }
     }
   };
   return UIScrollView;
 }(window, window.document))
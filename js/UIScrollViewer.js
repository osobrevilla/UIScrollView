 /*
  *  UIScrollView.js
  *  Author: Oscar Sobrevilla (oscar.sobrevilla@gmail.com)
  *  Version: 0.1 (beta)
  */
 var UIScrollView = (function (win, doc) {
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
         index: 0,
         onChangeView: null
       };
       // Copy settings
       for (i in options) 
          this.options[i] = options[i];
       this.views = views || [];
       this.index = this.options.index;
       this.lastIndex = this.index;
       this.enabled = true;
       this.el = doc.createElement('div');
       this.el.className = 'scrollviewer';
       this.dom = {};
       this.dom.target = target;
       this.el.style.height = '100%';
       this.el.style.width = '100%';
       this.el.style.overflowY = 'scroll';
       touchScroll(this.el);
     };
   UIScrollView.prototype = {
     constructor: UIScrollView,
     setOptions: function (options) {
       var i;
       for (i in options) 
        this.options[i] = options[i];
       this.refresh();
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
     show: function (index) {
       var v;
       for (v in this.views)
         this.el.appendChild(this.views[v].render());
       this._bind('scroll', this.el);
       this.dom.target.appendChild(this.el);
       this.refresh();
       this.goTo(index || this.index);
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
      var margins = this._getMargins();
       return Math.floor(this.el.scrollTop / (this.options.height + margins));
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
       this.el.scrollTop = this.getView(index).render().offsetTop;
       this.options.onChangeView && this.options.onChangeView.call(this, index);
     },
     _getMargins: function(){
        var margin = 0;
        if ( this.el.firstChild ) {
          if ( document.all ) {// IE
            margin = parseInt(this.el.firstChild.currentStyle.marginTop, 10) + parseInt(this.el.firstChild.currentStyle.marginBottom, 10);
          } else {// Mozilla
            margin = parseInt(document.defaultView.getComputedStyle(this.el.firstChild, '').getPropertyValue('margin-top')) + parseInt(document.defaultView.getComputedStyle(this.el.firstChild, '').getPropertyValue('margin-bottom'));
          }
       }
       return margin;
     },
     handleEvent: function (e) {
       switch (e.type) {
       case 'scroll':
         this.scrolling(e);
         break;
       }
     },
     refresh: function(e){
       if ( this.el.hasChildNodes() ) {
          var i = 0, children = this.el.childNodes;
          for (; i < children.length; i++) {
            children[i].style.height = Math.floor(this.options.height) + 'px';
          }
        }
     }
   };
   return UIScrollView;
 }(window, window.document));

 if (typeof define === 'function' && define.amd) {
  define(function () {
    return UIScrollView;
  });
}
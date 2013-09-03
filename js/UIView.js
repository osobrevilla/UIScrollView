UIView = (function (options) {
  this.el = null;
  this.loaded = false;
  this.html = '<div class="view" data-role="view">\
                <img class="view-image" src="' + options.thumb + '" />\
                <div class="view-area"></div>\
              </div>';
  this.spinner = null;
  this.options = options;
  this.src = options.src;
  this.thumb = options.thumb;
  this.loaded = false;
  this.downloading = false;
  this.downloadRequest = null;
  this.thumb = this.options.thumb;
  this.src = this.options.src;
  this.pointOpened = null;
  this.ajaxLoad = false;
  this.imageLoader = null;
  this.dom = {};
});
UIView.prototype = {
  constructor: UIView,
  render: function () {
    if (!this.el) {
      var el = $(this.html);
      this.spinner = $('<h2>Cargando..</h2>');
      this.dom.image = el.find('.view-image');
      this.dom.area = el.find('.view-area');
      this.el = el.get(0);
    }
    if (this.loaded)
      this.setImage(true);
    return this.el;
  },
  setImage: function (big) {
    this.dom.image.attr('src', big ? this.src : this.thumb);
  },
  show: function (callback) {
    var that = this;
    if (this.loaded) {
      //that.setHdImage();
      this._hideSpinner();
      callback && callback.call(this);
    } else {
      if (that.dom.area)
        this._showSpinner();
      this.preload(function () {
        that.show(callback);
      });
    }
  },
  preload: function (callback) {
    if (this.loaded) {
      callback && callback.call(this);
      return;
    }
    this.onDownload(callback);
    if (!this.downloading) {
      this.download();
    }
    return this.downloadRequest;
  },
  download: function () {
    var that = this;
    that.downloading = true;
    return this.downloadRequest = ImageDownloader.load(that.src, function () {
      that._downloaded();
    });
  },
  onDownload: function (callback) {
    if (typeof callback != 'function')
      return;
    this.onDownload.events = this.onDownload.events || [];
    this.onDownload.events.push(callback);
  },
  _downloaded: function () {
    this.downloading = false;
    this.loaded = true;
    this._hideSpinner();
    for (var ev in this.onDownload.events) {
      this.onDownload.events[ev].call(this);
      delete this.onDownload.events[ev];
    }
  },
  abortDownload: function () {
    var that = this;
    if (that.downloadRequest) {
      that.downloadRequest.abort();
      that.downloadRequest = null;
      that.downloading = false;
      that.onDownload.events = [];
    }
  },
  unload: function () {
    this.setImage(false);
  },
  detach: function () {
    if (this.el.parentNode)
      this.el.parentNode.removeChild(this.el);
  },
  _showSpinner: function () {
    //this.dom.area.append(this.spinner.el);
    this.dom.area.append(this.spinner);
  },
  _hideSpinner: function () {
    this.spinner = this.spinner.detach();
  },
  destroy: function () {}
};
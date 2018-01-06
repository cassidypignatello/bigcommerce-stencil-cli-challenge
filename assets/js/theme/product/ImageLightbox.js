import PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
import { photoSwipeTemplate } from './photoSwipeTemplate';

export default class ImageLightbox {
  constructor(imageSelector, options) {

    this.options = $.extend({
      index: 0,
      bgOpacity: 0.95,
      history: false,
    }, options);

    this.imageSelector = imageSelector;

    this._injectTemplate();
  }

  /**
   *
   * Add the PhotoSwipe template to the DOM
   *
   */

  _injectTemplate() {
    $(document.body).append(photoSwipeTemplate);
  }

  /**
   *
   * Init PhotoSwipe when a product image is clicked
   * @param {array} imageArray The array of large / zoomable images
   *
   */

  _init(imageArray) {
    this.pswpElement = $('.pswp')[0];

    this.ProductImages = new PhotoSwipe(this.pswpElement, PhotoSwipeUI_Default, imageArray, this.options);

    this.ProductImages.init();
  }

  /**
   *
   * Build out the image array
   * @returns {array} of image objects
   *
   */

  _buildImageArray() {
    const paths = $(this.imageSelector).toArray().map((element) => {
      return $(element).attr('href');
    });

    return Promise.all(
      paths.map(this._getImageMeta)
    );
  }

  /**
   *
   * Get the meta properties of an image
   * @returns {Promise} Returns the image meta if resolved (image loaded)
   *
   */

  _getImageMeta(src) {
    return new Promise(resolve => {
      const $thumbnail = $(`[href="${src}"]`).find('img');
      const image = new Image();

      // Resolve with meta values once image has loaded
      image.onload = () => resolve({
        src,
        w: image.naturalWidth,
        h: image.naturalHeight,
        msrc: $thumbnail.attr('src'),
        title: $thumbnail.attr('alt'),
      });

      image.onerror = () => reject('error loading image');

      image.src = src;
    });
  }

  /**
   *
   * Get the coordinates zoom animation will start / end with
   * @param {int} index The index of the image within the gallery
   *
   */

  _getThumbBounds(index) {
    const thumbnail = $(this.imageSelector)[index];

    const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;

    const rect = thumbnail.getBoundingClientRect();

    return {
      x: rect.left,
      y: rect.top + pageYScroll,
      w: rect.width,
    };
  }

  /**
   *
   * Show the PhotoSwipe modal
   * @public
   * @param {int} index The index of the image within the gallery
   *
   */

  show(index) {
    this.options.index = index;
    this.options.getThumbBoundsFn = index => this._getThumbBounds(index);

    this._buildImageArray().then(imageArray => {
      this._init(imageArray);
    });
  }
}

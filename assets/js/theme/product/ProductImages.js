import imagesLoaded from 'imagesloaded';
import slick from 'slick-carousel';
import ImageLightbox from './ImageLightbox';

export default class ProductImages {
  constructor() {
    this.imageLightbox = new ImageLightbox('[data-product-image]');

    this.constructor.initCarousel();
    this._bindEvents();
  }

  static initCarousel() {
    $('.product-slides-wrap').slick({
      infinite: false,
      arrows: false,
      lazyLoad: 'ondemand',
    });
  }

  static destroyCarousel() {
    $('.product-slides-wrap').slick('unslick');
  }

  _bindEvents() {
    // Paging
    $(document).on('click', '.product-images-pagination a', (event) => {
      event.preventDefault();
      $('.product-slides-wrap').slick('slickGoTo', $(event.currentTarget).attr('data-slide-to'));
    });

    // Lightbox
    $(document).on('click', '[data-product-image]', (event) => {
      event.preventDefault();
      this.imageLightbox.show($(event.currentTarget).index());
    });
  }
}

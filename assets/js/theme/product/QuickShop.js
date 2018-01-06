import utils from '@bigcommerce/stencil-utils';
import ProductUtils from './ProductUtils';
import ProductImages from './ProductImages';
import productViewTemplates from './productViewTemplates';
import variationImgPreview from './variationImgPreview';
import ColorSwatch from '../product/ColorSwatch'
import Modal from 'bc-modal';

export default class QuickShop {
  constructor(context) {
    this.context = context;
    this.product;
    this.id = null;

    this.el = '[data-product-container]';
    this.$el = $(this.el);

    // Set up the modal options
    this.QuickShopModal = new Modal({
      modalClass: 'modal-quick-shop',
      centerVertically: false,
      afterShow: ($modal) => {
        this._fetchProduct($modal, this.id);
      },
      afterHide: () => {
        this.product.destroy();
      },
    });

    this._bindEvents();
  }

  /**
   * Launch quickshop modal on click and set up id variable
   */
  _bindEvents() {
    $('body').on('click', '[data-quick-shop]', (event) => {
      event.preventDefault();

      this.id = $(event.currentTarget).data('product-id');

      if (!this.id) { return; }

      this.QuickShopModal.open();

      $('.modal-content').prepend('<svg class="icon icon-spinner"><use xlink:href="#icon-spinner" /></svg>');
    });
  }

  /**
   * Run ajax fetch of product and add to modal. Bind product functionality and show the modal
   * @param {jQuery} $modal - the root (appended) modal element.
   * @param {integer} id - product id
   */
  _fetchProduct($modal, id) {
    utils.api.product.getById(id, { template: 'quick-shop/quick-shop-modal' }, (err, response) => {
      $modal.find('.modal-content').append(response);

      // set up product utils (adding to cart, options)
      this.product = new ProductUtils(this.el, {
        priceWithoutTaxTemplate: productViewTemplates.priceWithoutTax,
        priceWithTaxTemplate: productViewTemplates.priceWithTax,
        priceSavedTemplate: productViewTemplates.priceSaved,
        variationPreviewImageTemplate: productViewTemplates.variationPreviewImage,
        callbacks: {
          switchImage: variationImgPreview
        }
      })

      this.product.init(this.context);

      // set up simple image slideshow
      new ProductImages('.modal-quick-shop .product-slides-wrap');

      // Init our color swatches
      this.swatches = new ColorSwatch();

      // reposition modal with content
      this.QuickShopModal.position();

      $modal.addClass('loaded');

      $('.modal-content').children('.icon-spinner').remove();
    });
  }
}

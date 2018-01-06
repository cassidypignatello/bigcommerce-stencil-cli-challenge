import PageManager from '../PageManager';
import ProductUtils from './product/ProductUtils';
import ProductImages from './product/ProductImages';
import ProductReviews from './product/ProductReviews';
import ColorSwatch from './product/ColorSwatch';
import productViewTemplates from './product/productViewTemplates';
import variationImgPreview from './product/variationImgPreview';
import Tabs from 'bc-tabs';
import fitVids from 'fitvids';
import Modal from 'bc-modal';
import ScrollLink from 'bc-scroll-link';

export default class Product extends PageManager {
  constructor() {
    super();

    this.el = '[data-product-container]';
    this.$el = $(this.el);

    this.fitVidsInitialized = false;

    this.reviewModal = new Modal({
      el: $('#review-modal'),
      modalClass: 'modal-narrow'
    });

    new ScrollLink({
      selector: '.reviews-jumplink',
      offset: -130
    });

    new ProductImages();
  }

  loaded(next) {
    // Product Utils
    this.ProductUtils = new ProductUtils(this.el, {
      priceWithoutTaxTemplate: productViewTemplates.priceWithoutTax,
      priceWithTaxTemplate: productViewTemplates.priceWithTax,
      priceSavedTemplate: productViewTemplates.priceSaved,
      variationPreviewImageTemplate: productViewTemplates.variationPreviewImage,
      callbacks: {
        switchImage: variationImgPreview
      }
    }).init(this.context);

    // Product Swatches
    this.swatches = new ColorSwatch(); // Init our color swatches

    // Reviews
    new ProductReviews(this.context);

    // Product UI
    this._bindEvents();
    this._initTabs();

    next();
  }

  _bindEvents() {
    // Activate the reviews tab when we jump down to it
    $('.product-reviews-link').on('click', () => {
      this.tabs.displayTabContent('#reviews');
    });

    // Show all the reviews
    $('.reviews-show-more-link').on('click', (event) => {
      event.preventDefault();

      $('.review-item.hidden').each((index, el) => {
        setTimeout(() => {
          $(el).revealer('show');
        }, index * 250);
      });

      $(event.currentTarget).hide();
    });

    // Show review modal
    $('.button-review-modal').on('click', (event) => {
      this.reviewModal.open();
    });

    $('.accordion-title').on('click', (event) => {
      event.preventDefault();
      this._accordionTabToggle(event);
    });
  }

  _initTabs() {
    this.tabs = new Tabs({
      afterSetup: (tabId) => {
        this._initVids(tabId);
        $('.tab-content-panel.active').prev('.accordion-title').addClass('is-open');

        this._bindTabScroll();
      },
      afterChange: (tabId) => {
        this._initVids(tabId);
      }
    });
  }

  _bindTabScroll() {
    const hash = window.location.hash;
    const $hashEl = $(hash);

    if ($hashEl.length === 0) return;

    $('html, body').animate({
      scrollTop: $hashEl.offset().top - 130
    }, 1000);

  }

  // Add accordion style buttons to toggle tab panels
  _accordionTabToggle(event) {
    const tab = $(event.currentTarget).find('a').attr('href');
    $(event.currentTarget).addClass('is-open').siblings('.accordion-title').removeClass('is-open');
    this.tabs.displayTabContent(tab);
  }

  // if page loads with tabs hidden, we need to wait until the proper tab is clicked before running fitVids.
  _initVids(tabId) {
    if (tabId == '#product-videos' && !this.fitVidsInitialized) {
      fitVids('.product-videos-list');
      this.fitVidsInitialized = true;
    }
  }
}

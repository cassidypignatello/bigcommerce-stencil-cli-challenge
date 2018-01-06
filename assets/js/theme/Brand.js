import PageManager from '../PageManager';
import FacetedSearch from './global/FacetedSearch';
import {initCompare, updateCompare} from './global/initCompare';
import Loading from 'bc-loading';
import svgIcon from './global/svgIcon';
import toggleFacet from './global/toggleFacet';
import ToggleFacetedRatingStars from './global/ToggleFacetedRatingStars';

export default class Brand extends PageManager {
  constructor() {
    super();

    this.$body = $(document.body);

    this._bindEvents();

    new ToggleFacetedRatingStars('.product-item-rating-facet');
  }

  loaded(next) {
    this._initializeFacetedSearch(this.context.listingProductCount);

    if ($('.compare-enabled').length) {
      initCompare();
    }

    next();
  }

  _bindEvents() {
    this.$body.on('click', '[data-listing-view]', (event) => {
      this._toggleView(event);
    });

    this.$body.on('click', '[data-faceted-search-toggle]', (event) => {
      event.preventDefault();
      $(event.currentTarget).toggleClass('is-open').next().toggleClass('is-open');
    });
  }

  _initializeFacetedSearch(productCount) {
    const loadingOptions = {
      loadingMarkup: `<div class="loading-overlay">${svgIcon('spinner')}</div>`,
      scrollLockClass: 'scroll-locked-loading',
    };

    const facetedSearchOverlay = new Loading(loadingOptions, false, '.product-listing');

    const facetedSearchOptions = {
      config: {
        brand: {
          shop_by_price: true,
          products: {
            limit: productCount,
          },
        },
      },
      template: {
        productListing: 'brand/product-listing',
        sidebar: 'brand/sidebar',
      },
      scope: {
        productListing: '[data-brand]',
        sidebar: '[data-brand-sidebar]',
      },
      toggleFacet: (event) => toggleFacet(event),
      showMore: 'brand/show-more',
      callbacks: {
        willUpdate: () => {
          facetedSearchOverlay.show();
        },
        didUpdate: () => {
          facetedSearchOverlay.hide();

          if ($('.compare-enabled').length) {
            updateCompare();
          }

          new ToggleFacetedRatingStars('.product-item-rating-facet');
        },
      },
    };

    this.FacetedSearch = new FacetedSearch(facetedSearchOptions);
  }

  _toggleView(event) {
    const $target = $(event.currentTarget);
    const template = $target.data('listing-view') === 'grid' ? 'brand/product-listing' : 'brand/product-listing-list';
    const options = {
      template: {
        productListing: template
      }
    };

    // re-init faceted search with new template option
    this.FacetedSearch.init(options);

    // toggle button classes
    $target.addClass('active').siblings().removeClass('active');
  }
}

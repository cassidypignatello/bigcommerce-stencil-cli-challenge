import PageManager from '../PageManager';
import FacetedSearch from './global/FacetedSearch';
import {initCompare, updateCompare} from './global/initCompare';
import svgIcon from './global/svgIcon';
import toggleFacet from './global/toggleFacet';
import ToggleFacetedRatingStars from './global/ToggleFacetedRatingStars';
import Loading from 'bc-loading';
import Tabs from 'bc-tabs';

export default class Brand extends PageManager {
  constructor() {
    super();

    this.$body = $(document.body);

    this._bindEvents();
    this._initTabs();

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

  _initTabs() {
    this.tabs = new Tabs({
      titleSelector: $('.search-tab-title'),
      afterSetup: (activeTab) => {
        if (!$('.product-results .product-block').length || (window.location.search.indexOf('section=content') > -1)) {
          setTimeout(() => {
            $('[href="#content-results"]').trigger('click');
          }, 10);
        }
      },
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
        product_results: {
          limit: productCount,
        },
      },
      template: {
        productListing: 'search/product-listing',
        sidebar: 'search/sidebar',
      },
      scope: {
        productListing: '[data-search]',
        sidebar: '[data-search-sidebar]',
      },
      toggleFacet: (event) => toggleFacet(event),
      showMore: 'search/show-more',
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
    const template = $target.data('listing-view') === 'grid' ? 'search/product-listing' : 'search/product-listing-list';
    const options = {
      template: {
        productListing: template,
      },
    };

    // re-init faceted search with new template option
    this.FacetedSearch.init(options);

    // toggle button classes
    $target.addClass('active').siblings().removeClass('active');
  }
}

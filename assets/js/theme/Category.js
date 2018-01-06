import PageManager from '../PageManager';
import FacetedSearch from './global/FacetedSearch';
import {initCompare, updateCompare} from './global/initCompare';
import Loading from 'bc-loading';
import svgIcon from './global/svgIcon';
import toggleFacet from './global/toggleFacet';
import ToggleFacetedRatingStars from './global/ToggleFacetedRatingStars';

export default class Category extends PageManager {
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
        category: {
          shop_by_price: true,
          products: {
            limit: productCount,
          },
        },
      },
      toggleFacet: (event) => toggleFacet(event),
      showMore: 'category/show-more',
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
    const targetClass = $target.data('listing-view');
    const oppositeClass = $target.siblings().data('listing-view');
    const template = targetClass === 'grid' ? 'category/product-listing' : 'category/product-listing-list';
    const options = {
      template: {
        productListing: template,
      },
    };

    // re-init faceted search with new template option
    this.FacetedSearch.init(options);

    // toggle button classes
    //$target.addClass('active').siblings().removeClass('active');
    $target.closest('.product-listing-grid').toggleClass(`${targetClass} ${oppositeClass}`);

    // TODO - possibly add this back after testing in live environ
    // if (typeof(Storage) !== 'undefined') {
    //   localStorage.setItem('listingView', $target.data('listing-view'));
    // }
  }
}

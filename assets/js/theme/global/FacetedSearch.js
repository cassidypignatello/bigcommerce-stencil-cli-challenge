import { hooks, api } from '@bigcommerce/stencil-utils';
import Url from 'url';
import 'history.js/scripts/bundled-uncompressed/html4+html5/jquery.history';
import Loading from 'bc-loading';

export default class FacetedSearch {
  constructor(options, callback) {
    this.callback = callback;
    this.$body = $(document.body);

    this.options = $.extend({
      config: {
        category: {
          shop_by_price: true
        }
      },
      template: {
        productListing: 'category/product-listing',
        sidebar: 'category/sidebar'
      },
      scope: {
        productListing: '[data-category]',
        sidebar: '[data-category-sidebar]',
      },
      facetToggle: '[data-facet-toggle]',
      moreToggle: '[data-facet-more]',
      toggleFacet: () => console.log('Facet toggled.'),
    }, options);

    const loadingOptions = {
      loadingMarkup: '<div class="loading"></div>',
      visibleClass: 'visible',
      scrollLockClass: 'scroll-locked',
    };

    this.facetedSearchOverlay = new Loading(loadingOptions, true, '[data-faceted-search]');

    this.callbacks = $.extend({
      willUpdate: () => this._showOverlay(),
      didUpdate: () => this._hideOverlay(),
    }, options.callbacks);

    this._bindEvents();
  }

  init(options) {
    this.options.template = $.extend({
      productListing: this.options.template.productListing,
      sidebar: this.options.template.sidebar,
    }, options.template);

    this._onStateChange();
  }

  _bindEvents() {
    this.$body.on('click', this.options.facetToggle, (event) => {
      this._toggleFacet(event);
    });

    this.$body.on('click', this.options.moreToggle, (event) => {
      this._showAdditionalFilters(event);
    });

    $(window).on('statechange', this._onStateChange.bind(this));
    hooks.on('facetedSearch-facet-clicked', this._onFacetClick.bind(this));
    hooks.on('facetedSearch-range-submitted', this._onRangeSubmit.bind(this));
    hooks.on('sortBy-submitted', this._onSortBySubmit.bind(this));
  }

  _showAdditionalFilters(event) {
    // Show/hide full facet list based on setting  for product filtering
    this.callbacks.willUpdate();
    event.preventDefault();

    const $showMoreLink = $(event.currentTarget);
    const $originalList = $showMoreLink.siblings('.facet-default');
    const facet = $showMoreLink.attr('data-facet-more');
    const facetUrl = History.getState().url;

    // Show/Hide extra facets based on settings for product filtering
    if (!$showMoreLink.siblings('.faceted-search-option-columns').length) {
      if (this.options.showMore) {
        api.getPage(facetUrl, {
          template: this.options.showMore,
          params: {
            list_all: facet,
          },
        }, (err, response) => {
          if (err) {
            throw new Error(err);
          }
          $(response).insertAfter($originalList);
          $('.faceted-search-option-columns').toggle();
          this.callbacks.didUpdate();
        });
      }
    } else {
      $('.faceted-search-option-columns').toggle();
      this.callbacks.didUpdate();
    }

    // show/hide original facet list
    $originalList.toggle();

    // Toggle show more/less link
    $showMoreLink.children().toggle();
  }

  _toggleFacet(event) {
    this.options.toggleFacet(event);
  }

  _onFacetClick(event) {
    event.preventDefault();

    const $target = $(event.currentTarget);
    const url = $target.attr('href');

    this._goToUrl(url);
  }

  _onRangeSubmit(event) {
    event.preventDefault();

    const url = Url.parse(location.href);
    let queryParams = $(event.currentTarget).serialize();

    if (this.$body.hasClass('template-search')) {
      const currentSearch = `search_query=${$('[data-faceted-search]').data('search-query')}` || '';
      queryParams = `${queryParams}&${currentSearch}`;
    }

    this._goToUrl(Url.format({ pathname: url.pathname, search: '?' + queryParams }));
  }

  _onSortBySubmit(event) {
    event.preventDefault();

    const url = Url.parse(location.href, true);
    const queryParams = $(event.currentTarget).serialize().split('=');

    url.query[queryParams[0]] = queryParams[1];
    delete url.query['page'];

    this._goToUrl(Url.format({ pathname: url.pathname, query: url.query }));
  }

  _onStateChange(event) {
    this.callbacks.willUpdate();

    api.getPage(History.getState().url, this.options, (err, content) => {
      if (err) {
        throw new Error(err);
        this.callbacks.didUpdate();
        return;
      }

      if (content) {
        $(this.options.scope.productListing).html(content.productListing);
        $(this.options.scope.sidebar).html(content.sidebar);
        this.callbacks.didUpdate();
      }
    });
  }

  _goToUrl(url) {
    History.pushState({}, document.title, url);
  }
}

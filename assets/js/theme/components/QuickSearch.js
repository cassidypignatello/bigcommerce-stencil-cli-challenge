import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import svgIcon from '../global/svgIcon';

export default class QuickSearch {
  constructor() {
    this.$quickSearch = $('[data-quick-search]');
    this.spinner = `${svgIcon('spinner')}`;

    this._bindEvents();
  }

  _bindEvents() {
    $('.top-bar .search-input, .navigation-mobile .search-input').on({
      keyup: _.debounce((event) => {
        const searchQuery = $(event.currentTarget).val();

        // Only perform search with at least 3 characters
        if (searchQuery.length < 3) {
          this.$quickSearch.revealer('hide');

          return;
        } else {
          this.$quickSearch
            .revealer('show')
            .html(this.spinner);
        }

        this._doSearch(searchQuery);
      }, 100),
      focus: (event) => {
        const searchQuery = $(event.currentTarget).val();

        if (searchQuery.length < 3 && !$('.quick-search-item').length) {
          return;
        }

        this.$quickSearch.revealer('show');
      },
      blur: () => {
        this.$quickSearch.revealer('hide');
      },
    });
  }

  _doSearch(searchQuery) {
    utils.api.search.search(searchQuery, { template: 'quick-results' }, (error, response) => {
      if (error) {
        return false;
      }

      this.$quickSearch.html(response);
    });
  }
}

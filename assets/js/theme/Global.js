import 'core-js/es6/promise';

import PageManager from '../PageManager';
import FormValidator from './utils/FormValidator';
import ScrollLink from 'bc-scroll-link';
import CurrencySelector from './components/CurrencySelector';
import Dropdown from './global/Dropdown';
import Header from './global/Header';
import MiniCart from './global/MiniCart';
import Alert from './components/Alert';
import QuickShop from './product/QuickShop';
import MegaNav from './global/MegaNav';
import QuickSearch from './components/QuickSearch';

export default class Global extends PageManager {
  constructor() {
    super();

    new Dropdown($('.dropdown'));
    new Header($('.site-header'));
    new MegaNav($('.navigation-container'));
    new MiniCart();
    new CurrencySelector('[data-currency-selector]');
    new QuickSearch();

    this.pageAlerts = new Alert($('[data-alerts]'));

    this._toggleScrollLink();
    this._initAnchors();
  }

  /**
   * You can wrap the execution in this method with an asynchronous function map using the async library
   * if your global modules need async callback handling.
   * @param next
   */
  loaded(next) {
    // global form validation
    this.validator = new FormValidator(this.context);
    this.validator.initGlobal();

    // QuickShop
    if ($('[data-quick-shop]').length) {
      new QuickShop(this.context);
    }

    next();
  }

  _toggleScrollLink() {
    $(window).on('scroll', (e) => {
      const winScrollTop = $(e.currentTarget).scrollTop();
      const winHeight = $(window).height();

      if (winScrollTop > winHeight) {
        $('.button-top').addClass('show');
      } else {
        $('.button-top').removeClass('show');
      }
    });
  }

  _initAnchors() {
    const anchorSelector = '.cms-page [href^="#"]';

    $(anchorSelector).each((index, element) => {
      const targetId = $(element).attr('href');
      const target = targetId.substring(1);

      $(element).attr('data-scroll', targetId);
      $(`[name='${target}']`).attr('id', target);
    });

    new ScrollLink({
      selector: anchorSelector,
      offset: -60,
    });
  }
}

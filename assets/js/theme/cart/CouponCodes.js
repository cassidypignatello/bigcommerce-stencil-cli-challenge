import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import refreshContent from './refreshContent';

export default class CouponCodes {
  constructor(el, options) {
    this.$el = $(el);
    this.couponAlerts = new Alert($('[data-alerts]'));

    this.options = $.extend({
      context: {},
      visibleClass: 'visible',
    }, options);

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
    }, options.callbacks);

    this.init();
  }

  init() {
    this.$toggle = $('[data-coupon-code-toggle]', this.$el);
    this.$form = $('[data-coupon-code-form]', this.$el);
    this.$input = $('[data-coupon-code-input]', this.$form);

    this._bindEvents();
  }

  _bindEvents() {
    this.$form.on('submit', (event) => {
      event.preventDefault();
      this._addCode();
    });
  }

  _addCode() {
    const code = this.$input.val();

    this.couponAlerts.clear();
    this.callbacks.willUpdate();

    if (!code) {
      this.couponAlerts.error(this.options.context.couponCodeEmptyInput, true);
      return this.callbacks.didUpdate();
    }

    utils.api.cart.applyCode(code, (err, response) => {
      if (response.data.status === 'success') {
        refreshContent(this.callbacks.didUpdate);
      } else {
        this.couponAlerts.error(response.data.errors.join('\n'), true);
        this.callbacks.didUpdate();
      }
    });
  }
}

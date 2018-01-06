import utils from '@bigcommerce/stencil-utils';
import svgIcon from './svgIcon';

export default class MiniCart {
  constructor() {
    this.cartChangeRemoteHooks = [
      'cart-item-add-remote',
      'cart-item-update-remote',
      'cart-item-remove-remote',
    ];

    this._bindEvents();
  }

  _bindEvents() {
    // Update mini cart on remote add
    this.cartChangeRemoteHooks.forEach((hook) => {
      utils.hooks.on(hook, () => {
        this._update();
      });
    });

    // Remove cart item using minicart button
    $('body').on('click', '.mini-cart [data-cart-item-remove]', (event) => {
      event.preventDefault();

      this._removeProductMiniCart(event);
    });
  }

  /**
   * Update the mini cart contents
   */
  _update(callback) {
    const $miniCartCount = $('.icon-cart-count');
    const $miniCartContents = $('.mini-cart-contents');

    // Update the minicart items when
    // a product is added / removed
    utils.api.cart.getContent({ template: 'mini-cart/mini-cart-contents' }, (err, response) => {
      $miniCartContents.html(response);

      // Update the header cartCount
      const cartCount = parseInt($(response).find('.cart-count').text(), 10);

      if (cartCount) {
        $miniCartCount.addClass('show').find('.number').html(cartCount);
      } else {
        $miniCartCount.removeClass('show');
      }

      if (callback) {
        callback();
      }
    });
  }

  /**
   * Remove a product from the mini cart
   */
  _removeProductMiniCart(event) {
    const $el = $(event.currentTarget);
    const itemId = $el.data('product-id');

    if (! itemId) { return; }

    $el
      .closest('.mini-cart-item')
      .addClass('removing')
      .append(`${svgIcon('spinner')}`);

    utils.api.cart.itemRemove(itemId, (err, response) => {
      if (response.data.status === 'succeed') {
        this._update();
      } else {
        alert(response.data.errors.join('\n'));
        $el
          .closest('.mini-cart-item')
          .removeClass('removing')
          .find('.icon-spinner')
          .remove();
      }
    });
  }
}

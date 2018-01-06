import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import ProgressButton from '../utils/ProgressButton';
import QuantityWidget from '../components/QuantityWidget';

// TODO: Set up image switching on option change.

export default class ProductUtils {
  constructor(el, options) {
    this.$el = $(el);
    this.options = options;
    this.productId = this.$el.find('[data-product-id]').val();
    this.pageAlerts = new Alert($('[data-alerts]'));
    this.productAlerts = new Alert($('[data-product-message]'));
    this.productTitle = $(el).data('product-title');

    this.progressButton = new ProgressButton();
    new QuantityWidget({scope: '[data-product-id]'});

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
      switchImage: (url) => console.log(`Image switch attempted for ${url}`),
    }, options.callbacks);
  }

  init(context) {
    this.context = context;

    this._bindProductOptionChange();

    this._boundCartCallback = this._addProductToCart.bind(this);
    utils.hooks.on('cart-item-add', this._boundCartCallback);

    this._bindAddWishlist();

    // Trigger a change event so the values are correct for pre-selected options
    $('[data-cart-item-add]').find('input[type="radio"], input[type="checkbox"], select').first().change();

    if (this.$el.hasClass('product-single')) {
      this._updateAttributes(window.BCData.product_attributes);
    } else {
      utils.hooks.emit('product-option-change');
    }
  }

  /**
   *
   * Cleanup - useful for closing quickshop modals
   *
   */
  destroy() {
    utils.hooks.off('cart-item-add', this._boundCartCallback);
  }

  /**
   * Cache an object of jQuery elements for DOM updating
   * @param  jQuery $el - a wrapping element of the scoped product
   * @return {object} - buncha jQuery elements which may or may not exist on the page
   */
  _getViewModel($el) {
    return {
      $price: $('[data-product-price-wrapper="without-tax"]', $el),
      $priceWithTax: $('[data-product-price-wrapper="with-tax"]', $el),
      $saved: $('[data-product-price-saved]', $el),
      $sku: $('[data-product-sku]', $el),
      $weight: $('[data-product-weight]', $el),
      $addToCart: $('[data-button-purchase]', $el),
      $imagePreview: $('[data-variation-preview]', $el),
      stock: {
        $selector: $('[data-product-stock]', $el),
        $level: $('[data-product-stock-level]', $el),
      },
    };
  }

  /**
   * Bind product options changes.
   */
  _bindProductOptionChange() {
    utils.hooks.on('product-option-change', (event, changedOption) => {
      const $changedOption = $(changedOption);
      const $form = $changedOption.parents('form');

      // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
      if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
        return;
      }

      this.pageAlerts.clear();

      utils.api.productAttributes.optionChange(this.productId, $form.serialize(), (err, response) => {
        const viewModel = this._getViewModel(this.$el);
        const data = response ? response.data : {};

        if (this.$el.find('[data-product-options-count]').val < 1) {
          return;
        }

        this._updateAttributes(data);

        // updating price
        if (viewModel.$price.length) {
          const priceStrings = {
            price: data.price,
            excludingTax: this.context.productExcludingTax,
          };
          viewModel.$price.html(this.options.priceWithoutTaxTemplate(priceStrings));
        }

        if (viewModel.$priceWithTax.length) {
          const priceStrings = {
            price: data.price,
            includingTax: this.context.productIncludingTax,
          };
          viewModel.$priceWithTax.html(this.options.priceWithTaxTemplate(priceStrings));
        }

        if (viewModel.$saved.length) {
          const priceStrings = {
            price: data.price,
            savedString: this.context.productYouSave,
          };
          viewModel.$saved.html(this.options.priceSavedTemplate(priceStrings));
        }

        // stock
        if (data.stock) {
          viewModel.stock.$selector.removeClass('product-details-hidden');
          viewModel.stock.$level.text(data.stock);
        } else {
          viewModel.stock.$level.text('0');
        }

        // update sku if exists
        if (viewModel.$sku.length) {
          viewModel.$sku.html(data.sku);
        }

        // update weight if exists
        if (viewModel.$weight.length) {
          viewModel.$weight.html(data.weight.formatted);
        }

        // handle product variant image if exists
        if (data.image) {
          const productImageUrl = utils.tools.image.getSrc(
            data.image.data,
            this.context.themeImageSizes.zoom
          );
          const zoomImageUrl = utils.tools.image.getSrc(
            data.image.data,
            this.context.themeImageSizes.product
          );
          const inputId = $changedOption.attr('name') + $changedOption.val();

          this.callbacks.switchImage(productImageUrl, zoomImageUrl, data.image.alt, inputId);
        }

        // update submit button state
        if (!data.purchasable || !data.instock) {
          setTimeout(() => {
            this.pageAlerts.error(data.purchasing_message || this.context.productOptionUnavailable, true);
          }, 50);
          viewModel.$addToCart
            .addClass(this.buttonDisabledClass)
            .prop('disabled', true);
        } else {
          viewModel.$addToCart
            .removeClass(this.buttonDisabledClass)
            .prop('disabled', false);
        }
      });
    });
  }

  _updateAttributes(data) {
    const behavior = data.out_of_stock_behavior;
    const inStockIds = data.in_stock_attributes;
    const outOfStockMessage = ` (${data.out_of_stock_message})`;

    if (behavior !== 'hide_option' && behavior !== 'label_option') {
      return;
    }

    $('[data-product-attribute-value]', this.$el).each((i, attribute) => {
      const $attribute = $(attribute);
      const attrId = parseInt($attribute.data('product-attribute-value'), 10);

      if (inStockIds.indexOf(attrId) !== -1) {
        this._enableAttribute($attribute, behavior, outOfStockMessage);
      } else {
        this._disableAttribute($attribute, behavior, outOfStockMessage);
      }
    });
  }

  _disableAttribute($attribute, behavior, outOfStockMessage) {
    if (behavior === 'hide_option') {
      $attribute.hide();

      if (this._getAttributeType($attribute) === 'set-select') {
        $attribute.attr('disabled', true);
      }
    } else {
      if (this._getAttributeType($attribute) === 'set-select') {
        $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
      } else {
        $attribute.addClass('option-unavailable');
      }
    }
  }

  _enableAttribute($attribute, behavior, outOfStockMessage) {
    if (behavior === 'hide_option') {
      $attribute.show();

      if (this._getAttributeType($attribute) === 'set-select') {
        $attribute.removeAttr('disabled');
      }
    } else {
      if (this._getAttributeType($attribute) === 'set-select') {
        $attribute.html($attribute.html().replace(outOfStockMessage, ''));
      } else {
        $attribute.removeClass('option-unavailable');
      }
    }
  }

  _getAttributeType($attribute) {
    const $parent = $attribute.closest('[data-product-attribute]');
    return $parent ? $parent.data('product-attribute') : null;
  }

  /**
   * Add to cart
   */
  _addProductToCart(event, form) {
    // Bail out if browser doesn't support FormData
    if (window.FormData === undefined) {
      return;
    }

    event.preventDefault();

    const $button = $(event.currentTarget).closest('.product-block').find('.add-to-cart');
    const quantity = this.$el.find('input.product-quantity').val();
    const formData = new FormData(form);

    // Update the button state
    this.progressButton.progress($button);

    // Remove old alerts
    this.pageAlerts.clear();

    // Ajax add item to cart
    utils.api.cart.itemAdd(formData, (err, response) => {
      // Parse the ajax response so we can pass it to the message.
      response = this._parseResponse(err, response, this.productTitle, quantity);

      this.pageAlerts.message(response.message, response.status, true);

      // Scroll to top on mobile
      if ($(window).width() < 1024) {
        $('html, body').animate({
          scrollTop: 0
        });
      }

      // Reset the button state
      this.progressButton.complete($button);

      // Update the mini cart & clear inputs if success
      if (response.status === 'success') {
        this._clearInputs();

        $.event.trigger('cart-item-add-success');

        setTimeout(() => {
          this.pageAlerts.clear();
        }, 5000);
      }
    });
  }

  /**
   * Build our error/success messages based on response.
   * @param {object} err - the (potential) returned error object.
   * @param {object} response - the ajax response from the add-to-cart action.
   * @param {string} title - The name of the added product.
   * @param {number} quantity - The added quantity.
   */
  _parseResponse(err, response, title, quantity) {
    let message = '';
    let status = '';

    if (err || response.data.error) {
      status = 'error';

      if (response.data.error) {
        message = response.data.error;
      } else {
        message = this.context.messagesProductGeneral;
      }

    } else {
      status = 'success';
      message = this.context.messagesProductAddSuccess;
      message = message
                  .replace('*product*', `"${title}"`)
                  .replace('*cart_link*', `<a href=${this.context.urlsCart}>${this.context.cartLink}</a>`)
                  .replace('*checkout_link*', `<a href=${this.context.urlsCheckout}>${this.context.checkoutLink}</a>`);
    }

    return {
      status: status,
      message: message
    }
  }

  /**
   * Hide alert message
   *
   */
  _clearMessage($el) {
    $el
      .revealer('hide')
      .addClass('dismissed')
      .removeClass('error success');
  }

  /**
   * On successful ajax cart add we want to clear all option inputs.
   *
   */
  _clearInputs() {
    const $inputs = this.$el.find('[name^="attribute"]');

    $inputs.each((index, input) => {
      const $input = $(input);

      switch (input.type) {
        case 'checkbox':
          $input.prop('checked', false);
          break;
        case 'radio':
          $input.prop('checked', false);
          if ($input.hasClass('swatch-radio')) {
            $input.parent('.swatch-wrap').removeClass('checked');
            $input.closest('.form-field').find('.swatch-value').empty();
          }
          break;
        case 'select-one':
          $input.val($input.find('[value]:first').val()); // reset selects to first selectable value
          break;
        default:
          $input.val("");
      }
    });
  }

  /**
   * Ajax add to wishlist
   *
   */
  _bindAddWishlist() {
    // TODO confirm URL when multiple lists enabled
    $('.wishlist-form').on('submit', (event) => {

      const url = $(event.currentTarget).attr('action');
      const $button = $(event.currentTarget).find('.add-to-wishlist');
      const title = $(event.currentTarget).closest('.product-block').data('product-title');

      if ($('[data-customer]').length) {
        event.preventDefault();

        this.progressButton.progress($button);

        $.ajax({
          type: "POST",
          url: url,
          data: $(event.currentTarget).serialize(), // serializes the form's elements.
          success: (data) => {
            this.pageAlerts.success(this.context.messagesWishlistAddSuccess.replace('*product*', title), true);
          },
          error: () => {
            this.pageAlerts.error(this.context.messagesWishlistAddError.replace('*product*', title), true);
          },
          complete: () => {
            this.progressButton.complete($button);
          }
        });
      }
    });
  }
}

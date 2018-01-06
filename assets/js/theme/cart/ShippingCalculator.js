import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import Modal from 'bc-modal';
import refreshContent from './refreshContent';

export default class ShippingCalculator {
  constructor(options = {}) {

    this.options = $.extend({
      $scope: $('[data-cart-totals]'),
      modalId: '#shipping-modal-displayed',
    }, options);

    this.callbacks = $.extend({
      // willUpdate: () => console.log('Update requested.'),

      // Close the modal when update completed
      didUpdate: () => {
        this.ShippingModal.close();
      },
    }, options.callbacks);

    // Set up the modal in which to display the shipping calculator
    this.ShippingModal = new Modal({
      el: $('#shipping-modal'),
      modalId: this.options.modalId,
      modalClass: 'modal-narrow',
      afterShow: this._bindEvents.bind(this),
    });

    // When clicking one of the shipping calc toggles, launch the modal
    this.options.$scope.on('click','[data-shipping-calculator-toggle]', () => {
      this.ShippingModal.open();
    });
  }

  // Bindings for within the modal
  _bindEvents($modal) {

    // Bind class to the modal content
    this.$shippingModalContent = $modal;

    this.shippingAlerts = new Alert($('[data-alerts]'));

    // When changing country, update the available province / states
    this.$shippingModalContent.on('change', 'select[name="shipping-country"]', (event) => {
      this._updateStates(event);
    });

    // Bind the cart actions to the updated modal display.
    // Calculate shipping on form submit.
    this.$shippingModalContent.on('submit', '[data-shipping-calculator] form', (event) => {
      event.preventDefault();
      this._calculateShipping();
    });

    // Bind the "cancel" button
    this.$shippingModalContent.on('click', '[data-cancel-shipping]', (event) => {
      event.preventDefault();
      this.ShippingModal.close();
    });

    this.$shippingQuotes = $('[data-shipping-quotes]', this.$shippingModalContent);
    // Reset the displayed quote (if there was one from a previous attempt)
    this.$shippingQuotes.empty();
  }

  // Update the province / states displayed based on country.
  _updateStates(event) {
    const $target = $(event.currentTarget);
    const country = $target.val();
    const $stateElement = $('[name="shipping-state"]');

    utils.api.country.getByName(country, (err, response) => {
      if (response.data.states.length) {
        const stateArray = [];
        stateArray.push(`<option value="">${response.data.prefix}</option>`);
        $.each(response.data.states, (i, state) => {
          stateArray.push(`<option value="${state.id}">${state.name}</option>`);
        });
        $stateElement.parent().addClass('form-select-wrapper');
        $stateElement.replaceWith(`<select class="form-select form-input form-input-short" id="shipping-state" name="shipping-state" data-field-type="State">${stateArray.join(' ')}</select>`);
      } else {
        $stateElement.parent().removeClass('form-select-wrapper');
        $stateElement.replaceWith(`<input class="form-input form-input-short" type="text" id="shipping-state" name="shipping-state" data-field-type="State" placeholder="${this.options.context.shippingState}">`);
      }
    });
  }

  //Calculates the shipping method
  _calculateShipping() {

    const params = {
      country_id: $('[name="shipping-country"]', this.$shippingModalContent).val(),
      state_id: $('[name="shipping-state"]', this.$shippingModalContent).val(),
      zip_code: $('[name="shipping-zip"]', this.$shippingModalContent).val(),
    };

    utils.api.cart.getShippingQuotes(params, 'cart/shipping-quotes', (err, response) => {
      if (response.data.quotes) {
        this.shippingAlerts.clear();
        this.$shippingQuotes.html(response.content);
      } else {
        this.shippingAlerts.error(response.data.errors.join('\n'), true);
      }
      this.ShippingModal.position();

      // bind the shipping method radios
      this.$shippingQuotes.find('.form').on('submit', (event) => {
        event.preventDefault();

        const quoteId = $('[data-shipping-quote]:checked').val();

        utils.api.cart.submitShippingQuote(quoteId, (response) => {
          refreshContent(this.callbacks.didUpdate);
        });
      });
    });
  }
}

export default class Dropdown {
  constructor(el) {
    this.$el = $(el);

    this._bindEvents();
  }

  _bindEvents() {
    // Toggle dropdown on click
    this.$el.find('.dropdown-toggle').on('click', (e) => {
      this._toggleDropdown(e);

      // return false so click anywhere to close will work
      return false;
    });

    // Close when clicking elsewhere, except in open dropdown
    $(document).on('click', (event) => {
      if ($(event.target).closest('.dropdown').hasClass('dropdown-open') || $(event.target).hasClass('override-dropdown') || $(event.target).parents().hasClass('override-dropdown')) {
        return;
      }

      if (this.$el.hasClass('dropdown-open')) {
        this._toggleDropdown(event, false);
      }
    });
  }

  _toggleDropdown(event, open) {
    const $target = $(event.currentTarget).closest('.dropdown');

    // Close any open ones first
    $('.dropdown')
      .not($target)
      .removeClass('dropdown-open')
      .find('.dropdown-panel')
      .revealer('hide');

    // Toggle panel
    $target
      .toggleClass('dropdown-open', open)
      .find('.dropdown-panel')
      .revealer('toggle');
  }
}

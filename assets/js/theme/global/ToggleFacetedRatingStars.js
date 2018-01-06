export default class ToggleFacetedRatingStars {
  constructor(el) {
    this.$el = $(el);

    this.$el
      .filter('.full')
      .prevAll('a')
      .addClass('full');

    this._bindEvents();
  }

  _bindEvents() {
    $(this.$el).on({
      mouseenter: (event) => {
        $(event.currentTarget).prevAll().addClass('full-hover');
      },
      mouseleave: (event) => {
        $(event.currentTarget).prevAll().removeClass('full-hover');
      },
    });
  }
}

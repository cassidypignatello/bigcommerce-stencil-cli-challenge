export default class MegaNav {
  constructor(el) {
    this.$container = $(el);
    this.$rootList = this.$container.find('.navigation-root-list');
    this.$childContainer = this.$container.find('.navigation-child-container');
    this.$dropdownToggle = this.$container.closest('.dropdown').find('.dropdown-toggle');
    this.$dropdownPanel = $('.mega-nav-panel');

    this._bindEvents();
  }

  _bindEvents() {
    this.$container.on('click', '[data-navigation-root-item]', (e) => {
      e.preventDefault();
      this._findChild(e, true);
    });

    this.$container.on('click', '[data-find-child]', (e) => {
      e.preventDefault();
      this._findChild(e);
    });

    this.$container.on('click', '[data-find-parent]', (e) => {
      console.log('here');
      e.preventDefault();
      this._findParent(e);
    });

    this.$dropdownToggle.on('click', (e) => {
      this._clearChildren(true);
    });

    // Show first child meno on panel reveal
    this.$dropdownPanel.on('revealer-show', () => {
      $('[data-navigation-root-item]:first-child').trigger('click');
    });

    // Prevent the child menus from firing the panel's event handler
    $('.navigation-child-list-container').on('revealer-show', (e) => {
      e.stopPropagation();
    });
  }

  _findChild(e, fromRoot = false) {
    const $el = $(e.currentTarget);
    const childId = $el.attr('data-child-category-id');
    const $childList = this.$childContainer.find(`[data-parent-category-id="${childId}"]`);

    if ($childList.length > 0) {
      this._clearChildren(fromRoot);

      $childList.revealer('show');

      if (fromRoot) {
        $el.addClass('active');
      }
    }
  }

  _findParent(e) {
    const $el = $(e.currentTarget);
    const parentId = $el.closest('.navigation-child-list-container').attr('data-parent-category-id');
    const $parentList = this.$childContainer.find(`[data-child-category-id="${parentId}"]`).closest('.navigation-child-list-container');

    if ($parentList.length > 0) {
      this._clearChildren();

      $parentList.revealer('show');
    }
  }

  _clearChildren(clearActive = false) {
    if (clearActive) {
      this.$rootList.find('.active').removeClass('active');
    }

    this.$childContainer.find('.navigation-child-list-container.visible').revealer('hide');
  }

}

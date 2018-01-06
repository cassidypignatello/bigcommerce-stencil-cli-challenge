import utils from '@bigcommerce/stencil-utils';
import Modal from 'bc-modal';
import slick from 'slick-carousel';

export default class Header {
  constructor(el) {
    this.$el = $(el);
    this.$body = $('body');
    this.$wrapper = $('.site-wrapper');
    this.$searchWrap = $('.search-wrap');

    this.cartOpenClass = 'mini-cart-open';
    this.searchClosedClass = 'search-compressed';
    this.navOpenClass = 'nav-mobile-open scroll-locked';

    this._bindEvents();
    this._positionMegaNav();
    this._headerScroll();
    this._megaNavImages();
  }

  _bindEvents() {
    // Toggle search
    $('.button-search-submit', this.$searchWrap).on('click', (event) => {
      if (this.$searchWrap.hasClass(this.searchClosedClass)) {
        event.preventDefault();
        this._toggleSearch();
      }
    });

    // Close search if empty
    $(document).on('click', (event) => {
      if ($(event.target).parents('.search-wrap').length) {
        return;
      }

      // Close if search is open and input is empty.
      if (!this.$searchWrap.hasClass(this.searchClosedClass) && !this.$searchWrap.find('.search-input').val().length) {
        this._toggleSearch(true);
      }
    });

    // Toggle mobile nav
    $('.button-mobile-nav-toggle').on('click', () => {
      this._toggleMobileNav();
    });

    // Reset the mobile panel if window is made larger
    $(window).resize(() => {
      if ($('.navigation-mobile').is(':hidden')) {
        this._toggleMobileNav(false);
      }

      if (this.$wrapper.hasClass('sticky')) {
        this._positionMegaNav('left');
      } else {
        this._positionMegaNav('center');
      }
    });
  }

  _toggleSearch(open) {
    this.$searchWrap.toggleClass(this.searchClosedClass, open);

    this.$searchWrap.find('.search-input').focus();
  }

  _toggleMobileNav(open) {
    this.$body.toggleClass(this.navOpenClass, open);

    if (open === false) {
      $('.navigation-mobile').revealer('hide');
    } else {
      $('.navigation-mobile').revealer('toggle');
    }
  }

  _headerScroll() {
    const $win = $(window);
    const scrollClass = 'sticky';
    let threshold = $('.top-bar').height() + $('.site-alerts').height();
    let st = $win.scrollTop();
    // Set initial header state
    let headerState = (st > threshold) ? true : false;

    // if we load the page part way down
    if ($win.scrollTop() > threshold) {
      this.$wrapper.addClass(scrollClass);

      this._positionMegaNav('left');
    }

    $win.scroll(() => {
      st = $win.scrollTop();
      threshold = $('.top-bar').height() + $('.site-alerts').height();
      const stickyHeader = (st > threshold) ? true : false;

      // When state changes from original value
      if (headerState !== stickyHeader) {
        if (stickyHeader) {
          this._positionMegaNav('left');
        } else {
          this._positionMegaNav('center');
        }

        this.$wrapper.toggleClass(scrollClass, stickyHeader);

        // Swap value so state change is triggered next time threshold is crossed
        headerState = !headerState;
      }
    });
  }

  _positionMegaNav(location = 'center') {
    $('.mega-nav-panel').each((index, el) => {
      const $el = $(el);
      const $container = $el.closest('.container');
      const $navigation = $el.closest('.navigation');
      const containerWidth = $container.width();
      const navWidth = $navigation.width();
      let offsetX;

      if (location === 'center') {
        if (containerWidth === navWidth) {
          offsetX = -$navigation.offset().left;
        } else {
          offsetX = -($container.offset().left + ((containerWidth - navWidth) / 2 ));
        }
      } else if (location === 'left') {
        offsetX = -$container.offset().left;
      }

      $el.css({left: offsetX});
    });
  }

  _megaNavImages() {
    const $categoryImages = $('.category-image-container');
    const playSpeed = 4000;

    if (!$categoryImages.children().length) {
      $categoryImages.closest('.mega-nav-panel').addClass('no-images');
      return;
    }

    $categoryImages.slick({
      arrows: false,
      fade: true,
      autoplay: true,
      speed: 800,
      autoplaySpeed: playSpeed,
    });

    // Set the bg of the slideshow to the current slide image,
    // so there's no time where image isn't visible.
    $('.mega-nav .dropdown-toggle').on('click', (event) => {
      const currentSlideSrc = $('.category-image').eq($categoryImages.slick('slickCurrentSlide')).find('img').attr('src');
      $categoryImages.css({
        backgroundImage: `url(${currentSlideSrc})`
      });

      // re-calculate layout
      $('.mega-nav-panel').one('trend', () => {
        $(window).trigger('resize');
      });
    });

    $('.mega-nav-list .has-image').each((index, el) => {
      $(el).on({
        mouseenter: (event) => {
          $categoryImages
            .slick('slickPause')
            .slick('slickGoTo', index, true);

          $('.category-image')
            .eq($categoryImages.slick('slickCurrentSlide'))
            .find('.category-link')
            .addClass('hover');
        },
        mouseleave: (event) => {
          $('.category-link').removeClass('hover');

          $categoryImages.slick('slickPlay');
        }
      });
    });
  }
}

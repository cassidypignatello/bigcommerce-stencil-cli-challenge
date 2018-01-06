import Tabs from 'bc-tabs';
import slick from 'slick-carousel';
import PageManager from '../PageManager';
import svgIcon from './global/svgIcon';
import imagesLoaded from 'imagesloaded';

export default class Home extends PageManager {
  constructor() {
    super();
    this.$carousel = $('[data-home-carousel]');

    this._initSlick();

    this._bindEvents();

    this._initTabs();
  }

  _initTabs() {
    this.tabs = new Tabs({
      afterSetup: () => {
        $('.product-carousel').slick('setPosition');
      },
      afterChange: () => {
        $('.product-carousel').slick('setPosition');
      }
    });
  }

  _bindEvents() {
    $('.carousel-navigation-item.next').on('click', () => {
      $('.carousel').slick('slickNext');
    });

    $('.carousel-navigation-item.previous').on('click', () => {
      $('.carousel').slick('slickPrev');
    });
  }

  _initSlick() {
    // Hero carousel
    const $carousel = $('.carousel');
    const speed = $carousel.data('swap-frequency');

    $carousel
      .on('init', (event, slick) => {
        $('.slick-active .carousel-item-info').addClass('show');
        $('.carousel-item-info:not(:has(.caption-content))').addClass('no-content');
        // Fix misalignment because no scrollbar on load
        $(window).trigger('resize');


        $('.carousel-item').each((index, el) => {
          const $carouselImage = $(el).find('img');
          const slideNumber = index < 10 ? `0${index + 1}` : index + 1;

          $(el).find('.carousel-item-title').attr('data-slide-number', slideNumber);

          imagesLoaded($carouselImage, () => {
            const $carouselInfo = $(el).find('.carousel-item-info');
            const $carouselImageHeight = $carouselImage.outerHeight();
            const $carouselInfoHeight = $carouselInfo.outerHeight();

            if ($carouselInfoHeight > $carouselImageHeight) {
              $carouselInfo.addClass('carousel-short-image');
            }
          });
        });
      })
      .slick({
        arrows: false,
        fade: true,
        autoplay: true,
        autoplaySpeed: speed,
        adaptiveHeight: true,
      })
      .on('beforeChange', (event, slick, currentSlide, nextSlide) => {
        $('.slick-active .carousel-item-info').removeClass('show');
      }).on('afterChange', (event, slick, currentSlide) => {
        $('.slick-active .carousel-item-info').addClass('show');
      });

    // Product carousels
    $('.product-carousel').slick({
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplaySpeed: 4000,
        prevArrow: '<span class="carousel-navigation-item previous"><svg class="icon icon-arrow-left"><use xlink:href="#icon-arrow-left" /></svg></span>',
        nextArrow: '<span class="carousel-navigation-item next"><svg class="icon icon-arrow-right"><use xlink:href="#icon-arrow-right" /></svg></span>',
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              autoplay: false
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
              autoplay: true
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              autoplay: true
            }
          }
        ]
    });

  }
}

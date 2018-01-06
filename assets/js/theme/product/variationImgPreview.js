import slick from 'slick-carousel';
import productViewTemplates from './productViewTemplates';
import ProductImages from './ProductImages';

export default function variationImgPreview(productImageUrl, zoomImageUrl, alt, optId) {
  const productImgs = '.product-slides-wrap';

  // Only append if image doesn't already exist.
  // Otherwise, scroll to it.
  if (! $(`img[src="${productImageUrl}"]`).length) {
    const numSlides = $('[data-product-image]').length;

    ProductImages.destroyCarousel();

    // Add carousel image
    $(productImgs).append(productViewTemplates.variationImage({
      productImageSrc: productImageUrl,
      zoomImageSrc: zoomImageUrl,
      alt: alt
    }));

    // Add carousel nav item
    $('.product-images-pagination').append(productViewTemplates.variationImageNav({
      productImageSrc: productImageUrl,
      index: numSlides,
      id: optId
    })).slideDown();

    ProductImages.initCarousel();

    $(productImgs).slick('slickGoTo', numSlides + 1, true);
  } else {
    const $changedOption = $(`[data-option-id="${optId}"]`);
    if ($changedOption.length) {
      $(productImgs).slick('slickGoTo', $changedOption.index(), true);
    }
  }
};

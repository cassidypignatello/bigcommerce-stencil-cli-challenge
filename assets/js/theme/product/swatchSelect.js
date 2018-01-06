/**
 * Apply checked class to swatch option
 */

export default function() {
  $('.swatches').on('click', (event) => {
    const $el = $(event.currentTarget).parent();
    const $swatch = $(event.target).parent('.swatch-wrap');
    const swatchValue = $swatch.data('swatch-value');

    // switch class
    $swatch.addClass('checked').siblings('.swatch-wrap').removeClass('checked');

    // update label
    $el.find('.swatch-value').text(swatchValue);
  });
}

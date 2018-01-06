export default function (event) {
  const $target = $(event.currentTarget);
  $target
    .toggleClass('is-open')
    .parents('[data-facet-filter]')
    .children('[data-facet-filter-wrapper]')
    .toggleClass('is-open');
}

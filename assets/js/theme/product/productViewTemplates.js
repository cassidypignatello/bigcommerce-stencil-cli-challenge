import _ from 'lodash';

export default {
  priceWithoutTax: _.template(`
    <% if (price.rrp_without_tax) { %>
      <span class="price-rrp"><%= price.rrp_without_tax.formatted %></span>
    <% } %>

    <% if (price.without_tax) { %>
      <span class="price-value"><%= price.without_tax.formatted %></span>

      <% if (price.with_tax) { %>
        <span class="tax-label"><%= excludingTax %></span>
      <% } %>
    <% } %>
  `),

  priceWithTax: _.template(`
    <% if (price.rrp_with_tax) { %>
      <span class="price-rrp"><%= price.rrp_with_tax.formatted %></span>
    <% } %>

    <% if (price.with_tax) { %>
      <span class="price-value"><%= price.with_tax.formatted %></span>

      <% if (price.without_tax) { %>
        <span class="tax-label"><%= includingTax %></span>
      <% } %>
    <% } %>
  `),

  priceSaved: _.template(`
    <% if (price.saved) { %>
      <%= savedString %> <%= price.saved.formatted %>
    <% } %>
  `),

  variationImage: _.template(`
    <a class="product-image" href="<%= zoomImageSrc %>" data-product-image>
      <img src="<%= productImageSrc %>">
    </a>
  `),

  variationImageNav: _.template(`
    <li class="pagination-item" data-option-id="<%= id %>">
      <a href="#" data-slide-to="<%= index %>" style="background-image: url(<%= productImageSrc %>);">
        <img class="sr-only" src="<%= productImageSrc %>">
      </a>
    </li>
  `),
};

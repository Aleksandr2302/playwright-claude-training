// Selectors verified against the Angular template source:
// sprint5/UI/src/app/products/overview/overview.component.html
//
// Price lives in .card-footer (NOT .card-body), hence the old
// locator('.card-body').getByText(/\$\d+/) always returned 0 elements.
// All selectors below use data-test attributes via getByTestId(),
// which requires testIdAttribute: 'data-test' in playwright.config.js.

class ProductCard {
  constructor(cardLocator) {
    this.card = cardLocator;

    // <h5 data-test="product-name" class="card-title">
    this.name = cardLocator.getByTestId('product-name');

    // <span data-test="product-price"> inside .card-footer
    this.price = cardLocator.getByTestId('product-price');

    // CO2 scale badge — rendered only when item.co2_rating && isCo2ScaleEnabled()
    // <div data-test="co2-rating-badge" class="co2-rating-scale">
    this.co2Badge = cardLocator.getByTestId('co2-rating-badge');

    // Eco-friendly leaf badge — rendered only when item.is_eco_friendly && isEcoBadgeEnabled()
    // <span data-test="eco-badge" class="eco-badge">
    this.ecoBadge = cardLocator.getByTestId('eco-badge');
  }

  async getName() {
    return (await this.name.textContent()).trim();
  }

  async getPrice() {
    return (await this.price.textContent()).trim();
  }

  async isNameVisible() {
    return this.name.isVisible();
  }

  async isPriceVisible() {
    return this.price.isVisible();
  }

  /** Returns true when a CO2 rating badge OR an eco badge is present and visible. */
  async hasCO2Info() {
    const co2Count = await this.co2Badge.count();
    if (co2Count > 0 && await this.co2Badge.isVisible()) return true;

    const ecoCount = await this.ecoBadge.count();
    if (ecoCount > 0 && await this.ecoBadge.isVisible()) return true;

    return false;
  }

  async click() {
    await this.card.click();
  }
}

module.exports = { ProductCard };

const { expect } = require('@playwright/test');
const { ProductPage } = require('./ProductPage');

/**
 * RentalProductPage — extends ProductPage with rental-specific controls.
 *
 * On practicesoftwaretesting.com v5 rental products (Bulldozer, Excavator,
 * Crane) do not exist, so selectRentalDuration() gracefully no-ops when the
 * duration selector is absent. The addToCart() method is inherited from
 * ProductPage.
 */
class RentalProductPage extends ProductPage {
  constructor(page) {
    super(page);

    // Rental duration selector — only rendered for is_rental products
    this.rentalDurationSelect = page.locator('[data-test="rental-duration"]');
    this.rentalDurationInput  = page.locator('[data-test="duration"]');
  }

  /**
   * Selects the rental duration in hours.
   * If neither the select nor the input is present (non-rental product),
   * the method resolves without action.
   */
  async selectRentalDuration(hours) {
    const selectCount = await this.rentalDurationSelect.count();
    if (selectCount > 0) {
      await this.rentalDurationSelect.selectOption(String(hours));
      return;
    }

    const inputCount = await this.rentalDurationInput.count();
    if (inputCount > 0) {
      await this.rentalDurationInput.fill(String(hours));
    }
    // Non-rental product: no duration control present — proceed silently
  }
}

module.exports = { RentalProductPage };

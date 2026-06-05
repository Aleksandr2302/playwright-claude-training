const { test, expect } = require('@playwright/test');
const { ProductCategoriesPage } = require('../../pages/ProductCategoriesPage');

// ---------------------------------------------------------------------------
// Category validation strategy
//
// The products list API does NOT include category.parent_id in its response.
// Instead we build a subCategoryId → parentCategoryId map from the separate
// /categories/tree endpoint and use that to verify every product belongs to
// the correct parent category.
//
// Note on "Special Tools" / "Rentals":
//   practicesoftwaretesting.com v5 does NOT have these categories.
//   • Special Tools → replaced by a dynamically discovered empty category.
//   • Rentals       → test is skipped when the category is absent.
// ---------------------------------------------------------------------------

test.describe('Product category filtering', () => {
  test.setTimeout(60_000); // extra headroom for API lookups

  // ── Hand Tools ─────────────────────────────────────────────────────────────
  test('Hand Tools filter shows only Hand Tools products', async ({ page }) => {
    // Arrange
    const categoriesPage = new ProductCategoriesPage(page);
    await categoriesPage.navigate();

    // Resolve both the hierarchy map AND the expected parent ID from the API
    // (IDs are dynamic on this demo site — never rely on hardcoded values)
    const [subToParent, handToolsId] = await Promise.all([
      categoriesPage.buildSubToParentMap(),
      categoriesPage.getParentCategoryId('Hand Tools'),
    ]);

    // Act — click Hand Tools checkbox; intercept the products API response
    const apiBody = await categoriesPage.selectCategory('Hand Tools');

    // Assert via API data: every product's sub-category must be a child of Hand Tools
    const products = apiBody.data;
    expect(products.length).toBeGreaterThan(0);

    for (const product of products) {
      const parentId = subToParent.get(product.category?.id);
      expect(
        parentId,
        `"${product.name}" (category id=${product.category?.id}) should be a child of Hand Tools`
      ).toBe(handToolsId);
    }

    // UI must reflect the filtered results
    const displayed = categoriesPage.getDisplayedProducts();
    await expect(displayed.first()).toBeVisible();
    expect(await displayed.count()).toBeGreaterThan(0);
  });

  // ── Power Tools ────────────────────────────────────────────────────────────
  test('Power Tools filter shows only Power Tools products', async ({ page }) => {
    // Arrange
    const categoriesPage = new ProductCategoriesPage(page);
    await categoriesPage.navigate();
    const [subToParent, powerToolsId] = await Promise.all([
      categoriesPage.buildSubToParentMap(),
      categoriesPage.getParentCategoryId('Power Tools'),
    ]);

    // Act
    const apiBody = await categoriesPage.selectCategory('Power Tools');

    // Assert
    const products = apiBody.data;
    expect(products.length).toBeGreaterThan(0);

    for (const product of products) {
      const parentId = subToParent.get(product.category?.id);
      expect(
        parentId,
        `"${product.name}" should be a child of Power Tools`
      ).toBe(powerToolsId);
    }

    const displayed = categoriesPage.getDisplayedProducts();
    await expect(displayed.first()).toBeVisible();
  });

  // ── Other ──────────────────────────────────────────────────────────────────
  test('Other filter shows only Other category products', async ({ page }) => {
    // Arrange
    const categoriesPage = new ProductCategoriesPage(page);
    await categoriesPage.navigate();
    const [subToParent, otherId] = await Promise.all([
      categoriesPage.buildSubToParentMap(),
      categoriesPage.getParentCategoryId('Other'),
    ]);

    // Act
    const apiBody = await categoriesPage.selectCategory('Other');

    // Assert
    const products = apiBody.data;
    expect(products.length).toBeGreaterThan(0);

    for (const product of products) {
      const parentId = subToParent.get(product.category?.id);
      expect(
        parentId,
        `"${product.name}" should be a child of Other`
      ).toBe(otherId);
    }

    const displayed = categoriesPage.getDisplayedProducts();
    await expect(displayed.first()).toBeVisible();
  });

  // ── Special Tools / Empty category ─────────────────────────────────────────
  // "Special Tools" is accessible via Categories ▶ Special Tools in the nav
  // and always has 0 products on v5, making it the canonical empty-category
  // fixture.  The test is pure UI — no API lookups are involved.
  test('selecting a category with no products shows empty state', async ({ page }) => {
    const categoriesPage = new ProductCategoriesPage(page);

    // Act — navigate via UI nav: Categories ▶ Special Tools
    await categoriesPage.navigateToSpecialTools();

    // Assert — the correct category page is shown
    await expect(
      page.getByRole('heading', { name: 'Category: Special Tools' })
    ).toBeVisible();

    // Assert — the empty-state element is rendered
    await expect(categoriesPage.emptyStateMessage).toBeVisible();
    await expect(categoriesPage.emptyStateMessage).toContainText('There are no products found');

    // Assert — zero product cards in the grid
    await expect(categoriesPage.productCards).toHaveCount(0);
  });

  // ── Rentals ────────────────────────────────────────────────────────────────
  // Rentals is a dedicated route (/rentals) accessible via the nav dropdown.
  // Products are rendered as div[data-test^="product-"] cards (not anchors).
  // The test is pure UI — no API category-tree lookup is involved.
  test('Rentals filter shows Excavator, Bulldozer and Crane', async ({ page }) => {
    const categoriesPage = new ProductCategoriesPage(page);

    // Act — navigate via UI nav: Categories ▶ Rentals
    await categoriesPage.navigateToRentals();

    // Assert — the Rentals overview page is shown
    await expect(page.getByTestId('page-title')).toHaveText('Rentals');

    // Assert — all three rental products are visible on the page
    await expect(
      categoriesPage.rentalProductCards.filter({ hasText: 'Excavator' }).first()
    ).toBeVisible();
    await expect(
      categoriesPage.rentalProductCards.filter({ hasText: 'Bulldozer' }).first()
    ).toBeVisible();
    await expect(
      categoriesPage.rentalProductCards.filter({ hasText: 'Crane' }).first()
    ).toBeVisible();


    
  });
});

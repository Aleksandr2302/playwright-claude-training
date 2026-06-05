const { test, expect } = require('@playwright/test');
const { ProductFiltersPage } = require('../../pages/ProductFiltersPage');

test.describe('Product listing — sort order', () => {
  // Serial mode prevents parallel API calls against the same external server,
  // which would saturate it and push response times past the test timeout.
  test.describe.configure({ mode: 'serial' });

  let filtersPage;

  test.beforeEach(async ({ page }) => {
    filtersPage = new ProductFiltersPage(page);
    await filtersPage.navigate();
    await filtersPage.waitForProductsToLoad();
  });

  test('sort by name A→Z displays products in ascending alphabetical order', async () => {
    await filtersPage.selectSortOption('name,asc');
    const names = await filtersPage.extractProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('sort by name Z→A displays products in descending alphabetical order', async () => {
    await filtersPage.selectSortOption('name,desc');
    const names = await filtersPage.extractProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test('sort by price high→low displays products in descending price order', async () => {
    await filtersPage.selectSortOption('price,desc');
    const prices = await filtersPage.extractProductPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('sort by price low→high displays products in ascending price order', async () => {
    await filtersPage.selectSortOption('price,asc');
    const prices = await filtersPage.extractProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('sort by CO2 rating A→E displays products in ascending CO2 order', async () => {
    await filtersPage.selectSortOption('co2_rating,asc');
    const ratings = await filtersPage.extractCO2Ratings();
    const sorted = [...ratings].sort((a, b) => a.localeCompare(b));
    expect(ratings).toEqual(sorted);
  });

  test('sort by CO2 rating E→A displays products in descending CO2 order', async () => {
    await filtersPage.selectSortOption('co2_rating,desc');
    const ratings = await filtersPage.extractCO2Ratings();
    const sorted = [...ratings].sort((a, b) => b.localeCompare(a));
    expect(ratings).toEqual(sorted);
  });
});

const { test, expect } = require('@playwright/test');
const { HomePage } = require('../../pages/HomePage');

const SEARCH_TERM = 'Washers';

test.describe('Search functionality', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('search input and button are visible', async () => {
    await expect(homePage.searchInput).toBeVisible();
    await expect(homePage.searchButton).toBeVisible();
  });

  test(`searching for "${SEARCH_TERM}" returns at least one result`, async () => {
    await homePage.search(SEARCH_TERM);
    await homePage.waitForSearchResults();

    const count = await homePage.getProductCount();
    expect(count, `Expected results for "${SEARCH_TERM}"`).toBeGreaterThan(0);
  });

  test(`search results for "${SEARCH_TERM}" contain relevant product names`, async ({ page }) => {
    await homePage.search(SEARCH_TERM);
    await homePage.waitForSearchResults();

    await expect(
      page.getByRole('heading', { level: 5, name: new RegExp(SEARCH_TERM, 'i') }),
      `Expected at least one search result heading to contain "${SEARCH_TERM}"`
    ).toBeVisible();
  });
});

const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { LoginPage }   = require('../../pages/LoginPage');
const { ContactPage } = require('../../pages/ContactPage');
const { existingUser } = require('../fixtures/auth.fixtures');

const contactFormData = {
  subject: 'customer-service',
  message: 'This is an automated E2E test message. Please ignore.',
};

test.describe('E2E — Contact Form', () => {
  test.setTimeout(60_000);

  test.beforeEach(async () => {
    await allure.epic('UI Tests');
    await allure.label('layer', 'ui');
  });

  test('logged-in user submits contact form and sees success confirmation', async ({ page }) => {

    // ── Arrange: Login ──────────────────────────────────────────────────────
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(existingUser.email, existingUser.password);
    await loginPage.getLoginSuccessState();

    // ── Act: Navigate to Contact page ───────────────────────────────────────
    const contactPage = new ContactPage(page);
    await contactPage.navigate();
    await expect(page).toHaveURL(/\/contact/);
    // For logged-in users the form shows only Subject + Message (identity is
    // already known). Wait for the subject dropdown to confirm the form rendered.
    await expect(page.getByTestId('subject')).toBeVisible({ timeout: 15000 });

    // ── Act: Fill and submit the contact form ───────────────────────────────
    // Only fill the fields present in the logged-in form.
    await page.getByTestId('subject').selectOption(contactFormData.subject);
    await page.getByTestId('message').fill(contactFormData.message);
    await contactPage.submit();

    // ── Assert: Success confirmation is displayed ───────────────────────────
    await contactPage.assertSubmissionSuccess();
  });
});

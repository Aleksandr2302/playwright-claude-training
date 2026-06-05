const { test, expect } = require('@playwright/test');
const { LoginPage }   = require('../../pages/LoginPage');
const { ContactPage } = require('../../pages/ContactPage');
const { existingUser } = require('../fixtures/auth.fixtures');

const contactFormData = {
  firstName: 'Test',
  lastName:  'Automation',
  email:     existingUser.email,
  subject:   'customer-service',
  message:   'This is an automated E2E test message. Please ignore.',
};

test.describe('E2E — Contact Form', () => {
  test.setTimeout(60_000);

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

    // ── Act: Fill and submit the contact form ───────────────────────────────
    await contactPage.fillForm(contactFormData);
    await contactPage.submit();

    // ── Assert: Success confirmation is displayed ───────────────────────────
    await contactPage.assertSubmissionSuccess();
  });
});

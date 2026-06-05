const { expect } = require('@playwright/test');

class ContactPage {
  static PATH = '/contact';

  constructor(page) {
    this.page = page;

    this.firstNameInput  = page.getByTestId('first-name');
    this.lastNameInput   = page.getByTestId('last-name');
    this.emailInput      = page.getByTestId('email');
    this.subjectSelect   = page.getByTestId('subject');
    this.messageInput    = page.getByTestId('message');
    this.submitButton    = page.getByTestId('contact-submit');
    this.successAlert    = page.getByRole('alert');
  }

  async navigate() {
    await this.page.goto(ContactPage.PATH);
  }

  async fillForm({ firstName, lastName, email, subject, message }) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.subjectSelect.selectOption(subject);
    await this.messageInput.fill(message);
  }

  async submit() {
    await this.submitButton.click();
  }

  async assertSubmissionSuccess() {
    await expect(this.successAlert).toBeVisible();
    await expect(this.successAlert).toContainText('Thanks for your message! We will contact you shortly.');
  }
}

module.exports = { ContactPage };

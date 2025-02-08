export class POMPage {
  constructor(page) {
    this.page = page; // Store Playwright's page instance
  }

  async goto(url) {
    await this.page.goto(url);
  }

  locator(selector) {
    return this.page.locator(selector);
  }

  async title() {
    return this.page.title();
  }

  async waitForSelector(selector, options) {
    return this.page.waitForSelector(selector, options);
  }

  async click(selector, options) {
    return this.page.click(selector, options);
  }

  async fill(selector, value) {
    return this.page.fill(selector, value);
  }

  async screenshot(options) {
    return this.page.screenshot(options);
  }

  async evaluate(fn, arg) {
    return this.page.evaluate(fn, arg);
  }

  async evaluateHandle(fn, arg) {
    return this.page.evaluateHandle(fn, arg);
  }
}

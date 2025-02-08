import { expect } from '@playwright/test';
import { POMPage } from './pompage';
import { filePathUrl } from './utils';

export class SpecPage extends POMPage {
  constructor(page) {
    super(page);
    this.url = filePathUrl('../spec.html');
    this.$pageHandle = this.page.getByTestId('test-template');
  }

  async goto() {
    await super.goto(this.url);
  }

  async isReady() {
    return expect(this.$pageHandle).toBeVisible();
  }

  async embedHTML(templateAndScripts) {
    let [template, scripts] = Array.isArray(templateAndScripts) ? templateAndScripts : [templateAndScripts];

    await this.page.evaluate(
      ({ rootSelector, template, scripts }) => {
        let el = document.querySelector(rootSelector);
        if (!el) throw new Error(`Element ${rootSelector} not found`);

        el.innerHTML = template;

        el.evalScripts(scripts);
      },
      { rootSelector: '#root', template, scripts }
    );

    await this.page.waitForSelector('[stator-is-ready]', { timeout: 5000 });
    await expect(this.page.locator('[stator-is-ready]')).toBeVisible();

    // Get window & document objects
    const windowHandle = await this.page.evaluateHandle(() => window);
    const documentHandle = await this.page.evaluateHandle(() => document);

    return {
      window: windowHandle,
      document: documentHandle,
      reload: async () => {
        await this.page.reload();
        await this.embedHTML([template, scripts]); // Re-inject after reload
        await expect(this.page.locator('[stator-is-ready]')).toBeVisible();
      }
    };
  }
}

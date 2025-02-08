import { test as baseTest, expect } from '@playwright/test';

export function html(strings) {
  return strings.raw[0];
}

export async function ensureNoConsoleWarns(page) {
  await page.evaluate(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      throw new Error('Console warn was triggered: ' + args.join(' '));
    };
    window.addEventListener('beforeunload', () => {
      console.warn = originalWarn;
    });
  });
}

export const testa = baseTest.extend({
  async injectHtmlAndBootAlpine({ page }, use) {
    await page.goto('file://' + __dirname + '/spec.html');
    await use(async (template, scripts) => {
      await page.evaluate(
        ({ template, scripts }) => {
          document.querySelector('#root').innerHTML = template;
          if (scripts) {
            eval(scripts);
          }
        },
        { template, scripts }
      );
      await page.waitForSelector('[alpine-is-ready]', { timeout: 5000 });
    });
  }
});

testa.only = baseTest.only;
testa.skip = baseTest.skip;
testa.retry = count => baseTest.extend({ retries: count - 1 });
testa.csp = testa;

// Assertion utilities
export const haveAttribute = (name, value) => async element => {
  await expect(element).toHaveAttribute(name, value);
};

export const notHaveAttribute = (name, value) => async element => {
  await expect(element).not.toHaveAttribute(name, value);
};

export const haveText = text => async element => {
  await expect(element).toHaveText(text);
};

export const notHaveText = text => async element => {
  await expect(element).not.toHaveText(text);
};

export const beChecked = () => async element => {
  await expect(element).toBeChecked();
};

export const notBeChecked = () => async element => {
  await expect(element).not.toBeChecked();
};

export const beVisible = () => async element => {
  await expect(element).toBeVisible();
};

export const notBeVisible = () => async element => {
  await expect(element).not.toBeVisible();
};

export const exist = () => async element => {
  await expect(element).toBeTruthy();
};

export const notExist = () => async element => {
  await expect(element).toBeFalsy();
};

export const beHidden = () => async element => {
  await expect(element).toBeHidden();
};

export const haveClasses = classes => async element => {
  for (const className of classes) {
    await expect(element).toHaveClass(className);
  }
};

export const notHaveClasses = classes => async element => {
  for (const className of classes) {
    await expect(element).not.toHaveClass(className);
  }
};

export const haveValue = value => async element => {
  await expect(element).toHaveValue(value);
};

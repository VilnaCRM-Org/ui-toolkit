const ScenarioBuilder = require('../utils/ScenarioBuilder');

const scenarioBuilder = new ScenarioBuilder();

const emailInputSelector = 'input[type="email"]';

// UiForm Default mounts a react-hook-form Email field. Typing registers form
// state + change listeners; clearing should release them. Leaked field
// subscriptions would surface as retained objects between action and back.
async function action(page) {
  await page.waitForSelector(emailInputSelector, { visible: true });
  await page.click(emailInputSelector);
  await page.type(emailInputSelector, 'leak-check@example.com');
}

async function back(page) {
  await page.click(emailInputSelector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.waitForFunction(
    selector => {
      const el = document.querySelector(selector);
      return el instanceof HTMLInputElement && el.value === '';
    },
    {},
    emailInputSelector
  );
}

module.exports = scenarioBuilder.createScenario({
  storyId: 'uicomponents-uiform--default',
  action,
  back,
});

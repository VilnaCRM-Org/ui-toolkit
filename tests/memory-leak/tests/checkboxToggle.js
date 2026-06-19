const ScenarioBuilder = require('../utils/ScenarioBuilder');

const scenarioBuilder = new ScenarioBuilder();

const checkboxSelector = 'input[type="checkbox"]';

const toggleCount = 6;

const delay = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

// Repeatedly toggling the checkbox mounts/unmounts the MUI checked-icon span and
// fires change listeners; `back` returns it to unchecked. Retained detached icon
// nodes between action and back would indicate a leak.
async function action(page) {
  await page.waitForSelector(checkboxSelector);
  await Array.from({ length: toggleCount }).reduce(
    previous =>
      previous.then(async () => {
        await page.click(checkboxSelector);
        await delay(100);
      }),
    Promise.resolve()
  );
}

async function back(page) {
  const isChecked = await page.$eval(checkboxSelector, element => element.checked);
  if (isChecked) {
    await page.click(checkboxSelector);
  }
  await page.waitForFunction(
    selector => {
      const el = document.querySelector(selector);
      return el instanceof HTMLInputElement && !el.checked;
    },
    {},
    checkboxSelector
  );
}

module.exports = scenarioBuilder.createScenario({
  storyId: 'uicomponents-uicheckbox--checkbox',
  action,
  back,
});

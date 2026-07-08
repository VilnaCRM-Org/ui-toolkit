const ScenarioBuilder = require('../utils/scenario-builder');

const scenarioBuilder = new ScenarioBuilder();

const radioSelector = 'input[type="radio"]';

const selectCount = 6;

const delay = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

// Moving the selection across the radios mounts the checked-ring span on the
// newly selected option and unmounts it from the previous one; `back` returns
// the selection to the first option. Retained detached ring nodes between the
// action and back would indicate a leak.
async function action(page) {
  await page.waitForSelector(radioSelector);
  const radios = await page.$$(radioSelector);
  await Array.from({ length: selectCount }).reduce(
    (previous, _unused, index) =>
      previous.then(async () => {
        await radios[index % radios.length].click();
        await delay(100);
      }),
    Promise.resolve()
  );
}

async function back(page) {
  const radios = await page.$$(radioSelector);
  await radios[0].click();
  await page.waitForFunction(
    selector => {
      const first = document.querySelector(selector);
      return first instanceof HTMLInputElement && first.checked;
    },
    {},
    radioSelector
  );
}

module.exports = scenarioBuilder.createScenario({
  storyId: 'uicomponents-uiradiogroup--radio-group',
  action,
  back,
});

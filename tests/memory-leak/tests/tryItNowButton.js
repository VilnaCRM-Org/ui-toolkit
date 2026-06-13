const ScenarioBuilder = require('../utils/ScenarioBuilder');

const scenarioBuilder = new ScenarioBuilder();

const signUpButtonSelector = 'a[href="#signUp"]';

const coordinateX = 0;
const coordinateY = 0;

async function action(page) {
  await page.click(signUpButtonSelector);

  await page.waitForFunction(() => window.location.hash === '#signUp');
}

async function back(page) {
  await page.evaluate(
    (x, y) => {
      window.scrollTo(x, y);
    },
    coordinateX,
    coordinateY
  );

  await page.waitForFunction(() => window.scrollX === 0 && window.scrollY === 0);
}

module.exports = scenarioBuilder.createScenario({ action, back });

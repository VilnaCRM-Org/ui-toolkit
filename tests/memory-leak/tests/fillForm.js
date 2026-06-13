const { faker } = require('@faker-js/faker');

const ScenarioBuilder = require('../utils/ScenarioBuilder');

const scenarioBuilder = new ScenarioBuilder();

const fullNameInputSelector = 'input[name="FullName"]';
const emailInputSelector = 'input[name="Email"]';
const passwordInputSelector = 'input[name="Password"]';
const privacyCheckboxSelector = 'input[type="checkbox"][name="Privacy"]';

const fakeFullName = faker.person.fullName();
const fakeEmail = faker.internet.email();
const fakePassword = faker.internet.password();

async function clearInput(page, selector) {
  await page.focus(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
}

async function action(page) {
  await page.type(fullNameInputSelector, fakeFullName);
  await page.type(emailInputSelector, fakeEmail);
  await page.type(passwordInputSelector, fakePassword);
  await page.click(privacyCheckboxSelector);
}

async function back(page) {
  await clearInput(page, fullNameInputSelector);
  await clearInput(page, emailInputSelector);
  await clearInput(page, passwordInputSelector);

  await page.click(privacyCheckboxSelector);
}

module.exports = scenarioBuilder.createScenario({ action, back });

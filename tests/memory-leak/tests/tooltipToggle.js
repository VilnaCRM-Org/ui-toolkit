const ScenarioBuilder = require('../utils/ScenarioBuilder');

const scenarioBuilder = new ScenarioBuilder();

const triggerSelector = '[role="button"]';
const tooltipSelector = '[role="tooltip"]';

// UiTooltip opens on click (TooltipWrapper toggles MUI Tooltip's open state),
// mounting a popper portal on <body>; closing must unmount it. A leaked portal
// shows up as retained detached DOM between the action and back snapshots.
async function action(page) {
  await page.waitForSelector(triggerSelector, { visible: true });
  await page.click(triggerSelector);
  await page.waitForSelector(tooltipSelector, { visible: true });
}

async function back(page) {
  await page.click(triggerSelector);
  await page.waitForSelector(tooltipSelector, { hidden: true });
}

module.exports = scenarioBuilder.createScenario({
  storyId: 'uicomponents-uitooltip--tooltip',
  action,
  back,
});

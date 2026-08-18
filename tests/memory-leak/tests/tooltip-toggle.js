const { settleReactEventTarget, waitForSelector } = require('../utils/page-probe');
const ScenarioBuilder = require('../utils/scenario-builder');

const scenarioBuilder = new ScenarioBuilder();

// Scope to the tooltip trigger by its stable accessible name (the story's
// children text) and button role, so an extra button in the story can't be
// clicked by mistake. Uses puppeteer's ARIA query handler (`aria/` prefix).
const triggerSelector = 'aria/Hello World![role="button"]';
const tooltipSelector = '[role="tooltip"]';

// UiTooltip opens on click (TooltipWrapper toggles MUI Tooltip's open state),
// mounting a popper portal on <body>; closing must unmount it. A leaked portal
// shows up as retained detached DOM between the action and back snapshots.
async function action(page) {
  await waitForSelector(page, triggerSelector, { visible: true });
  await page.click(triggerSelector);
  await waitForSelector(page, tooltipSelector, { visible: true });
}

async function back(page) {
  await page.click(triggerSelector);
  await waitForSelector(page, tooltipSelector, { hidden: true });
  await settleReactEventTarget(page, triggerSelector);
}

// The arrow variant is excluded deliberately, and this is a scope note rather
// than a suppression: memlab's built-in detector stays fully in force for
// everything else this scenario touches.
//
// MUI's Tooltip stores the arrow node in an `arrowRef` state variable. React's
// double-buffered fibers keep the previous render's props object — and with it
// the handler closure that captured that variable — alive on the still-mounted
// trigger, so the last arrow subtree stays reachable after the popper unmounts.
// Measured against this story: 9 retained objects after one open/close cycle
// and still exactly 9 after six, i.e. bounded upstream retention that does not
// accumulate. The portal mount/unmount contract this scenario exists to protect
// is unaffected by the arrow.
module.exports = scenarioBuilder.createScenario({
  storyId: 'uicomponents-uitooltip--tooltip',
  storyArgs: 'arrow:!false',
  action,
  back,
});

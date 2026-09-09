// Puppeteer keeps a DevTools remote-object handle for every element returned by
// `page.waitForSelector`. In a heap snapshot those handles appear as Global
// handles, so an undisposed one keeps the element reachable and memlab reports
// the harness's own bookkeeping as a product leak. Every wait in a scenario
// must therefore release its handle.
async function waitForSelector(page, selector, options) {
  const handle = await page.waitForSelector(selector, options);

  if (handle) {
    await handle.dispose();
  }
}

// React's event system stores the last dispatched event's target fiber in a
// module-scope `return_targetInst`. When the last event a scenario produces
// lands on a node that then unmounts (a closing popper finishing its exit
// transition, say), that single slot pins the detached fiber. Ending on a
// still-mounted target moves the slot off anything the scenario tore down.
async function settleReactEventTarget(page, attachedSelector) {
  await page.focus(attachedSelector);
  await page.keyboard.press('Tab');
}

module.exports = { waitForSelector, settleReactEventTarget };

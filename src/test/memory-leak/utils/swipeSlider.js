function calculateCoordinates(boundingBox, direction) {
  const startX = direction === 'left' ? boundingBox.x + boundingBox.width - 10 : boundingBox.x + 10;
  const endX = direction === 'left' ? boundingBox.x + 10 : boundingBox.x + boundingBox.width - 10;
  const startY = boundingBox.y + boundingBox.height / 2;
  const endY = boundingBox.y + boundingBox.height / 2;

  return { startX, endX, startY, endY };
}

async function horizontalDragAndDrop(page, coordinates, iterationsNumber) {
  async function runIteration(iteration) {
    if (iteration >= iterationsNumber) {
      return;
    }

    await page.mouse.move(coordinates.startX, coordinates.startY);
    await page.mouse.down();

    await page.mouse.move(coordinates.endX, coordinates.endY, { steps: 20 });
    await page.mouse.up();

    await page.waitForTimeout(500);
    await runIteration(iteration + 1);
  }

  await runIteration(0);
}

async function swipeSlider(page, selector, iterationsNumber, direction = 'left') {
  const slider = await page.$(selector);
  if (!slider) {
    throw new Error(`Slider element not found for selector: ${selector}`);
  }
  const boundingBox = await slider.boundingBox();
  if (!boundingBox) {
    throw new Error(`Unable to get bounding box for slider: ${selector}`);
  }

  const coordinates = calculateCoordinates(boundingBox, direction);

  await horizontalDragAndDrop(page, coordinates, iterationsNumber);
}

module.exports = swipeSlider;

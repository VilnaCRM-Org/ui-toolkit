const swipeSlider = require('../memory-leak/utils/swipeSlider');

describe('swipeSlider', () => {
  it('performs the configured number of drag cycles', async () => {
    const boundingBox = { x: 10, y: 20, width: 100, height: 40 };
    const slider = {
      boundingBox: jest.fn().mockResolvedValue(boundingBox),
    };

    const events: string[] = [];
    const page = {
      $: jest.fn().mockResolvedValue(slider),
      mouse: {
        move: jest.fn(async () => {
          events.push('move');
        }),
        down: jest.fn(async () => {
          events.push('down');
        }),
        up: jest.fn(async () => {
          events.push('up');
        }),
      },
      waitForTimeout: jest.fn(async () => {
        events.push('wait');
      }),
    };

    await swipeSlider(page, '.swiper-wrapper', 2, 'left');

    expect(page.$).toHaveBeenCalledWith('.swiper-wrapper');
    expect(slider.boundingBox).toHaveBeenCalledTimes(1);
    expect(page.mouse.move).toHaveBeenCalledTimes(4);
    expect(page.mouse.down).toHaveBeenCalledTimes(2);
    expect(page.mouse.up).toHaveBeenCalledTimes(2);
    expect(page.waitForTimeout).toHaveBeenCalledTimes(2);
    expect(events).toEqual([
      'move',
      'down',
      'move',
      'up',
      'wait',
      'move',
      'down',
      'move',
      'up',
      'wait',
    ]);
  });
});

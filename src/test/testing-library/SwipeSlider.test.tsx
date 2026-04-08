type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SliderHandle = {
  boundingBox: () => Promise<BoundingBox>;
};

type PageHandle = {
  $: (selector: string) => Promise<SliderHandle>;
  mouse: {
    move: (x: number, y: number, options?: { steps: number }) => Promise<void>;
    down: () => Promise<void>;
    up: () => Promise<void>;
  };
  waitForTimeout: (timeout: number) => Promise<void>;
};

const swipeSlider: (
  page: PageHandle,
  selector: string,
  iterationsNumber: number,
  direction?: 'left' | 'right'
) => Promise<void> = require('../memory-leak/utils/swipeSlider');

describe('swipeSlider', () => {
  it('performs the configured number of drag cycles', async () => {
    const boundingBox: BoundingBox = { x: 10, y: 20, width: 100, height: 40 };
    const slider: {
      boundingBox: jest.MockedFunction<SliderHandle['boundingBox']>;
    } = {
      boundingBox: jest.fn().mockResolvedValue(boundingBox) as jest.MockedFunction<
        SliderHandle['boundingBox']
      >,
    };

    const events: string[] = [];
    const page: {
      $: jest.MockedFunction<PageHandle['$']>;
      mouse: {
        move: jest.MockedFunction<PageHandle['mouse']['move']>;
        down: jest.MockedFunction<PageHandle['mouse']['down']>;
        up: jest.MockedFunction<PageHandle['mouse']['up']>;
      };
      waitForTimeout: jest.MockedFunction<PageHandle['waitForTimeout']>;
    } = {
      $: jest.fn().mockResolvedValue(slider) as jest.MockedFunction<PageHandle['$']>,
      mouse: {
        move: jest.fn(async (...args: Parameters<PageHandle['mouse']['move']>) => {
          expect(args.length).toBeGreaterThanOrEqual(2);
          events.push('move');
        }) as jest.MockedFunction<PageHandle['mouse']['move']>,
        down: jest.fn(async () => {
          events.push('down');
        }) as jest.MockedFunction<PageHandle['mouse']['down']>,
        up: jest.fn(async () => {
          events.push('up');
        }) as jest.MockedFunction<PageHandle['mouse']['up']>,
      },
      waitForTimeout: jest.fn(async (...args: Parameters<PageHandle['waitForTimeout']>) => {
        expect(args).toHaveLength(1);
        events.push('wait');
      }) as jest.MockedFunction<PageHandle['waitForTimeout']>,
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

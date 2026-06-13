const ScenarioBuilder = require('../memory-leak/utils/ScenarioBuilder');

describe('ScenarioBuilder', () => {
  const originalMemlabWebsiteUrl = process.env.MEMLAB_WEBSITE_URL;

  afterEach(() => {
    if (originalMemlabWebsiteUrl === undefined) {
      delete process.env.MEMLAB_WEBSITE_URL;
      return;
    }

    process.env.MEMLAB_WEBSITE_URL = originalMemlabWebsiteUrl;
  });

  it('keeps the validated MEMLAB website URL when scenario options include url', () => {
    process.env.MEMLAB_WEBSITE_URL = 'https://example.com/memlab';

    const builder = new ScenarioBuilder();
    const overrideUrl = () => 'https://override.example.com';
    const scenario = builder.createScenario({
      action: jest.fn(),
      url: overrideUrl,
    });

    expect(scenario.url).toBe(builder.url);
    expect(scenario.url()).toBe('https://example.com/memlab');
  });
});

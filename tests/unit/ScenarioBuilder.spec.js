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

  it('builds a story iframe URL from a storyId on the validated base URL', () => {
    process.env.MEMLAB_WEBSITE_URL = 'https://example.com/memlab/';

    const builder = new ScenarioBuilder();
    const scenario = builder.createScenario({
      storyId: 'uicomponents-uibutton--contained',
      action: jest.fn(),
    });

    expect(scenario.url()).toBe(
      'https://example.com/memlab/iframe.html?id=uicomponents-uibutton--contained&viewMode=story'
    );
  });

  it('respects an explicit url over storyId and the base URL', () => {
    process.env.MEMLAB_WEBSITE_URL = 'https://example.com/memlab';

    const builder = new ScenarioBuilder();
    const overrideUrl = () => 'https://override.example.com';
    const scenario = builder.createScenario({ action: jest.fn(), url: overrideUrl });

    expect(scenario.url).toBe(overrideUrl);
    expect(scenario.url()).toBe('https://override.example.com');
  });

  it('falls back to the validated base URL when neither url nor storyId is given', () => {
    process.env.MEMLAB_WEBSITE_URL = 'https://example.com/memlab';

    const builder = new ScenarioBuilder();
    const scenario = builder.createScenario({ action: jest.fn() });

    expect(scenario.url()).toBe('https://example.com/memlab');
  });

  it('throws when MEMLAB_WEBSITE_URL is not set', () => {
    delete process.env.MEMLAB_WEBSITE_URL;

    const builder = new ScenarioBuilder();
    const scenario = builder.createScenario({ storyId: 'x', action: jest.fn() });

    expect(() => scenario.url()).toThrow('MEMLAB_WEBSITE_URL environment variable is required');
  });
});

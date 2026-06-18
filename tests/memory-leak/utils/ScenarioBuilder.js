// Builds memlab scenarios for the component library. memlab drives a real
// Chrome against the running Storybook (MEMLAB_WEBSITE_URL), navigating to an
// isolated story iframe, running `action` (interact), then `back` (revert), and
// diffing the heap to surface leaked detached DOM / listeners / portals.
class ScenarioBuilder {
  constructor() {
    this.baseUrl = () => {
      const url = process.env.MEMLAB_WEBSITE_URL;
      if (!url) {
        throw new Error('MEMLAB_WEBSITE_URL environment variable is required');
      }
      let trimmed = url;
      while (trimmed.endsWith('/')) {
        trimmed = trimmed.slice(0, -1);
      }
      return trimmed;
    };
  }

  storyUrl(storyId) {
    return () => `${this.baseUrl()}/iframe.html?id=${storyId}&viewMode=story`;
  }

  // scenarioOptions: { storyId?, url?, action, back, setup?, ...memlab hooks }
  createScenario(scenarioOptions) {
    const { storyId, url, ...rest } = scenarioOptions;
    const resolvedUrl = url || (storyId ? this.storyUrl(storyId) : () => this.baseUrl());

    return { ...rest, url: resolvedUrl };
  }
}

module.exports = ScenarioBuilder;

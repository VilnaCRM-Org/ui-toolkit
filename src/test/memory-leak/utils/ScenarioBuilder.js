class ScenarioBuilder {
  constructor() {
    this.url = () => {
      const url = process.env.MEMLAB_WEBSITE_URL;
      if (!url) {
        throw new Error('MEMLAB_WEBSITE_URL environment variable is required');
      }
      return url;
    };
  }

  createScenario(scenarioOptions) {
    const scenario = { url: this.url, ...scenarioOptions };

    return scenario;
  }
}

module.exports = ScenarioBuilder;

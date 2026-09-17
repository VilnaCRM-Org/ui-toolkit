const STORY_ENTRY_TYPE = 'story';
const SHARD_SPEC = /^([1-9]\d*)\/([1-9]\d*)$/;
const PERFORMANCE_SCORE = 'categories:performance';

const TITLES_WITHOUT_CONTENTFUL_PAINT = [
  'UiComponents/AuthSkeleton',
  'UiComponents/UiSkeletonBlock',
  'UiComponents/UiSkeletonButton',
  'UiComponents/UiSkeletonControlText',
  'UiComponents/UiSkeletonImage',
  'UiComponents/UiSkeletonInput',
  'UiComponents/UiSkeletonList',
  'UiComponents/UiSkeletonMenu',
  'UiComponents/UiSkeletonTabBar',
  'UiComponents/UiSkeletonTable',
  'UiComponents/UiSkeletonText',
  'UiComponents/UiSkeletonWidget',
];

const TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT = [
  'UiComponents/UiActionIconBar',
  'UiComponents/UiChevronButton',
  'UiComponents/UiSocialIconButton',
  'UiComponents/UiStatusBadge',
];

const METRICS_SCORED_WITHOUT_LARGEST_CONTENTFUL_PAINT = [
  'first-contentful-paint',
  'speed-index',
  'cumulative-layout-shift',
];

const CATALOGUE_TITLES = ['Showcase/New Components (Figma parity)'];

const PERFORMANCE_FLOORS = {
  desktop: ['error', { minScore: 0.9 }],
  mobile: ['error', { minScore: 0.4 }],
};

function compareCodeUnits(left, right) {
  if (left < right) return -1;
  return left > right ? 1 : 0;
}

function firstStoryPerTitle(entries) {
  const representatives = new Map();
  for (const entry of entries) {
    if (entry.type === STORY_ENTRY_TYPE && !representatives.has(entry.title)) {
      representatives.set(entry.title, entry);
    }
  }
  return [...representatives.values()];
}

function liveTitlesOf(index) {
  return new Set(firstStoryPerTitle(Object.values(index.entries)).map(entry => entry.title));
}

function assertTitlesAreLive(titles, index) {
  const liveTitles = liveTitlesOf(index);
  const stale = titles.filter(title => !liveTitles.has(title));
  if (stale.length > 0) {
    throw new Error(
      `Lighthouse policy names titles absent from the Storybook index: ${stale.join(', ')}`
    );
  }
}

function selectAuditedStories(index, skippedTitles) {
  const representatives = firstStoryPerTitle(Object.values(index.entries));
  assertTitlesAreLive(skippedTitles, index);
  const audited = representatives
    .filter(entry => !skippedTitles.includes(entry.title))
    .map(entry => entry.id)
    .sort(compareCodeUnits);
  if (audited.length === 0) {
    throw new Error('The Storybook index has no story to audit');
  }
  return audited;
}

function parseShard(spec) {
  const match = SHARD_SPEC.exec(spec);
  if (match === null) {
    throw new Error(`LHCI_SHARD must look like "<index>/<count>", received "${spec}"`);
  }
  const index = Number(match[1]);
  const count = Number(match[2]);
  if (index > count) {
    throw new Error(`LHCI_SHARD index ${index} exceeds its shard count ${count}`);
  }
  return { index, count };
}

function shardStories(storyIds, spec) {
  const { index, count } = parseShard(spec);
  const shard = storyIds.filter((_, position) => position % count === index - 1);
  if (shard.length === 0) {
    throw new Error(`Shard ${spec} selects no story out of ${storyIds.length}`);
  }
  return shard;
}

function storyUrl(id) {
  return `/iframe.html?id=${id}&viewMode=story`;
}

function performanceFloor(formFactor) {
  const floor = PERFORMANCE_FLOORS[formFactor];
  if (floor === undefined) {
    const known = Object.keys(PERFORMANCE_FLOORS).join(', ');
    throw new Error(`LHCI_FORM_FACTOR must be one of ${known}, received "${formFactor}"`);
  }
  return floor;
}

function performanceAssertions(title, formFactor) {
  const [level, options] = performanceFloor(formFactor);
  if (TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT.includes(title)) {
    return Object.fromEntries(
      METRICS_SCORED_WITHOUT_LARGEST_CONTENTFUL_PAINT.map(metric => [metric, [level, options]])
    );
  }
  if (CATALOGUE_TITLES.includes(title)) {
    return { [PERFORMANCE_SCORE]: ['warn', options] };
  }
  return { [PERFORMANCE_SCORE]: [level, options] };
}

function storyAssertions(config, id) {
  const { title } = config.index.entries[id];
  return {
    matchingUrlPattern: `[?&]id=${id}&`,
    aggregationMethod: 'median',
    assertions: { ...config.audits, ...performanceAssertions(title, config.formFactor) },
  };
}

function assertionMatrix(config) {
  assertTitlesAreLive(
    [...TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT, ...CATALOGUE_TITLES],
    config.index
  );
  return config.storyIds.map(id => storyAssertions(config, id));
}

module.exports = {
  CATALOGUE_TITLES,
  METRICS_SCORED_WITHOUT_LARGEST_CONTENTFUL_PAINT,
  PERFORMANCE_FLOORS,
  TITLES_WITHOUT_CONTENTFUL_PAINT,
  TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT,
  assertionMatrix,
  performanceAssertions,
  performanceFloor,
  selectAuditedStories,
  shardStories,
  storyUrl,
};

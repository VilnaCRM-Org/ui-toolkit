const STORY_ENTRY_TYPE = 'story';
const SHARD_SPEC = /^([1-9]\d*)\/([1-9]\d*)$/;

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

const PERFORMANCE_FLOORS = {
  desktop: ['error', { minScore: 0.9 }],
  mobile: ['warn', { minScore: 0.7 }],
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

function assertSkipListIsLive(skippedTitles, liveTitles) {
  const stale = skippedTitles.filter(title => !liveTitles.has(title));
  if (stale.length > 0) {
    throw new Error(
      `Lighthouse skip-list names titles absent from the Storybook index: ${stale.join(', ')}`
    );
  }
}

function selectAuditedStories(index, skippedTitles) {
  const representatives = firstStoryPerTitle(Object.values(index.entries));
  assertSkipListIsLive(skippedTitles, new Set(representatives.map(entry => entry.title)));
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

module.exports = {
  PERFORMANCE_FLOORS,
  TITLES_WITHOUT_CONTENTFUL_PAINT,
  performanceFloor,
  selectAuditedStories,
  shardStories,
  storyUrl,
};

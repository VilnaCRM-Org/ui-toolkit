import type {
  ArgTypesEnhancer,
  SBType,
  StrictArgTypes,
  StrictInputType,
} from 'storybook/internal/types';

// The component types spell optional props `foo?: T | undefined` so consumers on
// `exactOptionalPropertyTypes` can pass a `T | undefined` through (issue #153).
// Storybook's docgen reads that as a union of `T` and `undefined`, which infers an
// `object` control and makes the preview reject a URL arg (`?args=checked:!true`)
// as incompatible with the type. The `undefined` member carries no information
// on an optional prop, so it is folded away before controls are inferred.

function isUndefinedMember(type: SBType): boolean {
  return type.name === 'other' && type.value === 'undefined';
}

function withoutUndefined(type: SBType): SBType {
  if (type.name !== 'union') return type;
  const members: SBType[] = type.value.filter(member => !isUndefinedMember(member));
  if (members.length === type.value.length) return type;
  if (members.length === 1) return { ...members[0], required: type.required } as SBType;
  return {
    ...type,
    value: members,
    raw: members.map(member => member.raw ?? member.name).join(' | '),
  };
}

function collapseArgType(argType: StrictInputType): StrictInputType {
  if (!argType.type || typeof argType.type === 'string') return argType;
  const collapsed: SBType = withoutUndefined(argType.type);
  if (collapsed === argType.type) return argType;
  return {
    ...argType,
    type: collapsed,
    table: {
      ...argType.table,
      type: { ...argType.table?.type, summary: collapsed.raw ?? collapsed.name },
    },
  };
}

export const collapseOptionalUndefined: ArgTypesEnhancer = ({ argTypes }): StrictArgTypes =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => [name, collapseArgType(argType)])
  );

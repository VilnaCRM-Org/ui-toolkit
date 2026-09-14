import type {
  ArgTypesEnhancer,
  SBType,
  StrictArgTypes,
  StrictInputType,
} from 'storybook/internal/types';

function isUndefinedMember(type: SBType): boolean {
  return type.name === 'other' && type.value === 'undefined';
}

function memberText(member: SBType): string {
  if (member.name === 'literal') return String(member.value);
  return member.raw ?? member.name;
}

function withoutUndefined(type: SBType): SBType {
  if (type.name !== 'union' || type.required !== false) return type;
  const members: SBType[] = type.value.filter(member => !isUndefinedMember(member));
  if (members.length === type.value.length) return type;
  if (members.length === 1) return { ...members[0], required: false } as SBType;
  return { ...type, value: members, raw: members.map(memberText).join(' | ') };
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

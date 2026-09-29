import { brotliDecompressSync } from 'node:zlib';

const SFNT_SIGNATURES: ReadonlySet<number> = new Set([0x00010000, 0x4f54544f, 0x74727565]);
const TABLE_RECORD_SIZE: number = 16;
const TABLE_DIRECTORY_OFFSET: number = 12;
const NAME_RECORD_SIZE: number = 12;
const NAME_RECORDS_OFFSET: number = 6;
const LICENSE_DESCRIPTION_ID: number = 13;
const MACINTOSH_PLATFORM: number = 1;
const WOFF2_SIGNATURE: number = 0x774f4632;
const WOFF2_HEADER_SIZE: number = 48;
const WOFF2_NAME_TAG: number = 5;
const WOFF2_CUSTOM_TAG: number = 63;
const WOFF2_NULL_TRANSFORM_TAGS: ReadonlyMap<number, number> = new Map([
  [10, 3],
  [11, 3],
]);

interface Woff2Entry {
  isName: boolean;
  length: number;
  next: number;
}

interface NameRecord {
  platform: number;
  nameId: number;
  length: number;
  offset: number;
}

function nameTableOffset(font: Buffer): number | undefined {
  const tables: number = font.readUInt16BE(4);
  for (let index = 0; index < tables; index += 1) {
    const record: number = TABLE_DIRECTORY_OFFSET + index * TABLE_RECORD_SIZE;
    if (font.toString('latin1', record, record + 4) === 'name') {
      return font.readUInt32BE(record + 8);
    }
  }
  return undefined;
}

function nameRecord(font: Buffer, table: number, index: number): NameRecord {
  const record: number = table + NAME_RECORDS_OFFSET + index * NAME_RECORD_SIZE;
  return {
    platform: font.readUInt16BE(record),
    nameId: font.readUInt16BE(record + 6),
    length: font.readUInt16BE(record + 8),
    offset: font.readUInt16BE(record + 10),
  };
}

function decode(raw: Buffer, platform: number): string {
  if (platform === MACINTOSH_PLATFORM) return raw.toString('latin1');
  return Buffer.from(raw).swap16().toString('utf16le');
}

function licenseDescription(font: Buffer, table: number): string | undefined {
  const count: number = font.readUInt16BE(table + 2);
  const strings: number = table + font.readUInt16BE(table + 4);
  for (let index = 0; index < count; index += 1) {
    const record: NameRecord = nameRecord(font, table, index);
    if (record.nameId === LICENSE_DESCRIPTION_ID) {
      const start: number = strings + record.offset;
      return decode(font.subarray(start, start + record.length), record.platform);
    }
  }
  return undefined;
}

function readBase128(font: Buffer, offset: number): [number, number] {
  let value: number = 0;
  let cursor: number = offset;
  let byte: number = 0x80;
  while (byte & 0x80) {
    byte = font.readUInt8(cursor);
    value = value * 128 + (byte & 0x7f);
    cursor += 1;
  }
  return [value, cursor];
}

function woff2Entry(font: Buffer, offset: number): Woff2Entry {
  const flags: number = font.readUInt8(offset);
  const tag: number = flags & 0x3f;
  const tagEnd: number = tag === WOFF2_CUSTOM_TAG ? offset + 5 : offset + 1;
  const isName: boolean =
    tag === WOFF2_NAME_TAG ||
    (tag === WOFF2_CUSTOM_TAG && font.toString('latin1', offset + 1, tagEnd) === 'name');
  const [origLength, afterOrig] = readBase128(font, tagEnd);
  if (flags >> 6 === (WOFF2_NULL_TRANSFORM_TAGS.get(tag) ?? 0)) {
    return { isName, length: origLength, next: afterOrig };
  }
  const [transformLength, next] = readBase128(font, afterOrig);
  return { isName, length: transformLength, next };
}

function woff2NameTable(font: Buffer): Buffer | undefined {
  let cursor: number = WOFF2_HEADER_SIZE;
  let dataOffset: number = 0;
  let name: { offset: number; length: number } | undefined;
  for (let index = 0; index < font.readUInt16BE(12); index += 1) {
    const entry: Woff2Entry = woff2Entry(font, cursor);
    name = entry.isName ? { offset: dataOffset, length: entry.length } : name;
    dataOffset += entry.length;
    cursor = entry.next;
  }
  const tables: Buffer = brotliDecompressSync(
    font.subarray(cursor, cursor + font.readUInt32BE(20))
  );
  return name && tables.subarray(name.offset, name.offset + name.length);
}

function woff2Description(font: Buffer): string | undefined {
  const table: Buffer | undefined = woff2NameTable(font);
  return table === undefined ? undefined : licenseDescription(table, 0);
}

function readDescription(font: Buffer): string | undefined {
  if (font.readUInt32BE(0) === WOFF2_SIGNATURE) return woff2Description(font);
  if (!SFNT_SIGNATURES.has(font.readUInt32BE(0))) return undefined;
  const table: number | undefined = nameTableOffset(font);
  return table === undefined ? undefined : licenseDescription(font, table);
}

export default function fontLicenseDescription(font: Buffer): string | undefined {
  try {
    return readDescription(font);
  } catch {
    return undefined;
  }
}

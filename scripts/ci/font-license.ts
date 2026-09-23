const SFNT_SIGNATURES: ReadonlySet<number> = new Set([0x00010000, 0x4f54544f, 0x74727565]);
const TABLE_RECORD_SIZE: number = 16;
const TABLE_DIRECTORY_OFFSET: number = 12;
const NAME_RECORD_SIZE: number = 12;
const NAME_RECORDS_OFFSET: number = 6;
const LICENSE_DESCRIPTION_ID: number = 13;
const MACINTOSH_PLATFORM: number = 1;

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

function readDescription(font: Buffer): string | undefined {
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

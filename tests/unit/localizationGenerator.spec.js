const path = require('path');

jest.mock('fs', () => ({
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

const fs = require('fs');

const LocalizationGenerator = require('../../scripts/localizationGenerator');

const FEATURE_FOLDERS = [
  { name: 'folder1', isDirectory: () => true },
  { name: 'folder2', isDirectory: () => true },
];

const MOCK_FILE_EN = { name: 'en.json', isFile: () => true };
const MOCK_FILE_FR = { name: 'fr.json', isFile: () => true };
const MOCK_FILE_EN_EXTRA = { name: 'en.extra.json', isFile: () => true };

const LOCALIZATION_OBJ = {
  en: { translation: { greeting: 'Hello' } },
  fr: { translation: { greeting: 'Bonjour' } },
};

function mockedReaddirSync() {
  return fs.readdirSync;
}

function mockedReadFileSync() {
  return fs.readFileSync;
}

function mockedWriteFileSync() {
  return fs.writeFileSync;
}

function mockedMkdirSync() {
  return fs.mkdirSync;
}

describe('LocalizationGenerator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeatureFolders', () => {
    test('should return an array of feature folders', () => {
      mockedReaddirSync().mockReturnValueOnce(FEATURE_FOLDERS);

      const generator = new LocalizationGenerator();
      const result = generator.getFeatureFolders();

      expect(result).toEqual(['folder1', 'folder2']);
    });

    test('should return an empty array when the feature directory is missing', () => {
      const error = new Error('missing features');
      error.code = 'ENOENT';

      mockedReaddirSync().mockImplementationOnce(() => {
        throw error;
      });

      const generator = new LocalizationGenerator();

      expect(generator.getFeatureFolders()).toEqual([]);
    });
  });

  describe('getLocalizationFromFolder', () => {
    test('should return an object of localizations from a folder', () => {
      const folder = 'folder1';
      const localizationFiles = [MOCK_FILE_EN, MOCK_FILE_FR];

      mockedReaddirSync().mockReturnValueOnce(localizationFiles);

      mockedReadFileSync()
        .mockReturnValueOnce(JSON.stringify({ greeting: 'Hello' }))
        .mockReturnValueOnce(JSON.stringify({ greeting: 'Bonjour' }));

      const generator = new LocalizationGenerator();
      const result = generator.getLocalizationFromFolder(folder);

      expect(result).toEqual(LOCALIZATION_OBJ);
    });

    test('should use the full filename before the extension as the language key', () => {
      mockedReaddirSync().mockReturnValueOnce([MOCK_FILE_EN_EXTRA]);
      mockedReadFileSync().mockReturnValueOnce(JSON.stringify({ greeting: 'Hello' }));

      const generator = new LocalizationGenerator();

      expect(generator.getLocalizationFromFolder('folder1')).toEqual({
        'en.extra': { translation: { greeting: 'Hello' } },
      });
    });

    test('should return an empty object when a feature has no i18n directory', () => {
      const error = new Error('missing i18n');
      error.code = 'ENOENT';

      mockedReaddirSync().mockImplementationOnce(() => {
        throw error;
      });

      const generator = new LocalizationGenerator();

      expect(generator.getLocalizationFromFolder('folder-without-i18n')).toEqual({});
    });

    test('should throw a contextual error when a localization file cannot be parsed', () => {
      mockedReaddirSync().mockReturnValueOnce([MOCK_FILE_EN, MOCK_FILE_FR]);
      mockedReadFileSync().mockReturnValueOnce('{');

      const generator = new LocalizationGenerator();

      expect(() => generator.getLocalizationFromFolder('folder1')).toThrow(/folder1\/en\.json/);
    });
  });

  describe('writeLocalizationFile', () => {
    test('should write the localization file', () => {
      const filePath = 'tests/unit/localization.json';
      const fileContent = JSON.stringify({ greeting: 'Hello' });

      const mockMkdirSync = mockedMkdirSync();
      const mockWriteFileSync = mockedWriteFileSync();

      const generator = new LocalizationGenerator();
      generator.writeLocalizationFile(fileContent, filePath);

      expect(mockMkdirSync).toHaveBeenCalledWith(path.dirname(filePath), { recursive: true });
      expect(mockWriteFileSync).toHaveBeenCalledWith(filePath, fileContent);
    });

    it('should throw an error if file write fails', () => {
      mockedWriteFileSync().mockImplementationOnce(() => {
        throw new Error('File write error');
      });

      const generator = new LocalizationGenerator();

      const fileContent = JSON.stringify({ key: 'value' });
      const filePath = 'tests/unit/localization.json';

      expect(() => {
        generator.writeLocalizationFile(fileContent, filePath);
      }).toThrow('File write error');
    });
  });

  describe('generateLocalizationFile', () => {
    test('should write the generated localization to the root i18n folder', () => {
      mockedReaddirSync()
        .mockReturnValueOnce(FEATURE_FOLDERS)
        .mockReturnValueOnce([MOCK_FILE_EN])
        .mockReturnValueOnce([MOCK_FILE_FR]);

      mockedReadFileSync()
        .mockReturnValueOnce(JSON.stringify({ greeting: 'Hello' }))
        .mockReturnValueOnce(JSON.stringify({ greeting: 'Bonjour' }));

      const mockWriteFileSync = mockedWriteFileSync();
      const generator = new LocalizationGenerator();

      generator.generateLocalizationFile();

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        path.resolve(__dirname, '..', '..', 'i18n', 'localization.json'),
        JSON.stringify(LOCALIZATION_OBJ)
      );
    });
  });
});

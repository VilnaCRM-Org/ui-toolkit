const fs = require('fs');

const LocalizationGenerator = require('../../localizationGenerator');

const FEATURE_FOLDERS = [
  { name: 'folder1', isDirectory: () => true },
  { name: 'folder2', isDirectory: () => true },
];

const MOCK_FILE_EN = { name: 'en.json', isFile: () => true };
const MOCK_FILE_FR = { name: 'fr.json', isFile: () => true };

const LOCALIZATION_OBJ = {
  en: { translation: { greeting: 'Hello' } },
  fr: { translation: { greeting: 'Bonjour' } },
};

function mockedReaddirSync() {
  return jest.spyOn(fs, 'readdirSync');
}

function mockedReadFileSync() {
  return jest.spyOn(fs, 'readFileSync');
}

function mockedWriteFileSync() {
  return jest.spyOn(fs, 'writeFileSync');
}

jest.mock('fs');

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
  });

  describe('writeLocalizationFile', () => {
    test('should write the localization file', () => {
      const filePath = 'scripts/test/unit/localization.json';
      const fileContent = JSON.stringify({ greeting: 'Hello' });

      const mockWriteFileSync = mockedWriteFileSync();

      const generator = new LocalizationGenerator();
      generator.writeLocalizationFile(fileContent, filePath);

      expect(mockWriteFileSync).toHaveBeenCalledWith(filePath, fileContent);
    });

    it('should throw an error if file write fails', () => {
      mockedWriteFileSync().mockImplementation(() => {
        throw new Error('File write error');
      });

      const generator = new LocalizationGenerator();

      const fileContent = JSON.stringify({ key: 'value' });
      const filePath = 'scripts/test/unit/localization.json';

      expect(() => {
        generator.writeLocalizationFile(fileContent, filePath);
      }).toThrow('File write error');
    });
  });
});

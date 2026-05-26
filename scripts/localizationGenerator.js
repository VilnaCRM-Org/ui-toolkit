const fs = require('fs');
const path = require('path');

class LocalizationGenerator {
  i18nPath;

  featurePath;

  jsonFileType;

  localizationFile;

  pathToWriteLocalization;

  pathToI18nFolder;

  pathToI18nFile;

  constructor(
    i18nPath = 'i18n',
    featurePath = 'src/features',
    jsonFileType = 'json',
    localizationFile = 'localization.json'
  ) {
    this.i18nPath = i18nPath;
    this.featurePath = featurePath;
    this.jsonFileType = jsonFileType;
    this.localizationFile = localizationFile;

    this.pathToWriteLocalization = i18nPath;
    this.pathToI18nFolder = `${featurePath}/{folder}/${i18nPath}`;
    this.pathToI18nFile = `${featurePath}/{folder}/${i18nPath}/{file.name}`;
  }

  generateLocalizationFile() {
    const featureFolders = this.getFeatureFolders();

    if (!featureFolders.length) return;

    const localizationObj = featureFolders.reduce((acc, folder) => {
      const parsedLocalizationFromFolder = this.getLocalizationFromFolder(folder);

      Object.entries(parsedLocalizationFromFolder).forEach(([language, { translation }]) => {
        acc[language] = {
          translation: {
            ...(acc[language]?.translation ?? {}),
            ...translation,
          },
        };
      });

      return acc;
    }, {});

    const filePath = path.join(
      path.dirname(__dirname),
      this.pathToWriteLocalization,
      this.localizationFile
    );
    const fileContent = JSON.stringify(localizationObj);

    this.writeLocalizationFile(fileContent, filePath);
  }

  getFeatureFolders() {
    let featureDirectories = [];

    try {
      featureDirectories = fs.readdirSync(this.featurePath, {
        withFileTypes: true,
      });
    } catch (error) {
      if (error.code === 'ENOENT') return [];

      throw error;
    }

    return featureDirectories
      .filter(directory => directory.isDirectory())
      .map(directory => directory.name);
  }

  getLocalizationFromFolder(folder) {
    let localizationFiles = [];

    try {
      localizationFiles = fs.readdirSync(this.pathToI18nFolder.replace('{folder}', folder), {
        withFileTypes: true,
      });
    } catch (error) {
      if (error.code === 'ENOENT') return {};

      throw error;
    }

    return localizationFiles.reduce((localizations, file) => {
      if (!file.isFile()) return localizations;

      const fileType = path.extname(file.name).replace('.', '');

      if (fileType !== this.jsonFileType) return localizations;

      const language = file.name.slice(0, -(fileType.length + 1));

      try {
        const localizationFilePath = this.pathToI18nFile
          .replace('{folder}', folder)
          .replace('{file.name}', file.name);
        const localizationContent = fs.readFileSync(localizationFilePath, 'utf8');
        const parsedLocalization = JSON.parse(localizationContent);

        return {
          ...localizations,
          [language]: {
            translation: parsedLocalization,
          },
        };
      } catch (error) {
        error.message =
          `Failed to parse localization file ${folder}/${file.name}: ` +
          error.message;
        throw error;
      }
    }, {});
  }

  // eslint-disable-next-line class-methods-use-this
  writeLocalizationFile(fileContent, filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileContent);
  }
}

module.exports = LocalizationGenerator;

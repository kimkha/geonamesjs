import * as path from 'path';
import * as fs from 'fs';
import * as Debug from 'debug';
import fetch from 'node-fetch';
import { CityInfo, CountryInfo } from './src/types';

const AdmZip = require('adm-zip');
const debug = Debug('geonamesjs-generator');
// const debug = console.log;

// All data from http://download.geonames.org/export/dump/
const GEONAMES_URL = 'http://download.geonames.org/export/dump/';

const generateCodeIndex = (countries: CountryInfo[]) => `
// Generated code, DO NOT MODIFY

${countries.map(country =>
  `export { ${country.ISO} } from './cities/${country.ISO}';`
).join(`\n`)}
`;
const generateCodeCountry = (cities: CityInfo[], country: CountryInfo) => `
// Generated code, DO NOT MODIFY

import { CityInfo } from '../types';

export const ${country.ISO}: CityInfo[] = [
${cities.map(city =>
  `  ${JSON.stringify(city)}`
).join(`,\n`)}
];

export default ${country.ISO};
`;

const convertLines = (lines: string[]): string[][] => {
  const result = [];
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    result.push(line.split('\t'));
  }
  return result;
};

const downloadAndUnzipFiles = async (url: string, entryFile?: string) => {
  let bufferData = await fetch(url).then(res => res.buffer());
  if (url.endsWith('.zip') && entryFile) {
    const zip = new AdmZip(bufferData);
    const entry = zip.getEntry(entryFile);
    bufferData = entry.getData();
  }
  const lines = bufferData.toString('utf8').split(/(?:\r\n|\r|\n)/g);
  return convertLines(lines);
};

// const fetchAlternateNames = async () => {
//   const url = GEONAMES_URL + 'alternateNamesV2.zip';
//   const entryFile = 'alternateNamesV2.txt';
//   debug(`Getting GeoNames alternate names data from ${url} (this may take a while)`);
//   const alternateRecords = await downloadAndUnzipFiles(url, entryFile);
// };

const fetchCountriesInfo = async (): Promise<CountryInfo[]> => {
  const url = GEONAMES_URL + 'countryInfo.txt';
  debug(`Getting GeoNames country info from ${url} (this may take a while)`);
  const lines = await downloadAndUnzipFiles(url);
  return lines.map<CountryInfo>(([
      ISO,
      // TODO Maps other fields
    ]) => ({
      ISO,
    }));
};

const fetchGeoCities = async (countryIso: string): Promise<CityInfo[]> => {
  const url = `${GEONAMES_URL}${countryIso}.zip`;
  const entryFile = `${countryIso}.txt`;
  debug(`Getting GeoNames cities info of ${countryIso} from ${url} (this may take a while)`);
  const lines = await downloadAndUnzipFiles(url, entryFile);
  return lines.map<CityInfo>(([
                                geoNameId,
                                name,
                                asciiName,
                                alternateNames,
                                latitude,
                                longitude,
                                featureClass,
                                featureCode,
                                countryCode,
                                cc2,
                                admin1Code,
                                admin2Code,
                                admin3Code,
                                admin4Code,
                                population,
                                elevation,
                                dem,
                                timezone,
                                modificationDate,
    ]) => ({
      geoNameId,
      name,
      asciiName,
      alternateNames,
      latitude,
      longitude,
      featureClass,
      featureCode,
      countryCode,
      cc2,
      admin1Code,
      admin2Code,
      admin3Code,
      admin4Code,
      population,
      elevation,
      dem,
      timezone,
      modificationDate,
    }))
};

const processAll = async () => {
  const parallel: Promise<any>[] = [];
  const countries = await fetchCountriesInfo();
  for (const country of countries) {
    const p = fetchGeoCities(country.ISO).then(cities => {
      const code = generateCodeCountry(cities, country);
      const file = path.join(__dirname, `./src/cities/${country.ISO}.ts`);
      return fs.promises.writeFile(file, code);
    });
    parallel.push(p);
  }
  const index = Promise.resolve().then(() => {
    const code = generateCodeIndex(countries);
    const file = path.join(__dirname, `./src/index.ts`);
    return fs.promises.writeFile(file, code);
  });
  parallel.push(index);
  Promise.all(parallel).then(() => debug('DONE!'));
};

processAll();

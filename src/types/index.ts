
export type CountryInfo = {
  ISO: string,
  // TODO Maps other fields
}

export type CityInfo = {
  geoNameId: string, // integer id of record in geonames database
  name: string, // name of geographical point (utf8) varchar(200)
  asciiName: string, // name of geographical point in plain ascii characters, varchar(200)
  alternateNames: string, // alternatenames, comma separated, ascii names automatically transliterated, convenience attribute from alternatename table, varchar(10000)
  latitude: string, // latitude in decimal degrees (wgs84)
  longitude: string, // longitude in decimal degrees (wgs84)
  featureClass: string, // see http://www.geonames.org/export/codes.html, char(1)
  featureCode: string, // see http://www.geonames.org/export/codes.html, varchar(10)
  countryCode: string, // ISO-3166 2-letter country code, 2 characters
  cc2: string, // alternate country codes, comma separated, ISO-3166 2-letter country code, 60 characters
  admin1Code: string, // fipscode (subject to change to iso code), see exceptions below, see file admin1Codes.txt for display names of this code; varchar(20)
  admin2Code: string, // code for the second administrative division, a county in the US, see file admin2Codes.txt; varchar(80)
  admin3Code: string, // code for third level administrative division, varchar(20)
  admin4Code: string, // code for fourth level administrative division, varchar(20)
  population: string, // bigint (8 byte int)
  elevation: string, // in meters, integer
  dem: string, // digital elevation model, srtm3 or gtopo30, average elevation 3''x3'' (ca 90mx90m) or 30''x30'' (ca 900mx900m) area in meters, integer. srtm processed by cgiar/ciat.
  timezone: string, // the timezone id (see file timeZone.txt) varchar(40)
  modificationDate: string, // date of last modification in yyyy-MM-dd format
};

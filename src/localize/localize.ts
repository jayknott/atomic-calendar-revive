import { Language, TranslationCatalog } from '../types';

import * as da from './languages/da.json';
import * as de from './languages/de.json';
import * as en from './languages/en.json';
import * as et from './languages/et.json';
import * as fr from './languages/fr.json';
import * as nb from './languages/nb.json';
import * as sl from './languages/sl.json';
import * as sv from './languages/sv.json';

const translationCatalog: TranslationCatalog = {
  da,
  de,
  en,
  et,
  fr,
  nb,
  sl,
  sv,
};

export function localize(string: string, search = '', replace = '') {
  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_') as Language;

  let translated = '';

  try {
    translated = string.split('.').reduce((o, i) => o[i], translationCatalog[lang]) as unknown as string;
  } catch {
    // do nothing, an empty translation will use english
  }

  if (!translated) translated = string.split('.').reduce((o, i) => o[i], translationCatalog.en) as unknown as string;

  if (search !== '' && replace !== '') {
    translated = translated.replace(search, replace);
  }

  return translated;
}

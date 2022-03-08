import { version, editor_version } from '../package.json';
import defaultConfig from './defaults';
import defaultConfigSimple from './defaults-simple';
import { DisplayStyleCatalog } from './types';

export const CARD_VERSION = version;
export const EDITOR_VERSION = editor_version;

export const DISPLAY_STYLE_CATALOG: DisplayStyleCatalog = {
  standard: {
    name: 'Standard',
    defaultConfig,
  },
  simple: {
    name: 'Simple',
    defaultConfig: defaultConfigSimple,
    cssClassName: 'simple',
  },
};

import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
import * as en from './localize/languages/en.json';

declare global {
  interface HTMLElementTagNameMap {
    'atomic-calendar-card-editor': LovelaceCardEditor;
    'atomic-calendar-card': LovelaceCard;
  }

  interface Window {
    customCards: HassCustomCard[];
    loadCardHelpers: () => Promise<void>;
  }
}

export interface ConfigEventTarget extends EventTarget {
  configValue: string;
  value?: any;
  checked?: boolean;
}

const LANGUAGES = ['da', 'de', 'en', 'et', 'fr', 'nb', 'sl', 'sv'] as const;

export type Language = typeof LANGUAGES[number];

export type TranslationData = typeof en;

export type TranslationCatalog = {
  [key in Language]: TranslationData;
};

export interface HassCustomCard {
  type: string;
  name: string;
  preview: boolean;
  description: string;
}

export interface HassCalendarEvent {
  summary?: string;
  location?: string;
  visibility?: string;
  description?: string;
  start: { date?: string; dateTime?: string; timeZone?: string };
  end: { date?: string; dateTime?: string; timeZone?: string };
  htmlLink?: string;
  attendees?: Array<{ self: boolean; responseStatus: string }>;
}

export interface CalendarEntity {
  entity: string;
  color?: string;
  eventTitleColor?: string;
  type?: 'Icon1' | 'Icon2' | 'Icon3' | 'Birthday';
  blacklist?: string;
  whitelist?: string;
  locationWhitelist?: string;
  eventCalName?: string;
  icon?: string;
  startTimeFilter?: string;
  endTimeFilter?: string;
  maxDaysToShow?: number;
}

export type FieldType = 'boolean' | 'break' | 'content' | 'number' | 'select' | 'text';

export interface Option {
  value: string | number | boolean | null | undefined;
  title?: string;
}

export type OptionList = Option[];

export interface ConfigProperty {
  name: string;
  title?: string;
  fieldType?: FieldType;
  options?: OptionList;
}

export interface ConfigCategorySettings {
  icon: string;
  properties: ConfigProperty[];
}

export const CONFIG_CATEGORIES = ['required', 'main', 'event', 'calendar', 'appearance'] as const;

export type ConfigCategory = typeof CONFIG_CATEGORIES[number];

export type ConfigCategoryCatalog = {
  [key in ConfigCategory]: ConfigCategorySettings;
};

export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export const DISPLAY_STYLES = ['standard', 'simple'] as const;

export type DisplayStyle = typeof DISPLAY_STYLES[number];

export interface DisplayStyleSettings {
  name: string;
  defaultConfig: Omit<atomicCardConfig, 'entities'>;
  cssClassName?: string;
}

export type DisplayStyleCatalog = {
  [key in DisplayStyle]: DisplayStyleSettings;
};

export const LINK_TARGETS = ['_blank', '_parent', '_self', '_top'] as const;

export type LinkTarget = typeof LINK_TARGETS[number];

export const MODES = ['Event', 'Calendar'] as const;

export type Mode = typeof MODES[number];

export interface atomicCardConfig extends LovelaceCardConfig {
  // Card Settings
  entities: CalendarEntity[];
  type: 'atomic-calendar-revive-2';
  language?: Language;

  // Main options
  cardHeight: string;
  dateFormat: string;
  defaultMode: Mode;
  firstDayOfWeek: DayOfWeek;
  hideDuplicates: boolean;
  hideFinishedEvents: boolean;
  hoursFormat?: string;
  linkTarget: LinkTarget;
  maxDaysToShow: number;
  name?: string;
  refreshInterval: number;
  showDate: boolean;
  showDeclined: boolean;
  showLoader: boolean;
  showLocation: boolean;
  showRelativeTime: boolean;
  sortByStartTime: boolean;

  // Event mode settings
  disableEventLink: boolean;
  disableLocationLink: boolean;
  fullDayEventText: string;
  hiddenEventText: string;
  horizontal: boolean;
  noEventsForNextDaysText: string;
  noEventText: string;
  showCurrentEventLine: boolean;
  showDescription: boolean;
  showEventIcon: boolean;
  showFullDayProgress: boolean;
  showHiddenText: boolean;
  showMonth: boolean;
  showNoEventsForToday: boolean;
  showProgressBar: boolean;
  showWeekDay: boolean;
  untilText: string;

  // Calendar mode settings
  disableCalEventLink: boolean; // remove
  disableCalLink: boolean;
  disableCalLocationLink: boolean; //remove
  showLastCalendarWeek: boolean;

  // Appearance settings
  dimFinishedEvents: boolean;

  // Others
  fullTextTime: boolean;
  maxEventCount: number;
  showPrivate: boolean;
  startDaysAhead: number;

  // More
  showCalNameInEvent?: boolean;
  softLimit?: number;

  // color and font settings
  nameColor: string;
  dateColor?: string;
  dateSize?: number;
  descColor: string;
  descSize: number;
  descLength?: number;
  timeColor: string;
  timeSize: number;
  showHours?: boolean;
  eventTitleColor: string;
  eventTitleSize: number;
  locationIconColor: string;
  locationLinkColor: string;
  locationTextSize: number;

  // finished events settings
  finishedEventOpacity?: number;
  finishedEventFilter?: string;

  // days separating
  dayWrapperLineColor?: string;
  eventBarColor: string;
  eventCalNameColor: string;
  eventCalNameSize: number;
  progressBarColor: string;
  progressBarBufferColor: string;
  enableModeChange?: boolean;
  displayStyle?: DisplayStyle;

  // Calendar Mode Default Settings
  calGridColor: string;
  calDayColor?: string;
  calWeekdayColor: string;
  calDateColor: string;
  defaultCalColor?: string;
  calEventBackgroundColor?: string;
  calEventBackgroundFilter?: string;
  calActiveEventBackgroundColor?: string;
  calActiveEventBackgroundFilter?: string;
  calEventSatColor?: string;
  calEventSunColor?: string;
  calEventHolidayColor?: string;
  calEventHolidayFilter?: string;
  calEventIcon1?: string;
  calEventIcon1Color?: string;
  calEventIcon1Filter?: string;
  calEventIcon2?: string;
  calEventIcon2Color?: string;
  calEventIcon2Filter?: string;
  calEventIcon3?: string;
  calEventIcon3Color?: string;
  calEventIcon3Filter?: string;
  calEventTime?: boolean;
  blacklist?: string;
  whitelist?: string;
  locationFilter?: string;
  europeanDate: boolean;
}

export interface atomicCustomConfig extends Partial<Omit<atomicCardConfig, 'entities'>> {
  entities: string | CalendarEntity[];
}

export interface LongDateFormatSpec {
  LTS: string;
  LT: string;
  L: string;
  LL: string;
  LLL: string;
  LLLL: string;

  // lets forget for a sec that any upper/lower permutation will also work

  lts?: string;
  lt?: string;
  l?: string;
  ll?: string;
  lll?: string;
  llll?: string;
}

//EDITOR TYPES
export interface EntityConfig {
  entity: string;
  type?: string;
  name?: string;
  icon?: string;
}

export interface ConfigEntity extends EntityConfig {
  type?: string;
  secondary_info?: 'entity-id' | 'last-changed';
  action_name?: string;
  service?: string;
  service_data?: object;
  url?: string;
}

export interface EntitiesEditorEvent {
  detail?: {
    entities?: EntityConfig[];
  };
  target?: EventTarget;
}

export interface EditorTarget extends EventTarget {
  value?: string;
  index?: number;
  checked?: boolean;
  configValue?: string;
}

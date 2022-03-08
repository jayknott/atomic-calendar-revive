import defaultConfig from './defaults';
import { atomicCustomConfig } from './types';

export default {
  ...defaultConfig,

  // Main options
  firstDayOfWeek: 0, // default 0 - sunday
  hideDuplicates: true, // Hide similar items in the calendar
  showRelativeTime: false, // Show the relative time next to day

  // Event mode settings
  showNoEventsForToday: true,
  showProgressBar: false,

  // Calendar mode settings

  // Appearance settings
  dayWrapperLineColor: 'var(--divider-color)', // days separating line color
  defaultCalColor: 'var(--primary-color)',
  eventCalNameSize: 100,
  eventTitleColor: 'var(--primary-color)', //Event title settings (center top), if no custom color set
  finishedEventFilter: 'grayscale(20%)', // css filter
  finishedEventOpacity: 0.5, // opacity level
  locationIconColor: 'rgb(--secondary-text-color)', //Location link settings (right side)
  locationLinkColor: 'var(--secondary-text-color)',
  timeColor: 'var(--secondary-text-color)', // Time text color (center bottom)
} as atomicCustomConfig;

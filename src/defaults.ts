import { localize } from './localize/localize';
import { atomicCardConfig } from './types';

export default {
  // Card Settings
  entities: [],
  type: 'atomic-calendar-revive-2',

  // Main options
  cardHeight: '100%',
  dateFormat: 'LL',
  defaultMode: 'Event',
  firstDayOfWeek: 1, // default 1 - monday
  hideDuplicates: false, // Hide similar items in the calendar
  hideFinishedEvents: false, // show finished events
  hoursFormat: undefined,
  linkTarget: '_blank', // Target for links, can use any HTML target type
  maxDaysToShow: 7, // maximum days to show (if zero, show only currently running events)
  name: undefined,
  refreshInterval: 60, // In seconds
  showDate: false,
  showDeclined: false, // Show declined events in the calendar
  showLoader: true, // show animation when loading events from Google calendar
  showLocation: true, // show location (right side)
  showRelativeTime: true, // Show the relative time next to day
  sortByStartTime: true, // sort first by calendar, then by time

  // Event mode settings
  disableEventLink: false, // disables links to event calendar
  disableLocationLink: false, // disables links to event calendar
  fullDayEventText: localize('common.fullDayEventText'), // "All day" custom text
  hiddenEventText: localize('common.hiddenEventText'),
  horizontal: false, // show the event view horizontally
  noEventsForNextDaysText: localize('common.noEventsForNextDaysText'),
  noEventText: localize('common.noEventText'),
  showCurrentEventLine: false, // show a line between last and next event
  showDescription: false,
  showEventIcon: false,
  showFullDayProgress: false,
  showHiddenText: true, //show the hidden events text
  showMonth: false, // show month under day (left side)
  showNoEventsForToday: false,
  showProgressBar: true, // Progress bar for in-progress event
  showWeekDay: false, // show day name under day (left side)
  untilText: localize('common.untilText'), // "Until" custom text

  // Calendar mode settings
  disableCalEventLink: false, // disables links to event calendar
  disableCalLink: false, // remove the link to the calendar
  disableCalLocationLink: false, // disables links to event calendar
  showLastCalendarWeek: false, // always shows last line/week in calendar mode, even if it's not the current month

  // Appearance settings
  dimFinishedEvents: true, // make finished events greyed out or set opacity

  // Other
  fullTextTime: true, // show advanced time messages, like: All day, until Friday 12
  maxEventCount: 0, // maximum number of events to show (if zero, unlimited)
  showPrivate: true, // hide private events
  startDaysAhead: 0, // shows the events starting on x days from today. Default 0.

  // color and font settings
  nameColor: 'var(--primary-text-color)', // Card Name color

  dateColor: 'var(--primary-text-color)', // Date text color (left side)
  dateSize: 90, //Date text size (percent of standard text)

  descColor: 'var(--primary-text-color)', // Description text color (left side)
  descSize: 80, //Description text size (percent of standard text)

  timeColor: 'var(--primary-color)', // Time text color (center bottom)
  timeSize: 90, //Time text size
  showHours: true, //shows the bottom line (time, duration of event)

  eventTitleColor: 'var(--primary-text-color)', //Event title settings (center top), if no custom color set
  eventTitleSize: 100,

  locationIconColor: 'rgb(--primary-text-color)', //Location link settings (right side)
  locationLinkColor: 'var(--primary-text-color)',
  locationTextSize: 90,

  // finished events settings
  finishedEventOpacity: 0.6, // opacity level
  finishedEventFilter: 'grayscale(80%)', // css filter

  // days separating
  dayWrapperLineColor: 'var(--primary-text-color)', // days separating line color
  eventBarColor: 'var(--primary-color)',

  eventCalNameColor: 'var(--primary-text-color)',
  eventCalNameSize: 90,

  progressBarColor: 'var(--primary-color)',
  progressBarBufferColor: 'var(--secondary-color)',

  enableModeChange: false,
  displayStyle: 'standard',

  // Calendar Mode Default Settings

  calGridColor: 'rgba(86, 86, 86, .35)',
  calDayColor: 'var(--primary-text-color)',
  calWeekdayColor: 'var(--primary-text-color)',
  calDateColor: 'var(--primary-text-color)',
  defaultCalColor: 'var(--primary-text-color)',

  calEventBackgroundColor: 'rgba(86, 100, 86, .35)',

  calActiveEventBackgroundColor: 'rgba(86, 128, 86, .35)',
  calEventSatColor: 'rgba(255, 255, 255, .05)',
  calEventSunColor: 'rgba(255, 255, 255, .15)',

  calEventTime: false, // show calendar event summary time

  europeanDate: false,
} as atomicCardConfig;

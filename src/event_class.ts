import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import { atomicCardConfig, CalendarEntity, HassCalendarEvent } from './types';

/**
 * class for Events
 *
 */
export class EventClass {
  isEmpty: boolean;
  eventClass: HassCalendarEvent;
  _globalConfig: atomicCardConfig;
  _config: CalendarEntity;
  _startTime: dayjs.Dayjs;
  _endTime: dayjs.Dayjs;
  isFinished: boolean;
  constructor(eventClass: HassCalendarEvent, globalConfig: atomicCardConfig, config: CalendarEntity) {
    this.eventClass = eventClass;
    this._globalConfig = globalConfig;
    this._config = config;
    this._startTime = this.eventClass.start.dateTime
      ? dayjs(this.eventClass.start.dateTime)
      : this.eventClass.start.date
        ? dayjs(this.eventClass.start.date).startOf('day')
        : dayjs(this.eventClass.start as string);
    this._endTime = this.eventClass.end.dateTime
      ? dayjs(this.eventClass.end.dateTime)
      : this.eventClass.end.date
        ? dayjs(this.eventClass.end.date).subtract(1, 'day').endOf('day')
        : dayjs(this.eventClass.end as string);
    this.isFinished = false;
    this.isEmpty = false;
  }

  takesPlaceOnDay(day: dayjs.Dayjs = dayjs()) {
    return this.startTime.isSame(day, 'day') ||
      this.endTime.isSame(day, 'day') ||
      day.startOf('day').isBetween(this.startTime, this.endTime);
  }

  checkFilter(string?: string, filterList?: string, whitelist = true) {
    if (!filterList) return true;
    if (!string) return !whitelist;

    const result = filterList.split(',').some((term) =>(
      RegExp(`(?:^|[\\W_]+)${term.trim()}`, 'i').test(string || '')
    ));

    if (whitelist) return result;
    return !result;
  }

  get valid() {
    return (
      this.checkFilter(this.title, this._config.whitelist) &&
      this.checkFilter(this.title, this._config.blacklist, false) &&
      this.checkFilter(this.location, this._config.locationWhitelist) &&
      this.validForDateFilter &&
      this.validForTimeFilter &&
      (this._globalConfig.showPrivate || this.visibility != 'private') &&
      (this._globalConfig.showDeclined || !this.declined) &&
      (this._globalConfig.maxDaysToShow > 0 || this.isEventRunning) &&
      (!this._globalConfig.hideFinishedEvents || !this.isEventFinished)
    )
  }

  get validForDateFilter() {
    return true;
  }

  get validForTimeFilter() {
    // no filters, always valid
    if (!this._config.startTimeFilter && !this._config.endTimeFilter) return true;

    // no start time, can't filter
    if (!this.startTime) return false;

    const endFilterMin = ['00:00', '0:00', '24:00'].includes(this._config.endTimeFilter!)
      ? '23:59'
      : this._config.endTimeFilter;
    let start = this._config.startTimeFilter
      ? dayjs(this._config.startTimeFilter, 'HH:mm')
      : dayjs().startOf('day');
    let end = endFilterMin ? dayjs(endFilterMin, 'HH:mm') : dayjs().endOf('day');

    start = start.year(this.startTime.year()).month(this.startTime.month()).date(this.startTime.date());
    end = end.year(this.startTime.year()).month(this.startTime.month()).date(this.startTime.date());

    const result = this.startTime.isBetween(start, end, 'minute', '[]');
    console.log({event: this.title, eventStart: this.startTime.format(), start: start.format(), end: end.format(), between: result});
    return result;
  }

  get titleColor() {
    return this._config?.eventTitleColor || 'var(--primary-text-color)';
  }

  get title() {
    return this.eventClass.summary;
  }

  get description() {
    return this.eventClass.description;
  }

  //get the start time for an event
  get startTime() {
    return this._startTime;
  }

  //start time, returns today if before today
  startTimeToShow(forDay: dayjs.Dayjs = dayjs()) {
    const time = this.startTime;
    if (dayjs(time).isBefore(forDay.startOf('day'))) {
      return forDay.startOf('day');
    }

    return time;
  }

  //get the end time for an event
  get endTime() {
    return this._endTime;
  }

  get isGoogleCal() {
    return this.link?.includes('google') || false
  }

  // is full day event
  get isFullDayEvent() {
    //1. check if google calendar all day event
    if (this._startTime.isSame(this._startTime.startOf('day')) && this._endTime.isSame(this._endTime.endOf('day'))) {
      return true;
    }
    //2. check if CalDav all day event
    else if (
      this._startTime.hour() === 0 &&
      this._startTime.isSame(this._endTime.subtract(1, 'day'), 'day') &&
      this._endTime.hour() === 0
    ) {
      return true;
    }

    return false;
  }

  // is full day event, more days
  get isFullMoreDaysEvent() {
    if (this.isFullDayEvent) {
      if (
        this._startTime.isSame(this._startTime.startOf('day')) &&
        this._endTime.isSame(this._endTime.endOf('day')) &&
        this._endTime.subtract(1, 'day').isAfter(this._startTime, 'day')
      ) {
        return true;
      }
    }

    return false;
  }

  get isEventRunning() {
    return dayjs().isBetween(this.startTime, this.endTime);
  }

  get isEventFinished() {
    return this.endTime.isBefore(dayjs());
  }

  get location() {
    return this.eventClass.location ? this.eventClass.location.split(' ').join('+') : '';
  }

  get address() {
    return this.eventClass.location ? this.eventClass.location.split(',')[0] : '';
  }

  get link() {
    return this.eventClass.htmlLink;
  }

  get visibility() {
    return this.eventClass.visibility;
  }

  get declined() {
    if (!this.eventClass.attendees) return false;

    return !!this.eventClass.attendees.find((attendee) => attendee.self == true && attendee.responseStatus == 'declined');
  }
}

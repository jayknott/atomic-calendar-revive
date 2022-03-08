import dayjs from 'dayjs';
import { EventClass } from './event_class';

/**
 * Class to hold a day and its events
 */
export class CalendarDay {
  calendarDay: dayjs.Dayjs;
  ymd: string;
  _allEvents: EventClass[];
  constructor(calendarDay: dayjs.Dayjs, events?: EventClass[]) {
    this.calendarDay = calendarDay;
    this.ymd = dayjs(calendarDay).format('YYYY-MM-DD');
    this._allEvents = events || [];
  }

  get date() {
    return this.calendarDay;
  }

  set allEvents(events: EventClass[]) {
    this._allEvents = events;
  }

  get allEvents() {
    return this._allEvents;
  }
}

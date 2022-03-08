import { CSSResult, html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { formatTime } from './helpers/format-time';

// DayJS for managing date information
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import relativeTime from 'dayjs/plugin/relativeTime';
import isoWeek from 'dayjs/plugin/isoWeek';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import './locale.dayjs';

dayjs.extend(updateLocale);
dayjs.extend(relativeTime);
dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.extend(LocalizedFormat);

import { CalendarDay } from './calendar_day';
import { CARD_VERSION, DISPLAY_STYLE_CATALOG } from './const';
import { EventClass } from './event_class';
import './editor';
import { localize } from './localize/localize';
import { styles as cardStyles } from './styles';
import { atomicCardConfig, atomicCustomConfig, CalendarEntity, DisplayStyle, HassCalendarEvent, Mode } from './types';

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'atomic-calendar-revive-2',
  name: 'Atomic Calendar Revive 2',
  preview: true,
  description: localize('common.description'),
});

@customElement('atomic-calendar-revive-2')
export class AtomicCalendarRevive extends LitElement {
  @property({ type: Object }) private _config!: atomicCardConfig;
  @property() private content?: TemplateResult | TemplateResult[] | string;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) private selectedMonth: dayjs.Dayjs;

  clickedDate: dayjs.Dayjs;
  displayStyle: DisplayStyle;
  errorMessage: TemplateResult;
  events: CalendarDay[];
  eventSummary: TemplateResult[];
  firstRun: boolean;
  hiddenEvents: number;
  horizontal: boolean;
  isUpdating: boolean;
  language: string;
  lastUpdateTime?: dayjs.Dayjs;
  modeToggle: Mode;
  monthToGet: string;
  shouldUpdateHtml: boolean;
  showLoader: boolean;

  constructor() {
    super();
    this.clickedDate = dayjs().startOf('day');
    this.content = html``;
    this.displayStyle = 'standard';
    this.errorMessage = html``;
    this.events = [];
    this.eventSummary = [html`&nbsp;`];
    this.firstRun = true;
    this.hiddenEvents = 0;
    this.horizontal = false;
    this.isUpdating = false;
    this.language = '';
    this.modeToggle = 'Calendar';
    this.monthToGet = dayjs().format('MM');
    this.selectedMonth = dayjs().startOf('month');
    this.shouldUpdateHtml = true;
    this.showLoader = false;
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('atomic-calendar-revive-2-editor') as LovelaceCardEditor;
  }

  public static getStubConfig() {
    return {
      name: 'Calendar Card',
      enableModeChange: true,
    };
  }

  public setConfig(config: atomicCardConfig): void {
    if (!config) {
      throw new Error(localize('errors.invalid_configuration'));
    }
    if (!config.entities) {
      throw new Error(localize('errors.no_entities'));
    }

    const customConfig: atomicCustomConfig = JSON.parse(JSON.stringify(config));

    // This transforms the atomicCustomConfig to a atomicCardConfig by expanding entities
    if (typeof customConfig.entities === 'string') {
      customConfig.entities = [{ entity: customConfig.entities }];
    } else {
      customConfig.entities.map((entity) => (typeof entity === 'string' ? { entity: entity } : entity));
    }

    this._config = {
      ...DISPLAY_STYLE_CATALOG[customConfig.displayStyle || 'standard'].defaultConfig,
      ...(customConfig as atomicCardConfig),
    };

    this.modeToggle = this._config.defaultMode;
  }

  static get styles() {
    return cardStyles;
  }

  setStyleVariables() {
    const cssVariables = {
      'cal-date-color': this._config.calDateColor,
      'cal-grid-color': this._config.calGridColor,
      'cal-weekday-color': this._config.calWeekdayColor,
      'card-height': this._config.cardHeight,
      'desc-color': this._config.descColor,
      'desc-size': this._config.descSize,
      'event-bar-color': this._config.eventBarColor,
      'event-cal-name-color': this._config.eventCalNameColor,
      'event-cal-name-size': this._config.eventCalNameSize,
      'event-title-size': this._config.eventTitleSize,
      'location-icon-color': this._config.locationIconColor,
      'location-link-color': this._config.locationLinkColor,
      'location-text-size': this._config.locationTextSize,
      'name-color': this._config.nameColor,
      'progress-bar-buffer-color': this._config.progressBarBufferColor,
      'progress-bar-color': this._config.progressBarColor,
      'time-color': this._config.timeColor,
      'time-size': this._config.timeSize,
    };

    Object.keys(cssVariables).forEach((variable) => {
      this.style.setProperty(`--atomic-cal-${variable}`, cssVariables[variable]);
    });
  }

  protected render(): TemplateResult | void {
    if (this.firstRun) {
      console.info(
        `%c atomic-calendar-revive %c ${localize('common.version')}: ${CARD_VERSION} `,
        'color: white; background: #484848; font-weight: 700;',
        'color: white; background: #cc5500; font-weight: 700;',
      );
      this.language = this._config.language
        ? this._config.language
        : this.hass.locale
        ? this.hass.locale.language.toLowerCase()
        : this.hass.language.toLowerCase();

      dayjs.locale(this.language);

      const timeFormat = this._config.hoursFormat
        ? this._config.hoursFormat
        : this.hass.locale?.time_format == '12' || this.hass.locale?.time_format == '24'
        ? formatTime(this.hass.locale)
        : dayjs().localeData().longDateFormat('LT');

      dayjs.updateLocale(this.language, {
        weekStart: this._config.firstDayOfWeek,
        formats: {
          LT: timeFormat,
          LTS: 'HH:mm:ss',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'MMM D YYYY HH:mm',
          LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
      });

      this.selectedMonth = dayjs().startOf('month');
      this.monthToGet = dayjs().format('MM');
    }
    if (!this._config || !this.hass) {
      return html``;
    }
    this.setStyleVariables();
    this.updateCard();

    return html`
      <ha-card class="cal-card">
        ${this._config.name || this._config.showDate || (this.showLoader && this._config.showLoader)
          ? html` <div class="cal-nameContainer">
              ${this._config.name
                ? html`<div class="cal-name" @click="${() => this.handleToggle()}">${this._config.name}</div>`
                : ''}
              ${this.showLoader && this._config.showLoader ? html`<div class="loader"></div>` : ''}
              ${this._config.showDate ? html`<div class="calDate">${this.getTodaysDate()}</div>` : ''}
            </div>`
          : ''}

        <div class="cal-eventContainer" style="padding-top: 4px;">${this.content}</div>
      </ha-card>
    `;
  }

  /**
   * Update the card content
   */
  async updateCard() {
    this.firstRun = false;

    // check if an update is needed
    if (!this.isUpdating) {
      if (!this.lastUpdateTime || dayjs().diff(this.lastUpdateTime, 'seconds') > this._config.refreshInterval) {
        this.showLoader = true;
        this.hiddenEvents = 0;
        this.isUpdating = true;
        try {
          const events = await this.getEvents();
          if (this._config.sortByStartTime) this.sortEvents(events);
          this.limitEvents(events);
          this.events = this.groupEvents(events);
        } catch (error) {
          console.log(error);
          this.errorMessage = html`${localize('errors.update_card')}
            <a href="https://marksie1988.github.io/atomic-calendar-revive/faq.html" target="${this._config.linkTarget}"
              >See Here</a
            >`;
          this.isUpdating = false;
          this.showLoader = false;
        }

        this.lastUpdateTime = dayjs();
        this.updateContent(this.events);
        this.isUpdating = false;
        this.showLoader = false;
        return;
      }
    }

    this.updateContent(this.events);
  }

  /**
   * Sort events by start time
   */
  sortEvents(events: EventClass[]) {
    // Sorts events by date and time and entity priority
    const entities = this._config.entities.map((entity) => entity.entity);
    events.sort((a, b) => {
      const entity_priority = entities.indexOf(a._config?.entity || '') - entities.indexOf(b._config?.entity || '');
      return a.startTime.diff(b.startTime) + entity_priority;
    });
  }

  /**
   * Limit the number of events pulled by the set limits
   */
  limitEvents(events: EventClass[]) {
    // Check maxEventCount and softLimit
    if (this.modeToggle == 'Event' && this._config.maxEventCount) {
      if (
        (!this._config.softLimit && this._config.maxEventCount < events.length) ||
        (this._config.softLimit && events.length > this._config.maxEventCount + this._config.softLimit)
      ) {
        this.hiddenEvents += events.length - this._config.maxEventCount;
        events.length = this._config.maxEventCount;
      }
    }
  }

  /**
   * Remove duplicate (similar) events by title and start/end times
   */
  removeDuplicates(events: EventClass[]): EventClass[] {
    const seen = new Set();
    return events.filter((event) => {
      const key = `${event.title}|${event.startTime.format('YYYY-MM-DDTHH:mm')}|${event.endTime.format(
        'YYYY-MM-DDTHH:mm',
      )}`;
      return seen.has(key) ? false : seen.add(key);
    });
  }

  /**
   * Group events by day and insert blank events if required
   */
  groupEvents(events: EventClass[]): CalendarDay[] {
    const { start, end } = this.dates();
    const days: CalendarDay[] = [];
    for (let day = start; day.isSameOrBefore(end, 'day'); day = day.add(1, 'day')) {
      let dayEvents = events.filter((event) => event.takesPlaceOnDay(day));
      if (this._config.hideDuplicates) dayEvents = this.removeDuplicates(dayEvents);

      if (dayEvents.length == 0 && this._config.showNoEventsForToday) {
        const emptyHassCalendarEvent: HassCalendarEvent = {
          start: { dateTime: day.endOf('day').format('YYYY-MM-DDTHH:mm:ssZ') },
          end: { dateTime: day.endOf('day').format('YYYY-MM-DDTHH:mm:ssZ') },
          summary: this._config.noEventText,
          htmlLink: 'https://calendar.google.com/calendar/r/day?sf=true',
        };
        const emptyEvent = new EventClass(emptyHassCalendarEvent, this._config, { entity: 'empty' });
        emptyEvent.isEmpty = true;
        dayEvents.push(emptyEvent);
      }
      if (dayEvents.length > 0) days.push(new CalendarDay(day, dayEvents));
    }

    return days;
  }

  /**
   * Toggles between Event and Calendar modes
   */
  handleToggle() {
    if (this._config.enableModeChange) {
      this.modeToggle = this.modeToggle == 'Event' ? 'Calendar' : 'Event';
      this.isUpdating = false;
      this.lastUpdateTime = undefined;
      this.requestUpdate();
    }
  }

  /**
   * Gets today day in the set format
   */
  getTodaysDate() {
    return dayjs().format(this._config.dateFormat);
  }

  /**
   * The height of your card. Home Assistant uses this to automatically
   * distribute all cards over the available columns.
   */
  getCardSize() {
    return this._config.entities.length + 1;
  }

  /**
   * Generate event icon HTML
   */
  getEventIcon(event: EventClass) {
    if (!this._config.showEventIcon || !event._config?.icon) return html``;

    const iconColor = event._config?.color || this._config.eventTitleColor;

    return html`<ha-icon class="event-icon" style="color:  ${iconColor};" icon="${event._config.icon}"></ha-icon>`;
  }

  /**
   * Generate Event Title (summary) HTML
   */
  getTitleHTML(event: EventClass) {
    const titleColor = event._config?.eventTitleColor || event._config?.color || this._config.eventTitleColor;
    const textDecoration: string = event.declined ? 'line-through' : 'none';
    const weight = this._config.displayStyle == 'simple' ? ';font-weight: 500' : '';
    const icon = this.getEventIcon(event);

    const title = html`
      <div class="event-title${event.isEventRunning ? ' running' : ''}" style="color: ${titleColor}${weight}">
        ${icon}
        <div style="text-decoration: ${textDecoration}">${event.title}</div>
      </div>
    `;

    if (this._config.disableEventLink || !event.link) return title;

    return html`
      <a href="${event.link}" style="text-decoration: none;" target="${this._config.linkTarget}"> ${title} </a>
    `;
  }

  /**
   * Get event description HTML
   */
  getDescHTML(event: EventClass) {
    if (!event.description) return null;

    const simple = this._config.displayStyle == 'simple';

    return html`<div class="event-description${simple ? ' simple' : ''}">${unsafeHTML(event.description)}</div>`;
  }

  /**
   * Format hours for display
   */
  formatHours(hours: string, simple?: boolean) {
    if (!simple) return hours;
    return hours.replace(/:00/g, '').replace(/ AM(?=.*AM$)| PM(?=.*PM$)/i, '');
  }

  /**
   * generate Hours HTML
   *
   */
  getHours(event: EventClass, forDay: dayjs.Dayjs) {
    const simple = this._config.displayStyle == 'simple';
    let hours = '';

    if (!simple) {
      // full day events, no hours set
      // 1. Multi-all-day event, ends later -> 'All day, end date'
      if (event.endTime.isAfter(forDay, 'day')) {
        hours = `${this._config.fullDayEventText}, ${this._config.untilText.toLowerCase()}	${this.getCurrDayAndMonth(
          event.endTime,
        )}`;
      }
      // 2. Multi-all-day or all-day event, ends today -> 'Add day'
      else if (event.isFullDayEvent) {
        hours = this._config.fullDayEventText;
      }
      // 3. Multi-day event, starts earlier and ends later -> 'until date'
      else if (event.startTime.isBefore(forDay, 'day') && event.startTime.isAfter(forDay, 'day')) {
        hours = `${this._config.untilText} ${this.getCurrDayAndMonth(event.endTime)}`;
      }
    }

    if (!event.isFullDayEvent) {
      // 4. Multi-day event, starts earlier ends today -> 'until hour'
      if (event.startTime.isBefore(forDay, 'day') && event.endTime.isSame(forDay, 'day')) {
        hours = `${this._config.untilText} ${this.formatHours(event.endTime.format('LT'), simple)}`;
      }
      // 5. Multi-day event, starts today ends later -> 'hour, until date'
      else if (event.startTime.isSame(forDay, 'day') && event.endTime.isAfter(forDay, 'day')) {
        hours = this.formatHours(event.startTime.format('LT'), simple);
        hours += `, ${this._config.untilText.toLowerCase()} ${this.getCurrDayAndMonth(event.endTime)}`;
      }
      // 6. Single-day event with time set -> 'hour - hour'
      else {
        hours = this.formatHours(`${event.startTime.format('LT')} – ${event.endTime.format('LT')}`, simple);
      }
    }

    return hours;
  }

  /**
   * Generate Event Relative Time HTML
   */
  getRelativeTime(event: EventClass) {
    const timeOffset = dayjs().utcOffset();
    const today = dayjs().add(timeOffset, 'minutes');

    if (!event.isEmpty && !event.startTime.isBefore(today, 'day')) {
      return `(${today.to(event.startTime.add(timeOffset, 'minutes'))})`;
    }

    return '';
  }

  /**
   * Generate Event Location link HTML
   */
  getLocationHTML(event: EventClass) {
    if (!event.location || !this._config.showLocation) return html``;

    const location = html`
      <div class="event-location">
        <ha-icon class="event-icon location" icon="mdi:map-marker"></ha-icon>${event.address}
      </div>
    `;
    if (this._config.disableLocationLink) return location;

    const eventLocation = event.location;
    const url = eventLocation.startsWith('http') ? eventLocation : 'https://maps.google.com/?q=' + eventLocation;
    return html`
      <div>
        <a href=${url} target="${this._config.linkTarget}" class="event-location-link"> ${location} </a>
      </div>
    `;
  }

  /**
   * Up day HTML
   */
  getEventsDayHTML(calendarDay: CalendarDay, showDate = true): TemplateResult {
    const simple = this._config.displayStyle == 'simple';

    const date = calendarDay.date;
    const isToday = date.isSame(dayjs(), 'day');
    let dateFormat: TemplateResult | string = '';
    if (simple) {
      dateFormat = date.format(`dddd, ${this._config.europeanDate ? 'D MMM' : 'MMM D'}`);
    } else {
      const weekday = this._config.showWeekDay && date.format('ddd');
      const month = this._config.showMonth && date.format('MMM');
      const month_day = this._config.europeanDate
        ? `${date.format('DD')}${month ? ' ' + month : ''}`
        : `${month ? month + ' ' : ''}${date.format('DD')}`;
      dateFormat = html`${weekday ? html`${weekday}<br />` : ''}${month_day}`;
    }

    const dayHTML = html`<div class="date${simple ? '-simple' : ''}${isToday ? ' today' : ''}">${dateFormat}</div>`;
    let markedNext = false;

    return html`
      <div class="day-wrapper${simple ? ' simple' : ''}">
        ${showDate ? dayHTML : null}
        <div class="day-events-wrapper">
          ${calendarDay.allEvents.map((event) => {
            let isNext = false;
            if (!markedNext && isToday && event.startTime.isAfter(dayjs())) {
              markedNext = true;
              isNext = true;
            }
            return this.getEventHTML(event, isNext, date);
          })}
        </div>
      </div>
    `;
  }

  /**
   * Get single event HTML
   */
  getEventHTML(event: EventClass, isNext: boolean, forDay: dayjs.Dayjs) {
    const simple = this._config.displayStyle == 'simple';
    const isToday = forDay.isSame(dayjs(), 'day');

    //show line before next event
    const currentEventLine =
      this._config.showCurrentEventLine && isNext ? html`<div class="current-event-bar"></div>` : ``;

    const calColor = event._config?.color || this._config.defaultCalColor;

    //show calendar name
    const eventCalName = event._config?.eventCalName
      ? html`
          <div class="event-cal-name" style="color: ${calColor};">
            <ha-icon icon="mdi:calendar" class="event-icon"></ha-icon>&nbsp;${event._config.eventCalName}
          </div>
        `
      : ``;

    const finishedEventsStyle =
      event.isEventFinished && this._config.dimFinishedEvents
        ? `opacity: ` + this._config.finishedEventOpacity + `; filter: ` + this._config.finishedEventFilter + `;`
        : ``;

    // Show the hours
    const hours = this._config.showHours ? this.getHours(event, forDay) : '';

    // Show the relative time
    const relativeTime = this._config.showRelativeTime ? this.getRelativeTime(event) : '';

    // Show the description
    const descHTML = this._config.showDescription ? this.getDescHTML(event) : null;

    //show current event progress bar
    let progressBar = html``;
    if (
      isToday &&
      ((event.isEventRunning && this._config.showFullDayProgress && event.isFullDayEvent) ||
        (event.isEventRunning && !event.isFullDayEvent && this._config.showProgressBar))
    ) {
      const eventDuration = event.endTime.diff(event.startTime, 'minutes');
      const eventProgress = dayjs().diff(event.startTime, 'minutes');
      const eventPercentProgress = (eventProgress * 100) / eventDuration / 100;
      progressBar = html`
        <mwc-linear-progress class="progress-bar" progress="${eventPercentProgress}"> </mwc-linear-progress>
      `;
    }

    // Simple display type color markers
    const markerColor: string = event._config?.color || this._config.eventTitleColor;
    const markers = !simple
      ? null
      : html`
          <div class="event-marker-wrapper-simple" style="${finishedEventsStyle}">
            <div class="event-marker-simple" style="background-color: ${markerColor}">&nbsp;</div>
          </div>
        `;

    return html`
      ${currentEventLine}
      <div class="event-wrapper" style="color: ${this._config.dayWrapperLineColor};">
        ${markers}
        <div class="event-details-wrapper${simple ? ' simple' : ''}" style="${finishedEventsStyle}">
          <div class="event-top">
            <div class="event-main${simple ? ' event-main-simple' : ''}">
              ${this.getTitleHTML(event)}
              <div class="event-hours">${hours} ${relativeTime}</div>
            </div>
            <div class="event-right">${eventCalName} ${this.getLocationHTML(event)}</div>
          </div>
          ${descHTML} ${progressBar}
        </div>
      </div>
    `;
  }

  /**
   * Update card content
   */
  updateContent(days: CalendarDay[]) {
    if (this.modeToggle == 'Event') {
      this.updateEventsHTML(days);
    } else {
      this.updateCalendarHTML(days);
    }
  }

  /**
   * Update content with events HTML
   */
  updateEventsHTML(days: CalendarDay[]) {
    const simple = this._config.displayStyle == 'simple';

    // TODO some more tests end error message
    if (!days) {
      this.content = this.errorMessage;
      return;
    }

    // TODO write something if no events
    if (days.length === 0 && this._config.maxDaysToShow <= 1) {
      this.content = this._config.noEventText;
      return;
    } else if (days.length === 0) {
      this.content = this._config.noEventsForNextDaysText;
      return;
    }

    //loop through days
    const htmlDays = days.map((day) => this.getEventsDayHTML(day));

    const eventNotice = this._config.showHiddenText
      ? this.hiddenEvents > 0
        ? this.hiddenEvents + ' ' + this._config.hiddenEventText
        : ''
      : '';

    this.content = html`
      <div class="events-wrapper${simple ? ' simple' : ''}${this._config.horizontal ? ' horizontal' : ''}">
        ${htmlDays}
        <span class="hidden-events${simple ? ' simple' : ''}">${eventNotice}</span>
      </div>
    `;
  }

  /**
   * Remove year from dayjs .format('LL')
   */
  getCurrDayAndMonth(locale) {
    const today = locale.format('LL');
    return today
      .replace(locale.format('YYYY'), '') // remove year
      .replace(/\s\s+/g, ' ') // remove double spaces, if any
      .trim() // remove spaces from the start and the end
      .replace(/[??]\./, '') // remove year letter from RU/UK locales
      .replace(/de$/, '') // remove year prefix from PT
      .replace(/b\.$/, '') // remove year prefix from SE
      .trim() // remove spaces from the start and the end
      .replace(/,$/g, ''); // remove comma from the end
  }

  /**
   * Get calendar events from HA
   */
  async getEvents(): Promise<EventClass[]> {
    const calendarApiCalls: Promise<HassCalendarEvent[]>[] = this.entityUrls().map((url) =>
      this.hass.callApi('GET', url),
    );

    // call to API for events
    try {
      return await Promise.all(calendarApiCalls).then((calendars) => {
        const singleEvents: EventClass[] = [];
        calendars.forEach((calendar, calendarIndex: number) => {
          const entity = this._config.entities[calendarIndex];

          calendar.forEach((singleEvent) => {
            const singleAPIEvent = new EventClass(singleEvent, this._config, entity);
            if (singleAPIEvent.valid) singleEvents.push(singleAPIEvent);
          });
        });

        return singleEvents;
      });
    } catch (error) {
      this.showLoader = false;
      this.isUpdating = false;
      throw error;
    }
  }

  /**
   * Start and end dates for the calendar mode
   */
  calendarDates() {
    const firstDay = this.selectedMonth.startOf('month');
    const dayOfWeekNumber = firstDay.day();
    const daysToPrefix =
      this._config.firstDayOfWeek <= dayOfWeekNumber
        ? dayOfWeekNumber - this._config.firstDayOfWeek
        : 7 + dayOfWeekNumber - this._config.firstDayOfWeek;
    const startDay = firstDay.subtract(daysToPrefix, 'day');

    return {
      start: startDay,
      end: startDay.add(42, 'day'),
    };
  }

  /**
   * Start and end dates for the events mode
   */
  eventsDates(maxDaysToShow?: number) {
    const daysToAdd = Math.max((maxDaysToShow || this._config.maxDaysToShow) - 1, 0);
    const start = dayjs().startOf('day').add(this._config.startDaysAhead, 'day');
    const end = dayjs()
      .endOf('day')
      .add(this._config.startDaysAhead + daysToAdd, 'day');

    return { start, end };
  }

  /**
   * Converts the start and end dates to UTC
   */
  toUtcDates(dates: { start: dayjs.Dayjs; end: dayjs.Dayjs }) {
    const timeOffset = dayjs().utcOffset();

    return {
      start: dates.start.subtract(timeOffset, 'minutes'),
      end: dates.end.subtract(timeOffset, 'minutes'),
    };
  }

  /**
   * Start and end dates for the current mode
   */
  dates(maxDaysToShow?: number) {
    return this.modeToggle == 'Event' ? this.eventsDates(maxDaysToShow) : this.calendarDates();
  }

  /**
   * UTC start and end dates for the current mode
   */
  utcDates(maxDaysToShow?: number) {
    return this.toUtcDates(this.dates(maxDaysToShow));
  }

  /**
   * Change month in calendar mode
   */
  handleMonthChange(adjustment: number) {
    this.selectedMonth = this.selectedMonth.add(adjustment, 'month');
    this.clickedDate = this.selectedMonth.isSame(dayjs(), 'month') ? dayjs().startOf('day') : this.selectedMonth;
    this.isUpdating = false;
    this.lastUpdateTime = undefined;
    this.requestUpdate();
  }

  /**
   * URLs for fetching calendars based on the current mode
   */
  entityUrls() {
    return this._config.entities.map((entity) => {
      const { start, end } = this.utcDates(entity.maxDaysToShow);
      const startISO = start.format('YYYY-MM-DDTHH:mm:ss[Z]');
      const endISO = end.format('YYYY-MM-DDTHH:mm:ss[Z]');
      return `calendars/${entity.entity}?start=${startISO}&end=${endISO}`;
    });
  }

  /**
   * The events summary for calendar mode
   */
  getEventSummaryHTML(): TemplateResult | null {
    let day = this.events.find((day) => day.date.isSame(this.clickedDate, 'day'));
    if (!day) day = this.events.find((day) => day.date.isSame(dayjs(), 'day'));
    if (!day) return null;

    return this.getEventsDayHTML(day, false);
  }

  /**
   * Gets the entity icons for a calendar day
   */
  getCalendarIconsHTML(day) {
    const entities: CalendarEntity[] = [];
    const icons: TemplateResult[] = [];

    day.allEvents.forEach((event) => {
      if (!entities.includes(event._config)) entities.push(event._config);
    });

    this._config.entities.forEach((entity) => {
      if (!entities.includes(entity)) return;
      icons.push(html`
        <ha-icon
          class="cal-icon"
          style="color: ${entity.color || 'var(--primary-color)'};"
          .icon=${entity.icon || 'mdi:circle'}
        >
        </ha-icon>
      `);
    });

    return icons;
  }

  /**
   * Header for calendar mode
   */
  getCalendarHeaderHTML() {
    return html`
      <div class="button-wrapper">
        <ha-icon-button @click="${() => this.handleMonthChange(-1)}" title=${this.hass.localize('ui.common.previous')}>
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </ha-icon-button>
        <ha-icon-button @click="${() => this.handleMonthChange(1)}" title=${this.hass.localize('ui.common.next')}>
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </ha-icon-button>
      </div>
      <span class="cal-header-date" style="color: ${this._config.calDateColor};">
        ${this.selectedMonth.format('MMMM')} ${this.selectedMonth.format('YYYY')}
      </span>
    `;
  }

  /**
   * Calendar link button for the calendar mode header
   */
  getCalendarLink() {
    if (this._config.disableCalLink) return null;

    return html`
      <div>
        <ha-icon-button
          label="Open Google Calendar"
          onClick="window.open('https://calendar.google.com/calendar/r/month/${this.selectedMonth.format(
            'YYYY',
          )}/${this.selectedMonth.format('MM')}/1'), '${this._config.linkTarget}'"
        >
          <ha-icon icon="mdi:calendar"></ha-icon>
        </ha-icon-button>
      </div>
    `;
  }

  /**
   * Update the clicked date
   */
  handleDayClicked(date: dayjs.Dayjs) {
    this.clickedDate = date;
    this.requestUpdate();
  }

  /**
   * Get HTML for all calendar days
   */
  getCalendarDaysHTML(days: CalendarDay[]) {
    if (!days || days.length == 0) return null;

    const month = this.selectedMonth;
    const dayCount = this._config.showLastCalendarWeek || days[35].date.isSame(month, 'month') ? 42 : 35;

    const weeks: TemplateResult[] = [];
    let dayIndex = 0;

    while (dayIndex < dayCount) {
      const daysHTML: TemplateResult[] = [];
      let weekday = 0;

      while (weekday < 7) {
        const day = days[dayIndex];
        const date = day.date;
        const opacity = date.isSame(month, 'month') ? '' : `opacity: .35;`;
        const today = date.isSame(dayjs(), 'day') ? ' today' : '';
        const backgroundColor = date.isSame(this.clickedDate, 'day')
          ? `background-color: ${this._config.calActiveEventBackgroundColor};`
          : date.isoWeekday() == 6
          ? `background-color: ${this._config.calEventSatColor};`
          : date.isoWeekday() == 7
          ? `background-color: ${this._config.calEventSunColor};`
          : '';

        daysHTML.push(html`
          <div class="cal-day" @click="${() => this.handleDayClicked(day.date)}">
            <div class="cal-day-content" style="${opacity}${backgroundColor}">
              <div class="cal-day-date${today}"><div>${date.date()}</div></div>
              <div class="cal-icons">${this.getCalendarIconsHTML(day)}</div>
            </div>
          </div>
        `);

        dayIndex += 1;
        weekday += 1;
      }

      weeks.push(html` <div class="cal-row">${daysHTML}</div> `);
    }

    return weeks;
  }

  /**
   * Update content with calendar HTML
   */
  updateCalendarHTML(days: CalendarDay[]) {
    const weekDays = dayjs.weekdaysMin(true);
    const dayNamesHTML = weekDays.map((day) => html`<div class="cal-day cal-day-header">${day}</div>`);

    this.content = html`
      <div class="cal-wrapper">
        <div class="cal-header">${this.getCalendarHeaderHTML()}${this.getCalendarLink()}</div>
        <div class="cal">
          <div class="cal-row">${dayNamesHTML}</div>
          ${this.getCalendarDaysHTML(days)}
        </div>
        <div class="cal-event-summary">${this.getEventSummaryHTML()}</div>
      </div>
    `;
  }
}

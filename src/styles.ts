import { css } from 'lit';

export const styles = css`
  .cal-card {
    cursor: default;
    padding: 16px;
    height: var(--atomic-cal-card-height);
    overflow: auto;
  }

  .cal-name {
    font-size: var(--paper-font-headline_-_font-size);
    color: var(--atomic-cal-name-color);
    padding: 4px 8px 12px 0px;
    line-height: 40px;
    cursor: default;
    float: left;
  }

  .cal-nameContainer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    vertical-align: middle;
    align-items: center;
    margin: 0 0 0 2px;
  }

  .calDate {
    font-size: var(--paper-font-headline_-_font-size);
    font-size: 1.3rem;
    font-weight: 400;
    color: var(--primary-text-color);
    padding: 4px 0 12px 0;
    line-height: 40px;
    cursor: default;
    float: right;
    opacity: 0.75;
  }

  .events-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-content: flex-start;
    align-items: stretch;
    gap: 8px;
    width: 100%;
  }

  .events-wrapper.simple {
    gap: 16px;
  }

  .horizontal {
    flex-direction: row;
  }

  .vertical {
    flex-direction: column;
  }

  .day-wrapper {
    /* padding: 2px 0 4px 0; */
    padding-top: 8px;
    border-top: 1px solid;
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-content: flex-start;
    align-items: stretch;
    gap: 4px;
  }

  .day-wrapper:first-child {
    padding-top: 4px;
    border-top: none;
  }

  .day-wrapper.simple {
    padding-top: 0;
    border-top: none;
    flex-direction: column;
  }

  .day-events-wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-content: flex-start;
    align-items: stretch;
    gap: 8px;
  }

  .date {
    width: 40px;
    text-align: center;
    font-size: 0.9em;
    padding: 0 10px 0 8px;
  }

  .date-simple {
    color: var(--secondary-text-color);
    font-weight: 500;
    text-transform: uppercase;
    font-size: 0.9em;
  }

  .date-simple.today {
    color: var(--error-color);
  }

  .event-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-content: flex-start;
    align-items: stretch;
    gap: 0.285714em;
  }

  .current-event-bar {
    width: 100%;
    height: 0;
    border-top: 1px solid var(--atomic-cal-event-bar-color);
    user-select: none;
    position: relative;
  }

  .current-event-bar::after {
    background-color: var(--atomic-cal-event-bar-color);
    content: '\\a0';
    overflow: hidden;
    width: 0.571429rem;
    height: 0.571429rem;
    border-radius: 50%;
    position: absolute;
    transform: translate(-25%, calc(-50% - 0.5px));
  }

  .event-details-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-content: flex-start;
    align-items: stretch;
    gap: 0;
  }

  .event-details-wrapper.simple {
    line-height: normal;
  }

  .event-top {
    display: flex;
    justify-content: space-between;
    gap: 4px;
    font-size: 1rem;
  }

  .event-icon {
    --mdc-icon-size: 1em !important;
    position: relative;
    top: -0.1em;
  }

  .event-title {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-content: flex-start;
    align-items: flex-start;
    gap: 0.25em;
    font-size: calc(var(--atomic-cal-event-title-size) / 100) em;
    user-select: text;
    position: relative;
  }

  .event-title.running {
    font-size: calc(var(--atomic-cal-event-title-size) / 100) em;
  }

  .event-hours {
    color: var(--atomic-cal-time-color);
    font-size: calc(var(--atomic-cal-time-size) / 100) em !important;
    float: left;
  }

  .event-right {
    text-align: right;
    vertical-align: top;
    user-select: text;
  }

  .event-location {
    color: var(--atomic-cal-location-link-color);
    font-size: calc(var(--atomic-cal-location-text-size) / 100) em;
  }

  .event-icon.location {
    color: var(--atomic-cal-location-icon-color);
  }

  .event-location-link {
    text-decoration: none;
  }

  .event-cal-name {
    color: var(--atomic-cal-event-cal-name-color);
    font-size: calc(var(--atomic-cal-event-cal-name-size) / 100) em;
  }

  .event-description {
    color: var(--atomic-cal-desc-color);
    font-size: calc(var(--atomic-cal-desc-size) / 100) em;
    user-select: text;
    padding: 0 5px 0 5px;
  }

  .event-description.simple {
    padding: 4px 0 0 0;
  }

  .event-description > a {
    color: var(--primary-color);
  }

  .relativeTime {
    color: var(--atomic-cal-time-color);
    font-size: calc(var(--atomic-cal-time-size) / 100) em !important;
    float: right;
    padding-left: 5px;
  }

  .event-marker-wrapper-simple {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-content: stretch;
    gap: 4px;
  }

  .event-marker-simple {
    background-color: var(--primary-color);
    width: 4px;
    height: 100%;
    overflow: hidden;
    border-radius: 2px;
  }

  .progress-bar {
    --mdc-theme-primary: var(--atomic-cal-progress-bar-color);
    --mdc-linear-progress-buffer-color: var(--atomic-progress-bar-buffer-color);
    padding-top: 2px;
  }

  mwc-linear-progress {
    width: 100%;
    margin: auto;
  }

  .hidden-events {
    color: var(--primary-text-color);
  }

  .hidden-events.simple {
    color: var(--secondary-text-color);
  }

  .cal-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-content: flex-start;
    align-items: stretch;
    gap: 8px;
  }

  .cal-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    --ha-icon-display: block;
  }

  .button-wrapper {
    display: flex;
  }

  ha-icon-button {
    color: var(--primary-color);
    --mdc-icon-button-size: var(--button-toggle-size, 36px);
    --mdc-icon-size: var(--button-toggle-icon-size, 20px);
    border: 1px solid var(--primary-color);
  }

  ha-icon-button:first-child {
    border-radius: 4px 0 0 4px;
    border-right-style: none;
  }

  ha-icon-button:last-child {
    border-radius: 0 4px 4px 0;
  }

  /* Needs to be after first-child and last-child */
  ha-icon-button:only-child {
    border-radius: 4px;
    border-right-style: solid;
  }

  .cal-header-date {
    color: var(--atomic-cal-cal-date-color);
    flex-grow: 1;
    align-self: center;
    font-size: 1.3rem;
    font-weight: 500;
  }

  .cal {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-content: flex-start;
    align-items: stretch;
  }

  .cal-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: center;
    align-items: stretch;
    border-color: var(--atomic-cal-cal-grid-color);
    border-width: 1px;
    border-left-style: solid;
    border-right-style: solid;
    border-bottom-style: solid;
    flex: 1 1 40px;
  }

  .cal-row:first-child {
    border-top-style: solid;
    flex: 0 0 auto;
  }

  .cal-day {
    color: var(--primary-text-color);
    text-align: center;
    flex: 1 1 40px;
    font-size: 0.95em;
  }

  .cal-day:not(:last-child) {
    border-right: 1px solid var(--atomic-cal-cal-grid-color);
  }

  .cal-day-header {
    color: var(--atomic-cal-cal-weekday-color);
    text-transform: uppercase;
    font-size: 0.7em;
  }

  .cal-day-content {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 4px;
  }

  .cal-day-date > div {
    width: 1.5em;
    height: 1.5em;
    margin: 0 auto 4px auto;
    vertical-align: middle;
  }

  .cal-day-date.today > div {
    background-color: var(--primary-color);
    border-radius: 50%;
  }

  .cal-icons {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    align-content: center;
    gap: 4px;
    min-height: 24px;
  }

  .cal-icon {
    --mdc-icon-size: 10px;
    --ha-icon-display: block;
  }

  .cal-event-summary {
    font-size: 0.9em;
  }

  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid grey;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    animation: spin 2s linear infinite;
    float: left;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

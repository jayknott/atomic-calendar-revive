import { LitElement, html, TemplateResult } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';

import { DISPLAY_STYLE_CATALOG } from './const';
import { localize } from './localize/localize';
import { style } from './style-editor';
import {
  atomicCardConfig,
  ConfigCategory,
  ConfigCategoryCatalog,
  ConfigCategorySettings,
  ConfigEventTarget,
  ConfigProperty,
  DISPLAY_STYLES,
  FieldType,
  LINK_TARGETS,
  MODES,
} from './types';

const options: ConfigCategoryCatalog = {
  required: {
    icon: 'tune',
    properties: [
      {
        name: 'display',
        title: 'Entities and their options must be configured through code editor',
        fieldType: 'content',
      },
    ],
  },
  main: {
    icon: 'eye-settings',
    properties: [
      { name: 'name' },
      { name: 'firstDayOfWeek', fieldType: 'number' },
      { name: 'maxDaysToShow', fieldType: 'number' },
      { name: 'refreshInterval', fieldType: 'number' },
      { name: 'dateFormat' },
      { name: 'hoursFormat' },
      {
        name: 'defaultMode',
        fieldType: 'select',
        options: MODES.map((item) => ({ value: item })),
      },
      {
        name: 'displayStyle',
        fieldType: 'select',
        options: DISPLAY_STYLES.map((item) => ({ value: item })),
      },
      {
        name: 'linkTarget',
        fieldType: 'select',
        options: LINK_TARGETS.map((item) => ({ value: item })),
      },
      { name: 'cardHeight' },
      { name: 'break', fieldType: 'break' },
      { name: 'showLoader', fieldType: 'boolean' },
      { name: 'showDate', fieldType: 'boolean' },
      { name: 'showDeclined', fieldType: 'boolean' },
      { name: 'sortByStartTime', fieldType: 'boolean' },
      { name: 'hideFinishedEvents', fieldType: 'boolean' },
      { name: 'showLocation', fieldType: 'boolean' },
      { name: 'showRelativeTime', fieldType: 'boolean' },
      { name: 'hideDuplicates', fieldType: 'boolean' },
    ],
  },
  event: {
    icon: 'calendar-check',
    properties: [
      { name: 'untilText' },
      { name: 'fullDayEventText' },
      { name: 'noEventsForNextDaysText' },
      { name: 'noEventText' },
      { name: 'hiddenEventText' },
      { name: 'break', fieldType: 'break' },
      { name: 'showCurrentEventLine', fieldType: 'boolean' },
      { name: 'showProgressBar', fieldType: 'boolean' },
      { name: 'showMonth', fieldType: 'boolean' },
      { name: 'showWeekDay', fieldType: 'boolean' },
      { name: 'showDescription', fieldType: 'boolean' },
      { name: 'disableEventLink', fieldType: 'boolean' },
      { name: 'disableLocationLink', fieldType: 'boolean' },
      { name: 'showNoEventsForToday', fieldType: 'boolean' },
      { name: 'showFullDayProgress', fieldType: 'boolean' },
      { name: 'showEventIcon', fieldType: 'boolean' },
      { name: 'showHiddenText', fieldType: 'boolean' },
      { name: 'horizontal', fieldType: 'boolean' },
    ],
  },
  calendar: {
    icon: 'calendar-month-outline',
    properties: [
      { name: 'showLastCalendarWeek', fieldType: 'boolean' },
      { name: 'disableCalEventLink', fieldType: 'boolean' },
      { name: 'disableCalLocationLink', fieldType: 'boolean' },
      { name: 'disableCalLink', fieldType: 'boolean' },
    ],
  },
  appearance: {
    icon: 'palette',
    properties: [{ name: 'dimFinishedEvents', fieldType: 'boolean' }],
  },
};

@customElement('atomic-calendar-revive-jayknott-editor')
export class AtomicCalendarReviveEditor2 extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config!: atomicCardConfig;
  @state() private _helpers?: any;
  @state() private _openCategory?: ConfigCategory;
  private _initialized = false;

  constructor() {
    super();
    this._openCategory = 'required';
  }

  static get styles() {
    return style;
  }

  public setConfig(config: atomicCardConfig) {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate() {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  default<T>(value: T | null | undefined, default_value: T): T {
    return value == null || (value as unknown) === '' ? default_value : value;
  }

  getPropertyHTML(property: ConfigProperty, configCategory: ConfigCategory) {
    const onChange = (event: Event) => this._valueChanged(event, property);
    const title = property.title || localize(`${configCategory}.fields.${property.name}`);
    let value: string | number | boolean | undefined | null;
    const defaultConfig = DISPLAY_STYLE_CATALOG[this._config['displayStyle'] || 'standard'].defaultConfig;

    switch (property.fieldType) {
      case 'boolean':
        value = this.default(this._config[property.name], defaultConfig[property.name]) != false;
        return html`
          <div>
            <ha-switch .checked=${value} @change=${onChange}></ha-switch>
            <label class="mdc-label">${title}</label>
          </div>
        `;
      case 'break':
        return html`<div class="break"></div>`;
      case 'content':
        return html`<div class="content">${title}</div>`;
      case 'select':
        value = this.default(this._config[property.name], defaultConfig[property.name]);
        return html`
          <paper-dropdown-menu label="${title}" @value-changed=${onChange}>
            <paper-listbox slot="dropdown-content" attr-for-selected="value" .selected="${value}">
              ${property.options?.map(
                (option) =>
                  html`<paper-item value="${option.value || ''}">${option.title || option.value}</paper-item>`,
              )}
            </paper-listbox>
          </paper-dropdown-menu>
        `;
      default:
        value = this.default(this._config[property.name], defaultConfig[property.name]);
        return html`
          <paper-input
            label="${title}"
            type="${property.fieldType || 'text'}"
            .value=${value}
            @value-changed=${onChange}
          ></paper-input>
        `;
    }
  }

  protected render(): TemplateResult | TemplateResult[] {
    if (!this.hass || !this._helpers || !this._config) {
      return html``;
    }

    // The climate more-info has ha-switch and paper-dropdown-menu elements that are lazy loaded unless explicitly done here
    this._helpers.importMoreInfoControl('climate');

    // You can restrict on domain type
    const optionsHTML: TemplateResult[] = [];

    (Object.keys(options) as ConfigCategory[]).forEach((configCategory) => {
      const optionSettings: ConfigCategorySettings = options[configCategory];

      optionsHTML.push(html`
        <div class="option" @click=${() => this._toggleCategory(configCategory)}>
          <div class="row">
            <ha-icon .icon=${`mdi:${optionSettings.icon}`}></ha-icon>
            <div class="title">${localize(`${configCategory}.name`)}</div>
          </div>
          <div class="secondary">${localize(`${configCategory}.secondary`)}</div>
        </div>
      `);

      optionsHTML.push(
        html`
          <div class="values${this._openCategory == configCategory ? '' : ' collapsed'}">
            ${optionSettings.properties.map((property) => this.getPropertyHTML(property, configCategory))}
          </div>
        `,
      );
    });

    return optionsHTML;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await window.loadCardHelpers();
  }

  private _toggleCategory(category: ConfigCategory) {
    this._openCategory = this._openCategory == category ? undefined : category;
  }

  parseType(target: ConfigEventTarget, fieldType?: FieldType | null) {
    switch (fieldType || 'text') {
      case 'number':
        return parseInt(target.value);
      case 'boolean':
        return target.checked;
      default:
        return target.value;
    }
  }

  private _valueChanged(event: Event, property: ConfigProperty) {
    if (!this._config || !this.hass) return;

    const target = event.target as ConfigEventTarget;
    const value = this.parseType(target, property.fieldType);
    const defaultConfig = DISPLAY_STYLE_CATALOG[this._config['displayStyle'] || 'standard'].defaultConfig;

    if (this._config[property.name] === value) return;

    const config = { ...this._config };

    if (value == null || value === '' || value == defaultConfig[property.name]) {
      delete config[property.name];
    } else {
      config[property.name] = value;
    }

    this._config = config;

    fireEvent(this, 'config-changed', { config: this._config });
  }
}

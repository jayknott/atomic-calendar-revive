import { css } from 'lit';

export const style = css`
  .option {
    padding: 4px 0px;
    cursor: pointer;
  }
  .row {
    display: flex;
    margin-bottom: -14px;
    pointer-events: none;
  }
  .title {
    padding-left: 16px;
    margin-top: -6px;
    pointer-events: none;
  }
  .secondary {
    padding-left: 40px;
    color: var(--secondary-text-color);
    pointer-events: none;
  }
  .values {
    padding: 16px;
    background: var(--secondary-background-color);
    display: flex;
    flex-wrap: wrap;
    column-gap: 16px;
  }
  .values.collapsed {
    display: none;
  }
  .values > * {
    width: 300px;
  }
  .values > .break {
    flex-basis: 100%;
    height: 0;
  }
  .values > .content {
    flex-basis: 100%;
  }
  ha-switch {
    padding-bottom: 8px;
    padding-top: 16px;
  }
  .mdc-label {
    margin-left: 12px;
    vertical-align: text-bottom;
  }
`;

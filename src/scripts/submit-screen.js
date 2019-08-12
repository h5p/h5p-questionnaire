import './styles/submit-screen.css';

import Utils from './utils';

export default class SubmitScreen extends H5P.EventDispatcher {
  constructor({title, subtitle, backLabel, submitLabel}) {
    super();

    this.wrapper = Utils.createDiv({
      className: 'h5p-questionnaire-submit-screen hide'
    });
    this.wrapper.setAttribute('tabindex', '-1');

    // Create title
    this.wrapper.appendChild(Utils.createDiv({
      className: 'h5p-questionnaire-submit-screen-title',
      innerHTML: title
    }));

    // Create subtitle
    this.wrapper.appendChild(Utils.createDiv({
      className: 'h5p-questionnaire-submit-screen-subtitle',
      innerHTML: subtitle
    }));

    // Add buttons
    this.wrapper.appendChild(Utils.createButton(backLabel, 'previous', this));
    this.wrapper.appendChild(Utils.createButton(submitLabel, 'submit', this));

    /**
     * Show submit screen
     */
    this.show = function () {
      this.wrapper.classList.remove('hide');
      this.wrapper.focus();
    };

    /**
     * Hide submit screen
     */
    this.hide = function () {
      this.wrapper.classList.add('hide');
    };
  }

  /**
   * Attach to parent
   *
   * @param {HTMLElement} container
   */
  attachTo(container) {
    container.appendChild(this.wrapper);
  }
}

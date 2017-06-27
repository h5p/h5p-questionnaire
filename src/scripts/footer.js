import './styles/footer.css';

import Utils from './utils';

export default class Footer extends H5P.EventDispatcher {
  constructor(buttonLabels) {
    super();

    this.footerWrapper = document.createElement('div');
    this.footerWrapper.className = 'h5p-questionnaire-footer';

    this.footerWrapper.appendChild(this.createButton(buttonLabels.prevLabel, 'previous'));
    this.footerWrapper.appendChild(this.createButton(buttonLabels.nextLabel, 'next'));
    this.footerWrapper.appendChild(this.createButton(buttonLabels.continueLabel, 'next', 'continue'));
  }

  /**
   * Set which forward button should be displayed (submit, next or continue)
   * @param {string} type 'next' or 'continue'
   */
  setForwardNavigationButton(type) {
    this.trigger('disable-next');
    this.trigger('disable-continue');
    this.trigger('enable-' + type);
  }

  /**
   * Handle creating submit answer button
   *
   * @param {string} buttonText Button text
   * @param {string} type Used as classname and eventname (when clicked)
   * @param {string} eventName Name of the event used to disable/enable this button
   *
   * @return {HTMLElement} Submit button
   */
  createButton(buttonText, type, eventName) {
    const button = Utils.createButton(buttonText, type, this);

    this.on('enable-' + (eventName || type), () => {
      button.classList.remove('disable');
    });
    this.on('disable-' + (eventName || type), () => {
      button.classList.add('disable');
    });

    return button;
  }

  /**
   * Toggle visibility
   * @param {boolean} [hide=true]
   */
  hide(hide = true) {
    this.footerWrapper.classList[hide ? 'add' : 'remove']('hide');
  }

  /**
   * Attach to container
   * @param {HTMLElement} element The container to attach to
   */
  attachTo(element) {
    element.appendChild(this.footerWrapper);
  }
}

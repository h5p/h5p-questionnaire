import './styles/footer.css';

export default class Footer extends H5P.EventDispatcher {
  constructor(buttonLabels) {
    super();

    this.footerWrapper = document.createElement('div');
    this.footerWrapper.className = 'h5p-questionnaire-footer';

    const submitButton = this.createFooterButton(buttonLabels.submitLabel);
    submitButton.classList.add('h5p-questionnaire-footer-submit');
    submitButton.addEventListener('click', () => {
      this.trigger('submit');
    });
    this.on('enable-submit', () => {
      submitButton.classList.remove('disable');
    });
    this.on('disable-submit', () => {
      submitButton.classList.add('disable');
    });

    const nextButton = this.createFooterButton(buttonLabels.nextLabel);
    nextButton.classList.add('h5p-questionnaire-footer-next');
    nextButton.addEventListener('click', () => {
      this.trigger('next');
    });
    this.on('enable-next', () => {
      nextButton.classList.remove('disable');
    });
    this.on('disable-next', () => {
      nextButton.classList.add('disable');
    });

    const continueButton = this.createFooterButton(buttonLabels.continueLabel);
    continueButton.classList.add('h5p-questionnaire-footer-next');
    continueButton.addEventListener('click', () => {
      this.trigger('next');
    });
    this.on('enable-continue', () => {
      continueButton.classList.remove('disable');
    });
    this.on('disable-continue', () => {
      continueButton.classList.add('disable');
    });

    const previousButton = this.createFooterButton(buttonLabels.prevLabel);
    previousButton.classList.add('h5p-questionnaire-footer-previous');
    previousButton.addEventListener('click', () => {
      this.trigger('prev');
    });
    this.on('enable-prev', () => {
      previousButton.classList.remove('disable');
    });
    this.on('disable-prev', () => {
      previousButton.classList.add('disable');
    });

    this.footerWrapper.appendChild(previousButton);
    this.footerWrapper.appendChild(continueButton);
    this.footerWrapper.appendChild(nextButton);
    this.footerWrapper.appendChild(submitButton);
  }

  /**
   * Set which forward button should be displayed (submit, next or continue)
   * @param {string} type 'submit', 'next' or 'continue'
   */
  setForwardNavigationButton(type) {
    this.trigger('disable-submit');
    this.trigger('disable-next');
    this.trigger('disable-continue');
    this.trigger('enable-' + type);
  }

  /**
   * Disable navigation
   */
  disableNavigation() {
    this.trigger('disable-submit');
    this.trigger('disable-next');
    this.trigger('disable-continue');
    this.trigger('disable-prev');
  }

  /**
   * Handle creating submit answer button
   * @param {string} buttonText Button text
   * @return {Element} Submit button
   */
  createFooterButton(buttonText) {
    const footerButton = document.createElement('button');
    footerButton.className = 'h5p-questionnaire-footer-button';
    footerButton.type = 'button';
    footerButton.textContent = buttonText;

    return footerButton;
  }

  remove() {
    this.footerWrapper.parentNode.removeChild(this.footerWrapper);
  }

  attachTo(element) {
    element.appendChild(this.footerWrapper);
  }
}

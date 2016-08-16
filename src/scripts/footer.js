import './styles/footer.css';

export default class Footer extends H5P.EventDispatcher {
  constructor(buttonLabels) {
    super();

    const {
      prevLabel = "Previous",
      nextLabel = "Next",
      submitLabel = "Submit"
    } = buttonLabels;

    this.footerWrapper = document.createElement('div');
    this.footerWrapper.className = 'h5p-questionnaire-footer';

    const submitButton = this.createFooterButton(submitLabel);
    submitButton.classList.add('h5p-questionnaire-footer-submit');
    submitButton.addEventListener('click', () => {
      this.trigger('submit');
    });
    this.on('enableSubmit', () => {
      submitButton.classList.remove('disable');
    });
    this.on('disableSubmit', () => {
      submitButton.classList.add('disable');
    });

    const nextButton = this.createFooterButton(nextLabel);
    nextButton.classList.add('h5p-questionnaire-footer-next');
    nextButton.addEventListener('click', () => {
      this.trigger('next');
    });
    this.on('enableNext', () => {
      nextButton.classList.remove('disable');
    });
    this.on('disableNext', () => {
      nextButton.classList.add('disable');
    });

    const previousButton = this.createFooterButton(prevLabel);
    previousButton.classList.add('h5p-questionnaire-footer-previous');
    previousButton.addEventListener('click', () => {
      this.trigger('prev');
    });
    this.on('enablePrev', () => {
      previousButton.classList.remove('disable');
    });
    this.on('disablePrev', () => {
      previousButton.classList.add('disable');
    });

    this.footerWrapper.appendChild(previousButton);
    this.footerWrapper.appendChild(nextButton);
    this.footerWrapper.appendChild(submitButton);
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

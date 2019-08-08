import './styles/required-message.css';

export default class RequiredMessage extends H5P.EventDispatcher {
  constructor(uiElements) {
    super();

    this.requiredElement = document.createElement('div');
    this.requiredElement.classList.add('h5p-questionnaire-choice-required');
    this.requiredElement.classList.add('hide');

    this.requiredMessage = document.createElement('div');
    this.requiredMessage.innerHTML = uiElements.requiredMessage;
    this.requiredMessage.className = 'h5p-questionnaire-choice-required-message';
    this.requiredMessage.setAttribute('role', 'alert');

    const exitButton = document.createElement('button');
    exitButton.className = 'h5p-questionnaire-choice-required-exit';
    exitButton.setAttribute('aria-label', uiElements.accessibility.requiredTextExitLabel);
    exitButton.addEventListener('click', () => {
      this.hideMessage();
    });

    this.on('hideMessage', () => {
      this.hideMessage();
    });

    this.on('showMessage', () => {
      this.showMessage();
    });

    this.requiredElement.appendChild(this.requiredMessage);
    this.requiredElement.appendChild(exitButton);
  }

  showMessage() {
    this.requiredElement.classList.remove('hide');
  }

  hideMessage() {
    this.requiredElement.classList.add('hide');
  }

  attachTo(element) {
    element.appendChild(this.requiredElement);
  }
}

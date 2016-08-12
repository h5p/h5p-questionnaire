import './styles/success-screen.css';

export default class SuccessScreen {
  constructor({ successMessage }) {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'h5p-questionnaire-success';
    this.wrapper.classList.add('hide');
    this.wrapper.textContent = successMessage;
  }

  show() {
    this.wrapper.classList.remove('hide');
  }

  attachTo(container) {
    container.appendChild(this.wrapper);
  }
}

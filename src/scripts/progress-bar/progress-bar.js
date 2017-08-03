import './styles/progress-bar.css';
import NumberWidget from './number-widget';

export default class ProgressBar {
  constructor({ currentIndex, maxIndex, uiElements }) {
    this.maxIndex = maxIndex;
    this.uiElements = uiElements;

    this.progressBar = document.createElement('div');
    this.progressBar.className = 'h5p-questionnaire-progress-bar';
    this.progressBar.setAttribute('tabindex', '-1');
    this.progressBar.setAttribute('role', 'progressbar');
    this.progressBar.setAttribute('aria-valuemin', '0');
    this.progressBar.setAttribute('aria-valuemax', maxIndex);
    this.updateAriaValues(currentIndex);

    this.currentProgress = document.createElement('div');
    this.currentProgress.className = 'h5p-questionnaire-progress-bar-current';

    this.numberWidget = new NumberWidget(currentIndex, maxIndex);

    this.move(currentIndex);

    this.progressBar.appendChild(this.currentProgress);
  }

  updateAriaValues(currentIndex) {
    this.progressBar.setAttribute('aria-valuenow', currentIndex);
    this.progressBar.setAttribute(
      'aria-valuetext',
      this.uiElements.accessibility.progressBarText
        .replace('%current', currentIndex)
        .replace('%max', this.maxIndex)
    );
  }

  move(index) {
    this.numberWidget.setCurrentIndex(index);
    this.currentProgress.style.width = `${ (index / this.maxIndex) * 100 }%`;
    this.updateAriaValues(index);
    this.progressBar.focus();
  }

  hide(hide = true) {
    this.progressBar.classList[hide ? 'add' : 'remove']('hide');
  }

  attachNumberWidgetTo(container) {
    this.numberWidget.attachTo(container);
  }

  attachTo(container) {
    container.appendChild(this.progressBar);
  }
}

import './styles/number-widget.css';

export default class NumberWidget {
  constructor(currentIndex, maxIndex) {
    this.numberWidget = document.createElement('div');
    this.numberWidget.className = 'h5p-questionnaire-progress-bar-widget';
    this.numberWidget.setAttribute('aria-hidden', 'true');

    this.currentIndex = document.createElement('div');
    this.currentIndex.className = 'h5p-questionnaire-progress-bar-widget-current';
    this.currentIndex.textContent = currentIndex;

    const separator = document.createElement('div');
    separator.className = 'h5p-questionnaire-progress-bar-widget-separator';
    separator.textContent = '/';

    const maxIndexElement = document.createElement('div');
    maxIndexElement.className = 'h5p-questionnaire-progress-bar-widget-max';
    maxIndexElement.textContent = maxIndex;

    this.numberWidget.appendChild(this.currentIndex);
    this.numberWidget.appendChild(separator);
    this.numberWidget.appendChild(maxIndexElement);
  }

  setCurrentIndex(index) {
    this.currentIndex.textContent = index;
  }

  attachTo(container) {
    container.appendChild(this.numberWidget);
  }
}

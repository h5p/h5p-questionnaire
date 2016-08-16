import './styles/progress-bar.css';
import NumberWidget from './number-widget';

export default class ProgressBar {
  constructor({ currentIndex, maxIndex }) {
    this.maxIndex = maxIndex;

    this.progressBar = document.createElement('div');
    this.progressBar.className = 'h5p-questionnaire-progress-bar';

    this.currentProgress = document.createElement('div');
    this.currentProgress.className = 'h5p-questionnaire-progress-bar-current';

    this.numberWidget = new NumberWidget(currentIndex, maxIndex);

    this.move(currentIndex);

    this.progressBar.appendChild(this.currentProgress);
  }

  move(index) {
    this.numberWidget.setCurrentIndex(index);
    this.currentProgress.style.width = `${ (index / this.maxIndex) * 100 }%`;
  }

  remove() {
    this.numberWidget.remove();
    this.progressBar.parentNode.removeChild(this.progressBar);
  }

  attachNumberWidgetTo(container) {
    this.numberWidget.attachTo(container);
  }

  attachTo(container) {
    container.appendChild(this.progressBar);
  }
}

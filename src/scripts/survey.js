import './styles/survey.css';
import Footer from './footer';

export default class Survey extends H5P.EventDispatcher {

  /**
   * Constructor for survey
   * @param params
   * @param contentId
   */
  constructor(params, contentId = null) {
    super();

    const {
      surveyElements = [],
      buttonLabels = [],
    } = params;

    this.state = {
      surveyElements: [],
      currentIndex: 0
    };

    /**
     * Create survey element from parameters
     * @param {Object} elParams Parameters of survey element
     * @return {Object} Survey element and instance
     */
    this.createSurveyElement = function (elParams) {
      const surveyElement = document.createElement('div');
      const instance = H5P.newRunnable(elParams, contentId, H5P.jQuery(surveyElement), undefined, { parent: this });

      return {
        surveyElement,
        instance
      };
    };

    /**
     * Create complete survey element
     * @return {Element} Survey element
     */
    this.createSurvey = function () {
      const surveyWrapper = document.createElement('div');
      surveyWrapper.className = 'h5p-survey';

      surveyElements.forEach((elParams, index) => {
        const { surveyElement } = this.createSurveyElement(elParams);
        surveyElement.className = 'h5p-survey-element';
        this.state.surveyElements.push(surveyElement);
        if (index !== 0) {
          surveyElement.classList.add('hide');
        }
        surveyWrapper.appendChild(surveyElement);
      });

      const footer = this.createFooter();
      footer.attachTo(surveyWrapper);

      return surveyWrapper;
    };

    /**
     * Create a Footer instance
     * @return {Footer}
     */
    this.createFooter = function () {
      const footer = new Footer(buttonLabels);
      footer.on('submit', () => {
        this.triggerXAPI('completed');
      });

      footer.on('next', () => {
        console.log("pressed next");
        this.move(footer, 1);
      });

      footer.on('prev', () => {
        console.log("pressed prev");
        this.move(footer, -1);
      });
      footer.trigger('disablePrev');
      footer.trigger('disableSubmit');

      return footer;
    };

    /**
     * Move in a direction
     * @param footer
     * @param direction
     */
    this.move = function (footer, direction) {
      let { currentIndex, surveyElements } = this.state;
      const nextIndex = currentIndex + direction;

      if (nextIndex >= 0 || nextIndex < surveyElements.length) {
        footer.trigger(nextIndex === 0 ? 'disablePrev' : 'enablePrev');
        footer.trigger(nextIndex >= surveyElements.length -1 ? 'disableNext' : 'enableNext');
        footer.trigger(nextIndex !== surveyElements.length -1 ? 'disableSubmit': 'enableSubmit');

        surveyElements[nextIndex - direction].classList.add('hide');
        surveyElements[nextIndex].classList.remove('hide');
      }

      Object.assign(this.state, {
        currentIndex: nextIndex
      });
    };

    /**
     * Attach library to wrapper
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      const surveyWrapper = this.createSurvey();
      $wrapper.get(0).appendChild(surveyWrapper);
    };
  }
}

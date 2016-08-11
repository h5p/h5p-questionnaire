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

      surveyElements.forEach((sElement, index) => {
        const { requiredField , library } = sElement;
        const { surveyElement, instance } = this.createSurveyElement(library);
        surveyElement.className = 'h5p-survey-element';

        instance.on('xAPI', () => {
          this.state.surveyElements[index].answered = true;
        });

        this.state.surveyElements.push({
          instance,
          surveyElement,
          requiredField,
          answered: false
        });
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
        const currentEl = this.state.surveyElements[this.state.surveyElements.length - 1];
        if (this.isValidAnswer(currentEl)) {
          this.triggerXAPI('completed');
          //TODO: Display 'success' screen!
        }
        else {
          this.triggerRequiredQuestion(currentEl.instance);
        }
      });

      footer.on('next', () => {
        this.move(footer, 1);
      });

      footer.on('prev', () => {
        this.move(footer, -1);
      });
      footer.trigger('disablePrev');
      footer.trigger('disableSubmit');

      return footer;
    };

    this.triggerRequiredQuestion = function (instance) {
      instance.trigger('showRequiredMessage');
    };

    /**
     * Move in a direction
     * @param footer
     * @param direction
     */
    this.move = function (footer, direction) {
      const { currentIndex, surveyElements } = this.state;
      const element = surveyElements[currentIndex];

      if (direction > 0 && !this.isValidAnswer(element)) {
        this.triggerRequiredQuestion(element.instance);
        return;
      }

      const nextIndex = currentIndex + direction;

      if (nextIndex >= 0 || nextIndex < surveyElements.length) {
        footer.trigger(nextIndex === 0 ? 'disablePrev' : 'enablePrev');
        footer.trigger(nextIndex >= surveyElements.length -1 ? 'disableNext' : 'enableNext');
        footer.trigger(nextIndex !== surveyElements.length -1 ? 'disableSubmit': 'enableSubmit');

        surveyElements[currentIndex].surveyElement.classList.add('hide');
        surveyElements[nextIndex].surveyElement.classList.remove('hide');
      }

      this.state = Object.assign(this.state, {
        currentIndex: nextIndex
      });
    };

    this.isValidAnswer = function (element) {
      return !element.requiredField || element.answered;
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

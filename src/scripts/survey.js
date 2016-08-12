import './styles/survey.css';
import SuccessScreen from './success-screen';
import RequiredMessage from './required-message';
import Footer from './footer';

export default class Survey extends H5P.EventDispatcher {

  /**
   * Constructor for survey
   * @param surveyElements
   * @param uiElements
   * @param uiElements.buttonLabels
   * @param uiElements.requiredMessage
   * @param contentId
   */
  constructor({ surveyElements = [], uiElements = [] }, contentId = null) {
    super();

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
      surveyElement.className = 'h5p-survey-element';
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

      surveyElements.forEach(({ requiredField, library }, index) => {
        const { surveyElement, instance } = this.createSurveyElement(library);
        surveyElement.classList.toggle('hide', index !== 0);

        instance.on('xAPI', () => {
          this.requiredMessage.trigger('hideMessage');
          this.state.surveyElements[index].answered = true;
        });

        this.state.surveyElements.push({
          instance,
          surveyElement,
          requiredField,
          answered: false
        });

        surveyWrapper.appendChild(surveyElement);
      });

      this.successScreen = new SuccessScreen({ successMessage: 'Success!' });
      this.successScreen.attachTo(surveyWrapper);

      this.requiredMessage = new RequiredMessage(uiElements.requiredMessage);
      this.requiredMessage.attachTo(surveyWrapper);

      const footer = this.createFooter();
      footer.attachTo(surveyWrapper);

      return surveyWrapper;
    };

    /**
     * Create a Footer instance
     * @return {Footer}
     */
    this.createFooter = function () {
      const footer = new Footer(uiElements.buttonLabels);
      footer.on('submit', () => {
        const currentEl = this.state.surveyElements[this.state.surveyElements.length - 1];
        if (this.isValidAnswer(currentEl)) {
          footer.trigger('disablePrev');
          footer.trigger('disableNext');
          footer.trigger('disableSubmit');
          currentEl.surveyElement.classList.add('hide');
          this.triggerXAPI('completed');
          this.successScreen.show();
        }
        else {
          this.triggerRequiredQuestion();
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

    this.triggerRequiredQuestion = function () {
      this.requiredMessage.trigger('showMessage');
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
        this.triggerRequiredQuestion();
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

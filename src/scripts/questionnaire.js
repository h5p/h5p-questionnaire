import './styles/questionnaire.css';
import SuccessScreen from './success-screen';
import RequiredMessage from './required-message';
import Footer from './footer';

export default class Questionnaire extends H5P.EventDispatcher {

  /**
   * Constructor for questionnaire
   * @param questionnaireElements
   * @param uiElements
   * @param uiElements.buttonLabels
   * @param uiElements.requiredMessage
   * @param contentId
   */
  constructor({ questionnaireElements = [], uiElements = [] }, contentId = null) {
    super();

    this.state = {
      questionnaireElements: [],
      currentIndex: 0
    };

    /**
     * Create questionnaire element from parameters
     * @param {Object} elParams Parameters of questionnaire element
     * @return {Object} questionnaire element and instance
     */
    this.createQuestionnaireElement = function (elParams) {
      const questionnaireElement = document.createElement('div');
      questionnaireElement.className = 'h5p-questionnaire-element';
      const instance = H5P.newRunnable(elParams, contentId, H5P.jQuery(questionnaireElement), undefined, { parent: this });

      return {
        questionnaireElement,
        instance
      };
    };

    /**
     * Create complete questionnaire element
     * @return {Element} questionnaire element
     */
    this.createQuestionnaire = function () {
      const questionnaireWrapper = document.createElement('div');
      questionnaireWrapper.className = 'h5p-questionnaire';

      questionnaireElements.forEach(({ requiredField, library }, index) => {
        const { questionnaireElement, instance } = this.createQuestionnaireElement(library);
        questionnaireElement.classList.toggle('hide', index !== 0);

        instance.on('xAPI', () => {
          this.requiredMessage.trigger('hideMessage');
          this.state.questionnaireElements[index].answered = true;
        });

        this.state.questionnaireElements.push({
          instance,
          questionnaireElement,
          requiredField,
          answered: false
        });

        questionnaireWrapper.appendChild(questionnaireElement);
      });

      this.successScreen = new SuccessScreen({ successMessage: 'Success!' });
      this.successScreen.attachTo(questionnaireWrapper);

      this.requiredMessage = new RequiredMessage(uiElements.requiredMessage);
      this.requiredMessage.attachTo(questionnaireWrapper);

      const footer = this.createFooter();
      footer.attachTo(questionnaireWrapper);

      return questionnaireWrapper;
    };

    /**
     * Create a Footer instance
     * @return {Footer}
     */
    this.createFooter = function () {
      const footer = new Footer(uiElements.buttonLabels);
      footer.on('submit', () => {
        const currentEl = this.state.questionnaireElements[this.state.questionnaireElements.length - 1];
        if (this.isValidAnswer(currentEl)) {
          footer.trigger('disablePrev');
          footer.trigger('disableNext');
          footer.trigger('disableSubmit');
          currentEl.questionnaireElement.classList.add('hide');
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
      const { currentIndex, questionnaireElements } = this.state;
      const element = questionnaireElements[currentIndex];

      if (direction > 0 && !this.isValidAnswer(element)) {
        this.triggerRequiredQuestion();
        return;
      }

      const nextIndex = currentIndex + direction;

      if (nextIndex >= 0 || nextIndex < questionnaireElements.length) {
        footer.trigger(nextIndex === 0 ? 'disablePrev' : 'enablePrev');
        footer.trigger(nextIndex >= questionnaireElements.length -1 ? 'disableNext' : 'enableNext');
        footer.trigger(nextIndex !== questionnaireElements.length -1 ? 'disableSubmit': 'enableSubmit');

        questionnaireElements[currentIndex].questionnaireElement.classList.add('hide');
        questionnaireElements[nextIndex].questionnaireElement.classList.remove('hide');
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
      const questionnaireWrapper = this.createQuestionnaire();
      $wrapper.get(0).appendChild(questionnaireWrapper);
    };
  }
}

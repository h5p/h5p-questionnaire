import './styles/children-styles.css';
import './styles/questionnaire.css';
import SuccessScreen from './success-screen';
import RequiredMessage from './required-message';
import Footer from './footer';
import ProgressBar from './progress-bar/progress-bar';

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

      this.progressBar = new ProgressBar({
        currentIndex: 1,
        maxIndex: questionnaireElements.length
      });
      this.progressBar.attachTo(questionnaireWrapper);

      this.progressBar.attachNumberWidgetTo(questionnaireWrapper);

      questionnaireElements.forEach(({ requiredField, library }, index) => {
        const { questionnaireElement, instance } = this.createQuestionnaireElement(library);
        questionnaireElement.classList.toggle('hide', index !== 0);

        instance.on('xAPI', (e) => {
          this.requiredMessage.trigger('hideMessage');

          // Make sure there was a results response
          const results = e.data.statement.result.response;
          this.state.questionnaireElements[index].answered = !!results.length;
        });

        if (requiredField) {
          const requiredSymbol = document.createElement('div');
          requiredSymbol.textContent = '* ' + uiElements.requiredText;
          questionnaireElement.insertBefore(requiredSymbol, questionnaireElement.firstChild);
        }

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
          this.progressBar.remove();
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
      this.progressBar.move(nextIndex + 1);
    };

    this.isValidAnswer = function (element) {
      return !element.requiredField || element.answered;
    };

    /**
     * Attach library to wrapper
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).appendChild(questionnaireWrapper);
    };

    const questionnaireWrapper = this.createQuestionnaire();
  }
}

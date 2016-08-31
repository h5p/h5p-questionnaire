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
   * @param successScreenOptions
   * @param uiElements
   * @param uiElements.buttonLabels
   * @param uiElements.requiredMessage
   * @param contentId
   */
  constructor({questionnaireElements = [], successScreenOptions = {}, uiElements = {}}, contentId = null) {
    super();

    this.contentId = contentId;
    this.state = {
      questionnaireElements: [],
      currentIndex: 0
    };

    uiElements = Object.assign({}, {
      buttonLabels: {
        prevLabel: 'Previous',
        nextLabel: 'Next',
        submitLabel: 'Submit'
      },
      accessibility: {
        requiredTextExitLabel: "Close error message",
        progressBarText: 'Question %current of %max'
      },
      requiredMessage: 'This question requires an answer',
      requiredText: 'required',
      successMessage: 'You successfully answered all of the questions.'
    }, uiElements);

    /**
     * Create questionnaire element from parameters
     * @param {Object} elParams Parameters of questionnaire element
     * @return {Object} questionnaire element and instance
     */
    this.createQuestionnaireElement = function (elParams) {
      const questionnaireElement = document.createElement('div');
      questionnaireElement.className = 'h5p-questionnaire-element';
      const instance = H5P.newRunnable(elParams, contentId, H5P.jQuery(questionnaireElement), undefined, {parent: this});

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
        maxIndex: questionnaireElements.length,
        uiElements
      });
      this.progressBar.attachTo(questionnaireWrapper);

      const content = document.createElement('div');
      content.className = 'h5p-questionnaire-content';

      questionnaireElements.forEach(({requiredField, library}, index) => {
        const {questionnaireElement, instance} = this.createQuestionnaireElement(library);
        const subContentQuestion = questionnaireElement.querySelector('.h5p-subcontent-question');
        if (index === 0 && subContentQuestion) {
          this.progressBar.attachNumberWidgetTo(subContentQuestion);
        }
        questionnaireElement.classList.toggle('hide', index !== 0);

        instance.on('xAPI', (e) => {
          this.requiredMessage.trigger('hideMessage');

          // Make sure there was a results response
          const results = e.data.statement.result.response;
          this.state.questionnaireElements[index].answered = !!results.length;
          this.trigger('resize');
        });

        if (requiredField) {
          questionnaireElement.classList.add('h5p-questionnaire-required');
          const requiredSymbol = document.createElement('div');
          requiredSymbol.textContent = '* ' + uiElements.requiredText;
          requiredSymbol.className = 'h5p-questionnaire-required-symbol';
          if (subContentQuestion) {
            subContentQuestion.insertBefore(requiredSymbol, subContentQuestion.firstChild);
          }
        }

        this.state.questionnaireElements.push({
          instance,
          questionnaireElement,
          requiredField,
          answered: false
        });

        content.appendChild(questionnaireElement);
      });
      questionnaireWrapper.appendChild(content);

      this.successScreen = new SuccessScreen(
        successScreenOptions,
        {successMessage: uiElements.successMessage},
        this
      );
      this.successScreen.on('noSuccessScreen', () => {
        this.trigger('noSuccessScreen');
      });
      this.successScreen.attachTo(content);

      this.requiredMessage = new RequiredMessage(uiElements);
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
          this.triggerXAPI('completed');

          if (this.successScreen.show()) {
            currentEl.questionnaireElement.classList.add('hide');
            footer.trigger('disablePrev');
            footer.trigger('disableNext');
            footer.trigger('disableSubmit');
            this.progressBar.remove();
            footer.remove();
          }
          this.trigger('resize');
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
      if (this.state.questionnaireElements.length > 1) {
        footer.trigger('disableSubmit');
      }
      else {
        footer.trigger('disableNext');
      }

      return footer;
    };

    /**
     * Trigger required question to any listeners
     */
    this.triggerRequiredQuestion = function () {
      this.requiredMessage.trigger('showMessage');
      this.trigger('resize');
    };

    /**
     * Move in a direction
     * @param footer
     * @param direction
     */
    this.move = function (footer, direction) {
      const {currentIndex, questionnaireElements} = this.state;
      const element = questionnaireElements[currentIndex];

      if (direction > 0 && !this.isValidAnswer(element)) {
        this.triggerRequiredQuestion();
        return;
      }

      const nextIndex = currentIndex + direction;

      if (nextIndex >= 0 || nextIndex < questionnaireElements.length) {
        footer.trigger(nextIndex === 0 ? 'disablePrev' : 'enablePrev');
        footer.trigger(nextIndex >= questionnaireElements.length - 1 ? 'disableNext' : 'enableNext');
        footer.trigger(nextIndex !== questionnaireElements.length - 1 ? 'disableSubmit' : 'enableSubmit');

        this.requiredMessage.trigger('hideMessage');
        questionnaireElements[currentIndex].questionnaireElement.classList.add('hide');
        const nextQuestion = questionnaireElements[nextIndex].questionnaireElement;
        nextQuestion.classList.remove('hide');
        const nextQuestionHeader = nextQuestion.querySelector('.h5p-subcontent-question');
        this.progressBar.attachNumberWidgetTo(nextQuestionHeader);
        this.trigger('resize');
      }

      this.state = Object.assign(this.state, {
        currentIndex: nextIndex
      });
      this.progressBar.move(nextIndex + 1);
    };

    /**
     * Valid answer if field is not required or answered
     *
     * @param element
     * @return {boolean}
     */
    this.isValidAnswer = function (element) {
      return !element.requiredField || element.answered;
    };

    /**
     * Attach library to wrapper
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).classList.add('h5p-questionnaire-wrapper');
      $wrapper.get(0).appendChild(questionnaireWrapper);
    };

    const questionnaireWrapper = this.createQuestionnaire();
  }
}

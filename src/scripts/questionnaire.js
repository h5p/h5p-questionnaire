import './styles/children-styles.css';
import './styles/questionnaire.css';
import SuccessScreen from './success-screen';
import RequiredMessage from './required-message';
import Footer from './footer';
import ProgressBar from './progress-bar/progress-bar';
import QuestionContent from './question-content';

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
     * Instantiate all questions
     * @return {Element}
     */
    this.createQuestionnaireBody = function () {
      const content = document.createElement('div');
      content.className = 'h5p-questionnaire-content';

      questionnaireElements.forEach(({requiredField, library}, index) => {
        const questionContent = this.createQuestionContent(requiredField, library, index);
        content.appendChild(questionContent.getElement());
        this.state.questionnaireElements.push(questionContent);

      });

      this.createSuccessScreen().attachTo(content);

      return content;
    };

    /**
     * Instantiate a single question
     *
     * @param {boolean} requiredField
     * @param {Object} library
     * @param {number} index
     * @return {QuestionContent}
     */
    this.createQuestionContent = function (requiredField, library, index) {
      const questionContent = new QuestionContent({
        progressBar: this.progressBar,
        params: library,
        contentId: this.contentId,
        requiredField,
        index: index,
        uiElements
      });
      questionContent.hideElement(index !== 0);
      questionContent.on('handledInteraction', () => {
        this.trigger('resize');
        this.requiredMessage.trigger('hideMessage');
      });

      return questionContent;
    };

    /**
     * Create questionnaire wrapper
     * @return {Element} questionnaire element
     */
    this.createQuestionnaire = function () {
      const questionnaireWrapper = document.createElement('div');
      questionnaireWrapper.className = 'h5p-questionnaire';
      this.createProgressBar(questionnaireElements).attachTo(questionnaireWrapper);

      const content = this.createQuestionnaireBody();
      questionnaireWrapper.appendChild(content);

      this.requiredMessage = new RequiredMessage(uiElements);
      this.requiredMessage.attachTo(questionnaireWrapper);

      const footer = this.createFooter();
      footer.attachTo(questionnaireWrapper);

      // Start initial questionnaire element activity
      if (this.state.questionnaireElements.length) {
        this.state.questionnaireElements[0].setActivityStarted();
      }

      return questionnaireWrapper;
    };

    /**
     * Create success screen
     * @return {SuccessScreen}
     */
    this.createSuccessScreen = function () {
      this.successScreen = new SuccessScreen(
        successScreenOptions,
        {successMessage: uiElements.successMessage},
        this
      );
      this.successScreen.on('noSuccessScreen', () => {
        this.trigger('noSuccessScreen');
      });

      return this.successScreen;
    };

    /**
     * Create progress bar
     * @param questionnaireElements
     * @return {ProgressBar}
     */
    this.createProgressBar = function (questionnaireElements) {
      this.progressBar = new ProgressBar({
        currentIndex: 1,
        maxIndex: questionnaireElements.length,
        uiElements
      });

      return this.progressBar;
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
            currentEl.hideElement(true);
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
        questionnaireElements[currentIndex].hideElement(true);
        const nextQuestion = questionnaireElements[nextIndex];
        nextQuestion.hideElement(false);
        const nextQuestionHeader = nextQuestion.getElement().querySelector('.h5p-subcontent-question');
        this.progressBar.attachNumberWidgetTo(nextQuestionHeader);
        this.trigger('resize');
      }

      this.state = Object.assign(this.state, {
        currentIndex: nextIndex
      });
      this.progressBar.move(nextIndex + 1);

      const progressedEvent = this.createXAPIEventTemplate('progressed');
      if (progressedEvent.data.statement.object) {
        progressedEvent.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point'] = nextIndex + 1;
        this.trigger(progressedEvent);
      }

      questionnaireElements[nextIndex].setActivityStarted();
    };

    /**
     * Valid answer if field is not required or answered
     *
     * @param element
     * @return {boolean}
     */
    this.isValidAnswer = function (element) {
      return !element.isRequired() || element.isAnswered();
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

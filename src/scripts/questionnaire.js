import './styles/children-styles.css';
import './styles/questionnaire.css';
import SuccessScreen from './success-screen';
import SubmitScreen from './submit-screen';
import RequiredMessage from './required-message';
import Footer from './footer';
import ProgressBar from './progress-bar/progress-bar';
import QuestionContent from './question-content';

export default class Questionnaire extends H5P.EventDispatcher {

  /**
   * Constructor for questionnaire
   * @param questionnaireElements
   * @param successScreenOptions
   * @param successScreenOptions.enableSuccessScreen
   * @param uiElements
   * @param uiElements.buttonLabels
   * @param uiElements.requiredMessage
   * @param contentId
   * @param contentData
   */
  constructor({questionnaireElements = [], successScreenOptions = {}, uiElements = {}}, contentId = null, contentData = {}) {
    super();

    this.contentId = contentId;
    this.state = {
      questionnaireElements: [],
      currentIndex: 0
    };

    uiElements = H5P.jQuery.extend(true, {
      buttonLabels: {
        prevLabel: 'Back',
        nextLabel: 'Next',
        submitLabel: 'Submit',
        continueLabel: 'Continue'
      },
      accessibility: {
        requiredTextExitLabel: "Close error message",
        progressBarText: 'Question %current of %max'
      },
      requiredMessage: 'This question requires an answer',
      requiredText: 'required',
      submitScreenTitle: 'You successfully answered all of the questions',
      submitScreenSubtitle: 'Click below to submit your answers'
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

      this.createSubmitScreen().attachTo(content);

      if (successScreenOptions.enableSuccessScreen) {
        this.createSuccessScreen().attachTo(content);
      }

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
      questionContent.on('handledInteraction', () => {
        this.trigger('resize');
        this.requiredMessage.trigger('hideMessage');
        this.triggerXAPI('interacted');
      });

      questionContent.on('allow-finish-changed', () => {
        this.setForwardNavigationButton(this.state.currentIndex);
      });

      questionContent.on('changed', () => {
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
      if (questionnaireElements.length === 1 && !questionnaireElements[0].library) {
        questionnaireWrapper.classList.add('h5p-invalid-questionnaire');
        questionnaireWrapper.textContent = 'Invalid content';
        return questionnaireWrapper;
      }

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

      if (this.state.finished) {
        // Resume functionality
        successScreenOptions.enableSuccessScreen ? this.showSuccessScreen() : this.showSubmitScreen();
      }
      else {
        // If currentIndex > 0, it means we are resuming
        this.move(this.state.currentIndex, this.state.currentIndex > 0);
      }

      return questionnaireWrapper;
    };


    /**
     * Create submit screen
     * @return {SubmitScreen}
     */
    this.createSubmitScreen = function () {
      this.submitScreen = new SubmitScreen({
        title: uiElements.submitScreenTitle,
        subtitle: uiElements.submitScreenSubtitle,
        backLabel: uiElements.buttonLabels.prevLabel,
        submitLabel: uiElements.buttonLabels.submitLabel
      });

      this.submitScreen.on('submit', this.handleSubmit.bind(this));

      this.submitScreen.on('previous', () => {
        this.submitScreen.hide();
        this.hideQuestion(false);
        this.trigger('resize');
      });

      return this.submitScreen;
    };

    /**
     * Toggle question visibility
     *
     * @param {boolean} hide Will hide if true, otherwise it will show
     */
    this.hideQuestion = function (hide) {
      this.state.questionnaireElements[this.state.questionnaireElements.length - 1].hide(hide);
      this.progressBar.hide(hide);
      this.footer.hide(hide);
    };

    /**
     * Create success screen
     * @return {SuccessScreen}
     */
    this.createSuccessScreen = function () {
      this.successScreen = new SuccessScreen(
        successScreenOptions,
        this
      );

      /**
       * Need to resize when image is loaded in case we are restoring the
       * success screen page.
       */
      this.successScreen.on('imageLoaded', () => {
        this.trigger('resize');
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
        currentIndex: this.state.currentIndex + 1,
        maxIndex: questionnaireElements.length,
        uiElements
      });

      return this.progressBar;
    };

    /**
     * Show the submit screen
     */
    this.showSubmitScreen = function () {
      this.hideQuestion(true);
      this.submitScreen.show();
      this.trigger('resize');
    };

    /**
     * Show the succcess screen
     */
    this.showSuccessScreen = function () {
      this.hideQuestion(true);
      this.submitScreen.hide();
      this.successScreen.show();
      this.trigger('resize');
    };

    /**
     * Handle submitting of questionnaire
     *
     * Either show succcess screen or notify container
     * that there is no success screen
     */
    this.handleSubmit = function () {
      if (successScreenOptions.enableSuccessScreen) {
        this.showSuccessScreen();
      }
      else {
        this.trigger('noSuccessScreen');
      }

      this.state.finished = true;
      this.triggerXAPI('completed');
    };

    /**
     * Create a Footer instance
     * @return {Footer}
     */
    this.createFooter = function () {
      const footer = new Footer(uiElements.buttonLabels);
      footer.on('next', () => {
        if (this.move(this.state.currentIndex + 1)) {
          this.showSubmitScreen();
        }
      });
      footer.on('previous', () => {
        this.move(this.state.currentIndex - 1);
      });

      footer.trigger('disable-previous');
      this.footer = footer;

      return footer;
    };

    /**
     * Update the forward button based on content type having a second step
     * @param {number} index The question index
     */
    this.setForwardNavigationButton = function (index) {
      if (index > this.state.questionnaireElements.length - 1) {
        return;
      }

      const allowFinish = this.state.questionnaireElements[index].allowFinish();
      const buttonType = (allowFinish === QuestionContent.AllowFinish.ALLOW ? 'next' : 'continue');
      this.footer.setForwardNavigationButton(buttonType);
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
     *
     * @param {number} index
     * @param {boolean} [force] Skip checks, just move (used by resume)
     *
     * @return {boolean} inidcates if submit screen should be shown
     */
    this.move = function (index, force = false) {
      const {currentIndex, questionnaireElements} = this.state;
      const element = questionnaireElements[currentIndex];

      if (index < 0) {
        return false;
      }

      // Only do these checks if navigating forward, or forcing it on resume
      if (!force && index > currentIndex) {
        // If required
        if (!this.isValidAnswer(element)) {
          this.triggerRequiredQuestion();
          return false;
        }

        // Give question element a chance to stop the move
        if (element.allowFinish() === QuestionContent.AllowFinish.DENY && !element.finish()) {
          // Change forward button from continue to Next or Submit
          this.setForwardNavigationButton(currentIndex);
          this.trigger('resize');
          return false;
        }
      }

      // We're ready to show the submit screen
      if (index > questionnaireElements.length - 1) {
        return true;
      }

      // Hide previous button on first question
      this.footer.trigger(index === 0 ? 'disable-previous' : 'enable-previous');

      this.setForwardNavigationButton(index);

      this.requiredMessage.trigger('hideMessage');
      questionnaireElements[currentIndex].hide(true);
      const nextQuestion = questionnaireElements[index];
      nextQuestion.hide(false);
      const nextQuestionHeader = nextQuestion.getElement().querySelector('.h5p-subcontent-question');
      this.progressBar.attachNumberWidgetTo(nextQuestionHeader);
      this.trigger('resize');

      this.state = Object.assign(this.state, {
        currentIndex: index
      });
      this.progressBar.move(index + 1);

      // Don't send xApi event when initializing
      if (index !== 0 && currentIndex !== 0) {
        const progressedEvent = this.createXAPIEventTemplate('progressed');
        if (progressedEvent.data.statement.object) {
          progressedEvent.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point'] = index + 1;
          this.trigger(progressedEvent);
        }
      }

      questionnaireElements[index].setActivityStarted();
      return false;
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

    /**
     * Get current state
     * @return {{questions: Array, progress: number}}
     */
    this.getCurrentState = function () {
      const questions = this.state.questionnaireElements.map((question) => {
        return question.getCurrentState();
      });

      // Content state was changed in version 1. Before that there was no version property.
      // In version 1, currentIndex's max value is (numQuestions - 1). Before that,
      // currentIndex could be numQuestions to indicate success screen was shown. finished
      // was introduced in version 1 to indicate the same.
      return {
        questions,
        progress: this.state.currentIndex,
        finished: this.state.finished,
        version: 1
      };
    };

    /**
     * Restore previous state
     */
    this.setPreviousState = function () {
      const previousState = contentData.previousState;

      // No valid content data
      if (!previousState || !previousState.questions) {
        return;
      }

      this.state.finished = previousState.finished;

      if (previousState.progress) {
        this.state.currentIndex = previousState.progress;

        // Content state was changed in version 1. Before that there was no versioning.
        // In version 1, currentIndex's max value is (numQuestions - 1). Before that,
        // currentIndex could be numQuestions to indicate success screen was shown
        const overflow = (this.state.currentIndex >= questionnaireElements.length);
        if (previousState.version === undefined && overflow) {
          this.state.currentIndex = questionnaireElements.length - 1;
          this.state.finished = true;
        }
      }

      previousState.questions.forEach((question, idx) => {
        questionnaireElements[idx].library.userDatas =
          questionnaireElements[idx].library.userDatas || {};

        questionnaireElements[idx].library.userDatas.state = question;
      });
    };

    this.setPreviousState();
    const questionnaireWrapper = this.createQuestionnaire();
  }
}

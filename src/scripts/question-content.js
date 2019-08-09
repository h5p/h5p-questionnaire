export default class QuestionContent extends H5P.EventDispatcher {

  /**
   * Enum for continue/next logic. For now this is used for being able to
   * display the feedback for simple multiple choice. I.e: can't skip to next
   * question until this is displayed (if anything needs to be displayed)
   *
   * @readonly
   * @enum {number}
   */
  static get AllowFinish() {
    return {
      /**
       * Question type will never need to display the next button. Always ready
       * to skip to next question
       * @member {number}
       */
      ALWAYS: 0,
      /**
       * Question is not ready to let go yet
       * @member {Number}
       */
      DENY: 1,
      /**
       * Question has done whatever needed, ready to let go
       * @member {Number}
       */
      ALLOW: 2
    };
  }

  constructor({progressBar, params, contentId, requiredField, index, uiElements}) {
    super();

    this.progressBar = progressBar;

    this.questionnaireElement = document.createElement('div');
    this.questionnaireElement.className = 'h5p-questionnaire-element hide';
    this.instance = H5P.newRunnable(params, contentId, H5P.jQuery(this.questionnaireElement), undefined, {parent: this});
    this.requiredField = requiredField;
    this.answered = params.userDatas && params.userDatas.state && params.userDatas.state.length;

    this.attachRequiredField(requiredField, uiElements);

    this.instance.on('xAPI', this.handleInteraction.bind(this));
    this.instance.on('allow-finish-changed', this.trigger.bind(this));
    this.instance.on('changed', this.trigger.bind(this));
  }

  /**
   * Attaches required field if question is required
   * @param {boolean} requiredField
   * @param {Object} uiElements
   */
  attachRequiredField(requiredField, uiElements) {
    if (!requiredField) {
      return;
    }

    const subContentQuestion = this.questionnaireElement.querySelector('.h5p-subcontent-question');
    this.questionnaireElement.classList.add('h5p-questionnaire-required');
    const requiredSymbol = document.createElement('div');
    requiredSymbol.innerHTML = '* ' + uiElements.requiredText;
    requiredSymbol.className = 'h5p-questionnaire-required-symbol';
    if (subContentQuestion) {
      subContentQuestion.insertBefore(requiredSymbol, subContentQuestion.firstChild);
    }
  }

  /**
   * Handle interaction on question
   * @param e
   */
  handleInteraction(e) {
    // Handle interacted events
    if (e.data.statement.verb.id !== "http://adlnet.gov/expapi/verbs/interacted") {
      return;
    }

    // Make sure there was a results response
    let results = e.data.statement.result.response;

    // Trim if string
    if (results.trim) {
      results = results.trim();
    }

    this.answered = !!results.length;
    this.trigger('handledInteraction');
  }

  /**
   * Check if question needs to e.g. display something before next question may
   * be displayed
   * @return {QuestionContent.AllowFinish}
   */
  allowFinish() {
    return (this.instance.allowFinish !== undefined ? this.instance.allowFinish() : QuestionContent.AllowFinish.ALWAYS);
  }

  /**
   * Let the question know we are about to finish.
   *
   * @return {boolean} If true, question has dnoe something the viewer has to digest.
   *                   Otherwise, we are ready to skip to next question.
   */
  finish() {
    if (this.instance.finish) {
      return this.instance.finish();
    }
  }

  /**
   * Get current state
   * @return {*}
   */
  getCurrentState() {
    return this.instance.getCurrentState ? this.instance.getCurrentState() : null;
  }

  /**
   * Get element
   * @return {Element}
   */
  getElement() {
    return this.questionnaireElement;
  }

  /**
   * Check if question requires an answer
   * @return {boolean}
   */
  isRequired() {
    return this.requiredField;
  }

  /**
   * Check if question is answered
   * @return {boolean}
   */
  isAnswered() {
    return this.answered;
  }

  /**
   * Toggle visibility of question
   * @param {boolean} hide
   */
  hide(hide) {
    this.questionnaireElement.classList[hide ? 'add' : 'remove']('hide');
  }

  /**
   * Set question activity as started if possible
   */
  setActivityStarted() {
    if (this.instance.setActivityStarted) {
      this.instance.setActivityStarted();
    }
  }
}

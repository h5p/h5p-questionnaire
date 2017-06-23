export default class QuestionContent extends H5P.EventDispatcher {
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
    requiredSymbol.textContent = '* ' + uiElements.requiredText;
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
  };

  allowFinish() {
    return (this.instance.allowFinish !== undefined ? this.instance.allowFinish() : 0);
  }

  finish() {
    if(this.instance.finish) {
      return this.instance.finish();
    };
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

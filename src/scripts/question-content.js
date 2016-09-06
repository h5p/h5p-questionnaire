export default class QuestionContent extends H5P.EventDispatcher {
  constructor({progressBar, params, contentId, requiredField, index, uiElements}) {
    super();

    this.progressBar = progressBar;

    this.questionnaireElement = document.createElement('div');
    this.questionnaireElement.className = 'h5p-questionnaire-element';
    this.instance = H5P.newRunnable(params, contentId, H5P.jQuery(this.questionnaireElement), undefined, {parent: this});
    this.requiredField = requiredField;
    this.answered = false;

    this.attachNumberWidget(index);
    this.attachRequiredField(requiredField, uiElements);

    this.instance.on('xAPI', this.handleInteraction.bind(this));
  }

  /**
   * Attaches number widget if first Question
   * @param index
   */
  attachNumberWidget(index) {
    const subContentQuestion = this.questionnaireElement.querySelector('.h5p-subcontent-question');
    if (index === 0 && subContentQuestion) {
      this.progressBar.attachNumberWidgetTo(subContentQuestion);
    }
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
  hideElement(hide) {
    this.questionnaireElement.classList.toggle('hide', hide);
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

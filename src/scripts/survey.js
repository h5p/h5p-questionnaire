export default class Survey extends H5P.EventDispatcher {

  /**
   * Constructor for survey
   * @param params
   * @param contentId
   */
  constructor(params, contentId = null) {
    super();

    // State of the survey
    this.state = params.surveyElements.map((elementParams) => {
      return Object.assign({}, elementParams, {
        answers: null
      });
    });

    // Latest submitted state
    this.submittedState = null;

    /**
     * Handle submitting of an answer
     */
    this.handleSubmit = function () {
      if (this.submittedState !== this.state) {
        this.submittedState = this.state;
        this.trigger('submit', this.state, { external: true });
      }
    };

    /**
     * Handle creating submit answer button
     * @param {string} buttonText Button text
     * @param {function} onClickCallback Submit button click callback
     * @return {Element} Submit button
     */
    this.createSubmitButton = function (buttonText, onClickCallback) {
      const submitButton = document.createElement('button');
      submitButton.type = 'button';
      submitButton.textContent = buttonText;
      submitButton.addEventListener('click', onClickCallback);

      return submitButton;
    };

    /**
     * Handle a survey elements change in state
     * @param {number} instanceId Unique id for survey element
     * @param {Object} state State of survey that should be updated
     * @param {Event} event Change event with state data for the instance
     */
    this.handleInstanceChanged = function (instanceId, state, event) {
      // Clone object
      const newAnswer = Object.assign({}, state[instanceId], {
        answers: event.data
      });

      // Update state
      return [
        ...state.slice(0, instanceId),
        newAnswer,
        ...state.slice(instanceId + 1)
      ];
    };

    /**
     * Create survey element from parameters
     * @param {Object} elParams Parameters of survey element
     * @param {function} changedListener Callback survey element changes
     * @return {Element} Survey element
     */
    this.createSurveyElement = function (elParams, changedListener) {
      const surveyElement = document.createElement('div');
      const instance = H5P.newRunnable(elParams, contentId, H5P.jQuery(surveyElement));
      instance.on('changed', changedListener);

      return surveyElement;
    };

    /**
     * Create complete survey element
     * @return {Element} Survey element
     */
    this.createSurvey = function () {
      const surveyWrapper = document.createElement('div');
      surveyWrapper.className = 'h5p-survey';

      params.surveyElements.forEach((elParams, instanceId) => {

        const surveyElement = this.createSurveyElement(elParams, (event) => {
          this.state = this.handleInstanceChanged(instanceId, this.state, event)
        });

        surveyWrapper.appendChild(surveyElement);
      });

      const submitButton = this.createSubmitButton(params.buttonLabel, (event) => {
        this.handleSubmit(event);
      });
      surveyWrapper.appendChild(submitButton);

      return surveyWrapper;
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

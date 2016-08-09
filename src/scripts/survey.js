export default class Survey extends H5P.EventDispatcher {

  /**
   * Constructor for survey
   * @param params
   * @param contentId
   */
  constructor(params, contentId = null) {
    super();

    this.state = params.surveyElements.map((elementParams) => {
      return Object.assign({}, elementParams, {
        answers: null
      });
    });

    this.submitedState = null;

    this.handleSubmit = function () {
      this.trigger('submit', this.state, { external: true });
    };

    this.createSubmitButton = function (onClickCallback) {
      const submitButton = document.createElement('button');
      submitButton.type = 'button';
      submitButton.textContent = 'Submit';
      submitButton.addEventListener('click', onClickCallback);

      return submitButton;
    };

    this.handleInstanceChanged = function (instanceId, state, event) {
      // Clone object
      const newAnswer = Object.assign({}, state[instanceId], {
        answers: event.data
      });

      // Update state
      this.state = [
        ...state.slice(0, instanceId),
        newAnswer,
        ...state.slice(instanceId + 1)
      ];
    };

    this.createSurveyElement = function (elParams, changedListener) {
      const $surveyElement = H5P.jQuery('<div>');
      const instance = H5P.newRunnable(elParams, contentId, $surveyElement);
      instance.on('changed', changedListener);

      return $surveyElement;
    };

    this.createSurvey = function () {
      const surveyWrapper = document.createElement('div');
      surveyWrapper.className = 'h5p-survey';

      params.surveyElements.forEach((elParams, instanceId) => {

        const $surveyElement = this.createSurveyElement(elParams, (event) => {
          this.handleInstanceChanged(instanceId, this.state, event)
        });

        surveyWrapper.appendChild($surveyElement.get(0));
      });

      const submitButton = this.createSubmitButton((event) => {
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

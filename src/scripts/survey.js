export default class Survey extends H5P.EventDispatcher {

  /**
   * Constructor for survey
   * @param params
   * @param contentId
   */
  constructor(params, contentId = null) {
    super();

    const {
      surveyElements = [],
      submitLabel = 'Submit'
    } = params;

    /**
     * Handle submitting of an answer
     */
    this.handleSubmit = function () {
      this.triggerXAPI('completed');
    };

    /**
     * Handle creating submit answer button
     * @param {string} buttonText Button text
     * @return {Element} Submit button
     */
    this.createSubmitButton = function (buttonText) {
      const submitButton = document.createElement('button');
      submitButton.type = 'button';
      submitButton.textContent = buttonText;

      return submitButton;
    };

    /**
     * Create survey element from parameters
     * @param {Object} elParams Parameters of survey element
     * @return {Object} Survey element and instance
     */
    this.createSurveyElement = function (elParams) {
      const surveyElement = document.createElement('div');
      const instance = H5P.newRunnable(elParams, contentId, H5P.jQuery(surveyElement), undefined, { parent: this });

      return {
        surveyElement,
        instance
      };
    };

    /**
     * Create complete survey element
     * @return {Element} Survey element
     */
    this.createSurvey = function () {
      const surveyWrapper = document.createElement('div');
      surveyWrapper.className = 'h5p-survey';

      surveyElements.forEach(elParams => {
        const { surveyElement } = this.createSurveyElement(elParams);
        surveyWrapper.appendChild(surveyElement);
      });

      const submitButton = this.createSubmitButton(submitLabel);
      submitButton.addEventListener('click', () => {
        this.handleSubmit();
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

export default class Survey {

  /**
   * Constructor for survey
   * @param params
   * @param contentId
   */
  constructor(params, contentId = null) {

    let $survey = H5P.jQuery('<div>', {
      'class': 'h5p-survey'
    });

    // Init survey elements
    params.surveyElements.forEach((sElement) => {
      let $surveyElement = H5P.jQuery('<div>').appendTo($survey);
      H5P.newRunnable(sElement, contentId, $surveyElement);
    });

    /**
     * Attach library to wrapper
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $survey.appendTo($wrapper);
    };
  }
}

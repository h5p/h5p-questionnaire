import 'expose?H5P!exports?H5P!h5p-view';
import Survey from '../src/scripts/survey';

describe('Survey', () => {
  const params = {
    "surveyElements": [
      {
        "params": {
          "question": "What do you like the most ?",
          "inputType": "checkbox",
          "alternatives": [
            "Fish",
            "Turtles",
            "Icecream"
          ]
        },
        "library": "H5P.SimpleMultiChoice 1.0"
      },
      {
        "params": {
          "question": "What do you like the most ?",
          "inputType": "radio",
          "alternatives": [
            "Fish",
            "Turtles",
            "Icecream"
          ]
        },
        "library": "H5P.SimpleMultiChoice 1.0"
      },
      {
        "params": {
          "question": "Do you like cake ?",
          "placeholderText": "No! I like turtles",
          "inputRows": "2"
        },
        "library": "H5P.OpenEndedQuestion 1.0"
      }
    ]
  };

  var $body = H5P.jQuery('body');
  let survey;

  beforeEach(() => {
    const instance = jasmine.createSpyObj('instance', ['on']);
    spyOn(H5P, 'newRunnable').and.returnValue(instance);
    survey = new Survey(params);
    survey.attach($body);
  });

  // Check that attach is called
  it('should attach to the $wrapper', () => {
    let surveyElement = $body.get(0).querySelectorAll('.h5p-survey');
    expect(surveyElement[0].parentNode).toBe($body.get(0));
  });

  // Check that all survey elements are called with newRunnable
  it('should attach all survey elements', () => {
    expect(H5P.newRunnable).toHaveBeenCalledTimes(3);
  });
});

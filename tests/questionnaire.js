import 'expose?H5P!exports?H5P!h5p-view';
import Questionnaire from '../src/scripts/questionnaire';
import QuestionContent from '../src/scripts/question-content';

describe('Questionnaire', () => {
  const params = {
    "questionnaireElements": [
      {
        "library": {
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
        "requiredField": true
      },
      {
        "library": {
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
        "requiredField": false
      },
      {
        "library": {
          "params": {
            "question": "Do you like cake ?",
            "placeholderText": "No! I like turtles",
            "inputRows": "2"
          },
          "library": "H5P.OpenEndedQuestion 1.0"
        },
        "requiredField": true
      }
    ],
    "uiElements": {
      "buttonLabels": {
        "prevLabel": "Previous",
        "nextLabel": "Next",
        "submitLabel": "Submit"
      },
      "requiredMessage": "This question requires an answer"
    }
  };

  var $body = H5P.jQuery('body');
  let questionnaire;

  beforeEach(() => {
    const instance = jasmine.createSpyObj('instance', ['on']);
    const fakeInstanceElement = document.createElement('div');
    const subContentQuestion = document.createElement('div');
    subContentQuestion.className = 'h5p-subcontent-question';
    fakeInstanceElement.appendChild(subContentQuestion);
    spyOn(QuestionContent.prototype, 'getElement').and.returnValue(fakeInstanceElement);
    spyOn(H5P, 'newRunnable').and.returnValue(instance);
    questionnaire = new Questionnaire(params);
    questionnaire.attach($body);
  });

  // Check that attach is called
  it('should attach to the $wrapper', () => {
    let questionnaireElement = $body.get(0).querySelectorAll('.h5p-questionnaire');
    expect(questionnaireElement[0].parentNode).toBe($body.get(0));
  });

  // Check that all questionnaire elements are called with newRunnable
  it('should attach all questionnaire elements', () => {
    expect(H5P.newRunnable).toHaveBeenCalledTimes(3);
  });

  //TODO: Add test for reattaching content type
});

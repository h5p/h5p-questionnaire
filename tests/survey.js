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
          "taskDescription": "<p>What is your name ?<\/p>\n",
          "placeholderText": "Ola Nordmann",
          "inputFieldSize": "3",
          "requiredField": false
        },
        "library": "H5P.TextInputField 1.0"
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

  describe('State',() => {
    const event = {
      data: {
        state: 'state'
      }
    };

    beforeEach(() => {
      spyOn(survey, 'trigger');
      survey.state = survey.handleInstanceChanged(0, survey.state, event);
      survey.handleSubmit();
    });

    it('should submit state on submit button click', () => {
      expect(survey.state).toBe(survey.submittedState);
      expect(survey.trigger).toHaveBeenCalled();
    });

    it('should not submit the same state twice', () => {
      survey.handleSubmit();
      expect(survey.trigger).toHaveBeenCalledTimes(1);
    });

    it('should submit state when changed', () => {
      const newEvent = {
        data: {
          state: 'state'
        }
      };
      survey.state = survey.handleInstanceChanged(0, survey.state, newEvent);
      expect(survey.state).not.toBe(survey.submittedState);
      survey.handleSubmit();
      expect(survey.trigger).toHaveBeenCalledTimes(2);
    });
  });

  describe('Submit Button', () => {
    it('should create a button element with text', () => {
      const submitButton = survey.createSubmitButton('submitButton', () => {});
      expect(submitButton.textContent).toMatch('submitButton');
    });

    it('should trigger callback on click', () => {
      const clickCallback = jasmine.createSpy('clickCallback');
      const submitButton = survey.createSubmitButton('test', clickCallback);
      submitButton.click();
      expect(clickCallback).toHaveBeenCalled();
    });
  });

  describe('Survey element', () => {
    it('should create a survey element', () => {
      const surveyElement = survey.createSurveyElement({}, () => {});
      expect(surveyElement).toBeDefined();
    });
  });
});

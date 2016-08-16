/**
 * Created by thomasmars on 09.04.2016.
 */
import 'expose?H5P!exports?H5P!h5p-view';
import Questionnaire from '../scripts/questionnaire';

var params = require('../content/json/dev.json');

// Import testing dependencies
import '../content/libraries/font-awesome/h5p-font-awesome.min.css';
import OpenEndedQuestion from 'babel!../content/libraries/h5p-open-ended-question/src/scripts/open-ended-question';
import SimpleMultiChoice from 'babel!../content/libraries/h5p-simple-multiple-choice/src/scripts/simple-multiple-choice';
H5P.OpenEndedQuestion = OpenEndedQuestion;
H5P.SimpleMultiChoice = SimpleMultiChoice;

new Questionnaire(params).attach(H5P.jQuery('<div>').appendTo(H5P.jQuery('body')));


const smallerQuestionnaire = document.createElement('div');
smallerQuestionnaire.style.width = '250px';
smallerQuestionnaire.style.height = '400px';
smallerQuestionnaire.style.overflow = 'hidden';
document.body.appendChild(smallerQuestionnaire);
new Questionnaire(params).attach(H5P.jQuery('<div>').appendTo(smallerQuestionnaire));

// Create external event listener element

// const externalEventsElement = document.createElement('div');
// externalEventsElement.style.fontSize = '9px';
// document.body.appendChild(externalEventsElement);
// H5P.externalDispatcher.on('*', (event) => {
//   const eventElement = document.createElement('pre');
//   eventElement.innerHTML = JSON.stringify(event.data, null, 2);
//   externalEventsElement.appendChild(eventElement);
//
//   if (externalEventsElement.children.length > 1) {
//     const firstChild = externalEventsElement.children[0];
//     externalEventsElement.removeChild(firstChild);
//   }
// });

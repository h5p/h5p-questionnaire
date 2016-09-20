/**
 * Created by thomasmars on 09.04.2016.
 */
import 'expose?H5P!exports?H5P!h5p-view';
import Questionnaire from '../scripts/questionnaire';
import '../content/assets/domokun.png';

// Import testing dependencies
import '../content/libraries/font-awesome/h5p-font-awesome.min.css';
import OpenEndedQuestion from '../content/libraries/h5p-open-ended-question/src/scripts/open-ended-question';
import SimpleMultiChoice from '../content/libraries/h5p-simple-multiple-choice/src/scripts/simple-multiple-choice';
import 'imports?H5P=>window.H5P!../content/libraries/h5p-image/image';

H5P.OpenEndedQuestion = OpenEndedQuestion;
H5P.SimpleMultiChoice = SimpleMultiChoice;

// Fix for getting image path
H5P.getPath = (path) => {
  return path;
};

import params from '../content/json/dev.json';
import justOneQuestion from '../content/json/devJustOne.json';
import noSuccessScreenParams from '../content/json/devNoSuccessScreen.json';
import successScreenImageParams from '../content/json/devWithImage.json';
import emptyContentParams from '../content/json/emptyContent.json';

const standalone = document.createElement('div');
standalone.className = 'h5p-standalone';
document.body.appendChild(standalone);
new Questionnaire(params).attach(H5P.jQuery(standalone));

const justOne = document.createElement('div');
justOne.className = 'h5p-standalone';
document.body.appendChild(justOne);
new Questionnaire(justOneQuestion).attach(H5P.jQuery(justOne));

const smallerQuestionnaire = document.createElement('div');
smallerQuestionnaire.style.width = '300px';
smallerQuestionnaire.style.height = '400px';
smallerQuestionnaire.style.overflow = 'hidden';
document.body.appendChild(smallerQuestionnaire);
new Questionnaire(params).attach(H5P.jQuery(smallerQuestionnaire));

const noSuccessScreen = document.createElement('div');
document.body.appendChild(noSuccessScreen);
new Questionnaire(noSuccessScreenParams).attach(H5P.jQuery(noSuccessScreen));

const successScreenImage = document.createElement('div');
document.body.appendChild(successScreenImage);
new Questionnaire(successScreenImageParams).attach(H5P.jQuery(successScreenImage));


const successScreenImageSmall = document.createElement('div');
successScreenImageSmall.style.height = '200px';
successScreenImageSmall.style.width = '200px';
document.body.appendChild(successScreenImageSmall);
new Questionnaire(successScreenImageParams).attach(H5P.jQuery(successScreenImageSmall));


const emptyContent = document.createElement('div');
emptyContent.style.height = '200px';
emptyContent.style.width = '200px';
document.body.appendChild(emptyContent);
new Questionnaire(emptyContentParams).attach(H5P.jQuery(emptyContent));

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

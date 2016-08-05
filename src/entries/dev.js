/**
 * Created by thomasmars on 09.04.2016.
 */
import 'expose?H5P!exports?H5P!h5p-view';
import Survey from '../scripts/survey';

import 'file?name=[name].[ext]!../content/images/domokun.png';
// Override H5P.getPath
H5P.getPath = function (path) {
  return ('' + path);
};

var params = require('../content/json/dev.json');

// Import testing dependencies
import 'expose?H5P.Text!imports?H5P=>global.H5P!exports?H5P.Text!../content/libraries/h5p-text/scripts/text.js';
import 'style!css!../content/libraries/h5p-text/styles/text.css';
import 'expose?H5P.Image!imports?H5P=>global.H5P!exports?H5P.Image!../content/libraries/h5p-image/image.js';
import 'style!css!../content/libraries/h5p-image/image.css';
import 'expose?H5P.TextInputField!imports?H5P=>global.H5P!exports?H5P.TextInputField!../content/libraries/h5p-text-input-field/text-input-field';
import 'style!css!../content/libraries/h5p-text-input-field/text-input-field.css';

new Survey(params).attach(H5P.jQuery('<div>').appendTo(H5P.jQuery('body')));

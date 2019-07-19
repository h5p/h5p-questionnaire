import './styles/buttons.css';

export default class Utils {

  /**
   * Creates a button
   *
   * @param {string} text Button label
   * @param {string} type name used as className and eventName
   * @param {H5P.EventDispatcher} dispatcher
   *
   * @return {HTMLElement}
   */
  static createButton(text, type, dispatcher) {
    const button = Utils.createElement('button', {
      className: 'h5p-questionnaire-button ' + type,
      type: 'button',
      textContent: text
    });

    if (dispatcher) {
      button.addEventListener('click', () => {
        dispatcher.trigger(type);
      });
    }

    return button;
  }

  /**
   * Create HTMLElement
   *
   * @param {string} tagName
   * @param {Object} attributes
   *
   * @return {HTMLElement}
   */
  static createElement(tagName, attributes) {
    const element = document.createElement(tagName);

    Object.keys(attributes).forEach(key => {
      element[key] = attributes[key];
    });

    return element;
  }

  /**
   * Create an HTMLElement of type div
   *
   * @param {Object} attributes
   *
   * @return {HTMLElement}
   */
  static createDiv(attributes) {
    return Utils.createElement('div', attributes);
  }

  /**
   * Decode HTML encoded object properties.
   * @param {object} input Input object.
   */
  static htmlDecodeProperties(input) {
    for (let prop in input) {
      if (typeof input[prop] === 'string') {
        input[prop] = Utils.htmlDecode(input[prop]);
      }
      else if (typeof input[prop] === 'object') {
        Utils.htmlDecodeProperties(input[prop]);
      }
    }
  }

  /**
   * Retrieve true string from HTML encoded string.
   * @param {string} input Input string.
   * @return {string} Output string.
   */
  static htmlDecode(input) {
    var dparser = new DOMParser().parseFromString(input, 'text/html');
    return dparser.documentElement ? dparser.documentElement.textContent : '';
  }
}

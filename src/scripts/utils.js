import './styles/buttons.css';

export default class Utils {

  /**
   * Creates a button
   *
   * @param {string} label Button label in HTML
   * @param {string} type name used as className and eventName
   * @param {H5P.EventDispatcher} dispatcher
   *
   * @return {HTMLElement}
   */
  static createButton(label, type, dispatcher) {
    const button = Utils.createElement('button', {
      className: 'h5p-questionnaire-button ' + type,
      type: 'button',
      innerHTML: label
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
}

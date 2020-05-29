
import { make, on, applyStyleClasses } from "../aliases.js";
import { clamp } from "../math.js";

export class Knob {
  /**A knob for a deck
   * @param  {...string|undefined} classes css classes to apply
   */
  constructor() {
    /**@type {HTMLDivElement}*/
    this._element = make("div");

    /**@type {HTMLLabelElement} */
    this._label = make("label");
    this._element.appendChild(this._label);

    this._knobElement = make("div");
    this._element.appendChild(this._knobElement);

    this.initEvents();
    this.value(0);
    this.maxRotation();
    this.min(-Infinity);
    this.max(Infinity);
  }

  /**Appends this knob to parent
   * @param {HTMLElement}
   */
  mount (parent) {
    parent.appendChild(this._element);
    return this;
  }

  /**Apply styles to the element
   * @param  {...any} classes css classes
   */
  styleClasses(...classes) {
    applyStyleClasses(this._element, ...classes);
    return this;
  }

  /**Set the url background image and classes of the knob
   * @param {string} url
   * @param {...string} classes
   */
  knobStyle(url, ...classes) {
    this._knobElement.style["background-image"] = `url('${url}')`;
    this._knobElement.style["background-size"] = "auto 100%";
    this._knobElement.style["background-position"] = "50% 50%";
    this._knobElement.style["background-repeat"] = "no-repeat";
    applyStyleClasses(this._knobElement, ...classes);
    return this;
  }

  /**Set a label
   * @param {string} text
   * @param {...string} classes
   */
  label(text, ...classes) {
    this._label.textContent = text;
    applyStyleClasses(this._label, ...classes);
    return this;
  }

  /**Set full turn count
   * @param {number} maxRotations amount of full turns 
   */
  maxRotation(maxRotations = 1) {
    this._element.dataset.maxRotations = maxRotations;
    return this;
  }

  getMaxRotation () {
    return parseFloat(this._element.dataset.maxRotations);
  }

  /**Set the minimum value
   * @param {number} value 
   */
  min(value) {
    this._element.dataset.min = value;
    return this;
  }

  getMin () {
    return parseFloat(this._element.dataset.min);
  }
  /**Set the maximum value
   * @param {number} value 
   */
  max(value) {
    this._element.dataset.max = value;
    return this;
  }

  getMax () {
    return parseFloat(this._element.dataset.max);
  }

  value(value) {
    this._element.dataset.value = value;
    return this;
  }

  show () {
    this._element.style.display = "unset";
  }

  hide () {
    this._element.style.display = "none";
  }

  initEvents() {
    on(window, "mouseup", (evt) => {
      if (this._element.dataset.active === "true") {
        this._element.dataset.active = false;
      }
    });

    on(window, "mousemove", (evt) => {
      if (this._element.dataset.active === "true") {
        evt.preventDefault();

        let nv = parseFloat(this._element.dataset.value) - evt.movementX - evt.movementY;
        nv = clamp(nv, this.getMin(), this.getMax());
        let turns = (
          nv / (
            Math.abs(this.getMin()) + Math.abs(this.getMax())
          )
        ) * this.getMaxRotation();
        this._knobElement.style.transform = [`rotate(${turns}turn)`];
        this.value(nv);

        this._element.dispatchEvent(
          new CustomEvent("valuechange", {
            bubbles:true, detail:{
              value:nv
            }
          })
        );
      }
    });

    on(this._knobElement, "mousedown", (evt)=>{
    //on(this._element, "mousedown", (evt) => {
      this._element.dataset.active = "true";
    });
  }
  /**Listen to changes in value
   * @param {callback} callback called on change
   * @callback callback
   * @param {Event} value
   */
  onChange(callback) {
    on(this._element, "valuechange", callback);
    return this;
  }
}

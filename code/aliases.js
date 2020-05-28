//Get an element by its ID, alias
let get = (id) => document.getElementById(id);
let getByClass = (classname) => document.getElementsByClassName(classname);
//Get bounding rectangle, alias
let rect = (e) => e.getBoundingClientRect();
//Create an element, alias
let make = (type) => document.createElement(type);
/**
 * 
 * @param {Object} elem 
 * @param {*} type 
 * @param {callback} callback 
 * @param {object} options 
 */
let on = (elem, type, callback, options) => {
  if (!elem) console.trace("Null");
  elem.addEventListener(type, callback, options);
}

let clearChildren = (e)=>{
  while(e.lastChild) {
    e.lastChild.remove();
  }
}

/**Applies the props object key:values to o
 * @param {any} o 
 * @param {any} props 
 */
let setProps = (o, props)=>{
  for (let key in props) {
    o[key] = props[key];
  }
}

/**Apply classes to an element
 * @param {HTMLElement} e Element to apply to
 * @param  {...string} classes classes to apply
 */
let applyStyleClasses = (e, ...classes) => {
  if (!classes) return;
  for (let c of classes) {
    e.classList.add(c);
  }
}

export { get, getByClass, rect, make, on, clearChildren, setProps, applyStyleClasses };


import { Renderer } from "./wuaw.js";
import { get, on } from "./aliases.js";
import { Node } from "./node.js";

let canvas = get("canvas");
/**@type {Renderer} */
let renderer = new Renderer(canvas, true, 1);

on(canvas, "wheel", (evt) => {
  evt.preventDefault();
  renderer.onEvent({type:"wheel", delta:evt.deltaY});
});

let mouse = {
  left: false,
  right: false
};

on(window, "contextmenu", (evt) => {
  evt.preventDefault();
  let e = {
    type:"select-node",
    node:renderer.selectNode()
  };
  if (!e.node) e.type = "deselect-node";
  
  if (evt.ctrlKey) e.type = "add-select-node";

  renderer.onEvent(e);
});

on(window, "mousedown", (evt) => {
  if (evt.target === canvas) {
    if (evt.button === 0) mouse.left = true;
    if (evt.button === 1) mouse.right = true;
    renderer.mouseDown();
  }
});
on(window, "mouseup", (evt) => {
  if (evt.button === 0) mouse.left = false;
  if (evt.button === 1) mouse.right = false;
  renderer.mouseUp();
});

on(window, "mousemove", (evt) => {
  renderer.setCursor(evt.layerX, evt.layerY);
  if (mouse.left) {
    //Added option for holding alt while dragging to move scene instead
    renderer.mouseDrag(
      -evt.movementX / renderer.zoom,
      -evt.movementY / renderer.zoom,
      evt.altKey
    );
  }
});

let audioCtx = new AudioContext();
let drawCtx = renderer.ctx;

let destNode = new Node(drawCtx, audioCtx, "destination");
destNode.setPos(renderer.centerX, renderer.centerY);
renderer.nodes.push(destNode);
renderer.needsRender = true;

let createNode = (type) => {
  let node = new Node(drawCtx, audioCtx, type);
  node.setPos(renderer.centerX, renderer.centerY);

  renderer.nodes.push(node);

  renderer.needsRender = true;
}

on(get("node-create-analyser"), "click", () => createNode("analyser"));
on(get("node-create-biquadfilter"), "click", () => createNode("biquadfilter"));
on(get("node-create-constant"), "click", () => createNode("constant"));
on(get("node-create-convolver"), "click", () => createNode("convolver"));
on(get("node-create-delay"), "click", () => createNode("delay"));
on(get("node-create-dynamicscompressor"), "click", () => createNode("dynamicscompressor"));
on(get("node-create-gain"), "click", () => createNode("gain"));
on(get("node-create-iirfilter"), "click", () => createNode("iirfilter"));
on(get("node-create-mediaelementsource"), "click", () => createNode("mediaelementsource"));
on(get("node-create-mediastreamdestination"), "click", () => createNode("mediastreamdestination"));
on(get("node-create-mediastreamsource"), "click", () => createNode("mediastreamsource"));
on(get("node-create-mediastreamtracksource"), "click", () => createNode("mediastreamtracksource"));
on(get("node-create-oscillator"), "click", () => createNode("oscillator"));
on(get("node-create-panner"), "click", () => createNode("panner"));
on(get("node-create-periodicwave"), "click", () => createNode("periodicwave"));
on(get("node-create-scriptprocessor"), "click", () => createNode("scriptprocessor"));
on(get("node-create-stereopanner"), "click", () => createNode("stereopanner"));
on(get("node-create-waveshaper"), "click", () => createNode("waveshaper"));
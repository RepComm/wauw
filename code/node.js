
import { make } from "./aliases.js";

/**Modified from https://stackoverflow.com/a/3368118
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} w
 * @param {Number} h
 * @param {Number} x
 * @param {Number} y
 * @param {Number|{topLeft:Number,topRight:Number,bottomRight:Number,bottomLeft:Number}} radius
 */
function roundRect(ctx, x, y, width, height, radius) {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    let defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }

  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
}

const nodeTextPadding = 0.1;

class Node {
  /**@param {CanvasRenderingContext2D} drawCtx
   * @param {AudioContext} audioCtx
   * @param {"analyser"|"biquadfilter"|"constant"|"convolver"|"delay"|"dynamicscompressor"|"gain"|"iirfilter"|"mediaelementsource"|"mediastreamdestination"|"mediastreamsource"|"mediastreamtracksource"|"oscillator"|"panner"|"periodicwave"|"scriptprocessor"|"stereopanner"|"waveshaper"} type
   * @param {String} name
   */
  constructor(drawCtx, audioCtx, type, name) {
    this.color = "#565656";
    this.outputColor = "#00aaff";
    this.inputColor = "#ff00ff";
    this.type = type;

    //Extra data can be stored in meta
    this.meta = {};

    this.name = name;
    if (!this.name) this.name = this.type;
    this.drawCtx = drawCtx;
    this.x = 0;
    this.y = 0;

    this.fontFamily = "Arial";
    this.fontSize = 0.25;

    this.font = this.fontSize + "px " + this.fontFamily;
    this.drawCtx.font = this.font;

    let metrics = this.drawCtx.measureText(this.name);
    this.w = metrics.width + nodeTextPadding * 2;
    this.h = this.fontSize * 2;

    /**@type {AudioNode} */
    this.node;
    this.audioCtx = audioCtx;

    switch (this.type) {
      case "analyser":
        this.node = audioCtx.createAnalyser();
        break;
      case "biquadfilter":
        this.node = audioCtx.createBiquadFilter();
        break;
      case "constant":
        this.node = audioCtx.createConstantSource();
        break;
      case "convolver":
        this.node = audioCtx.createConvolver();
        break;
      case "delay":
        this.node = audioCtx.createDelay();
        break;
      case "dynamicscompressor":
        this.node = audioCtx.createDynamicsCompressor();
        break;
      case "gain":
        this.node = audioCtx.createGain();
        break;
      case "iirfilter":
        throw "Not implemented";
        //this.node = audioCtx.createIIRFilter();
        break;
      case "mediaelementsource":
        this.meta.element = make("audio");
        this.meta.element.controls = true;
        this.meta.element.classList.add("mediasource-config");
        this.node = audioCtx.createMediaElementSource(this.meta.element);
        break;
      case "mediastreamdestination":
        this.node = audioCtx.createMediaStreamDestination();
        break;
      case "mediastreamsource":
        this.node = audioCtx.createMediaStreamSource();
        break;
      case "mediastreamtracksource":
        this.node = audioCtx.createMediaStreamTrackSource();
        break;
      case "oscillator":
        this.node = audioCtx.createOscillator();
        break;
      case "panner":
        this.node = audioCtx.createPanner();
        break;
      case "periodicwave":
        this.node = audioCtx.createPeriodicWave();
        break;
      case "scriptprocessor":
        // /**@type {ScriptProcessorNode}*/
        this.node = audioCtx.createScriptProcessor();
        break;
      case "stereopanner":
        this.node = audioCtx.createStereoPanner();
        break;
      case "waveshaper":
        /**@type {WaveShaperNode}*/
        this.node = audioCtx.createWaveShaper();
        break;
      default:
        throw "Node type " + this.type + " is not handled!";
    }
    this.node.element = this;
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  pointInside(x, y) {
    return (
      x > this.x && x < this.x + this.w &&
      y > this.y && y < this.y + this.h
    );
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Node} node 
   */
  static render(ctx, node) {
    //ctx.beginPath();
    roundRect(ctx, 0, 0, node.w, node.h, 0.1);
    //ctx.rect(0, 0, node.w, node.h);
    //ctx.closePath();

    ctx.fillStyle = node.color;
    ctx.fill();

    let outs = node.node.numberOfOutputs;
    let outSize = 1 / outs * node.h;
    let padSize = outSize / 16;

    for (let i = 0; i < node.node.numberOfOutputs; i++) {
      ctx.fillStyle = node.outputColor;
      let nx = node.w;
      let ny = i * outSize + padSize;
      let nw = padSize * outs * 3;
      let nh = outSize - padSize * 2;
      roundRect(ctx, nx, ny, nw, nh, 0.25 * nw);
      ctx.fill();
    }

    let ins = node.node.numberOfOutputs;
    let inSize = 1 / ins * node.h;
    padSize = inSize / 16;

    for (let i = 0; i < node.node.numberOfInputs; i++) {
      ctx.fillStyle = node.inputColor;
      let nx = -padSize * ins * 3;
      let ny = i * inSize + padSize;

      let nw = padSize * ins * 3;
      let nh = inSize - padSize * 2;
      roundRect(ctx, nx, ny, nw, nh, 0.25 * nw);
      ctx.fill();
    }

    ctx.fillStyle = "white";
    ctx.font = node.font;
    ctx.fillText(node.name, nodeTextPadding, node.fontSize * 1.25);
  }
}

export { Node };

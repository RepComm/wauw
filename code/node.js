
import { make, on } from "./aliases.js";

import { Utils } from "./math.js";

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

    this.name = name;
    if (!this.name) this.name = this.type;

    /**@type {Array<Node>}*/
    this.outputNodes = new Array();

    //HTML element for controls
    /**@type {HTMLDivElement} Gets appended to .node-config-panel*/
    this.element = make("div");
    this.element.classList.add("node-config-panel");

    /**@type {HTMLSpanElement} Title span of the node*/
    this.elementTitle = make("span");
    this.elementTitle.classList.add("node-config-title", "node-controls-colors");
    this.elementTitle.textContent = this.name;
    this.element.appendChild(this.elementTitle);

    /**@type {HTMLDivElement} Container for the controls for this node*/
    this.elementControls = make("div");
    this.elementControls.classList.add("node-config-controls");
    this.element.appendChild(this.elementControls);

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
        let offsetSlider = make("input");
        offsetSlider.classList.add("node-config-slider", "node-controls-colors");
        offsetSlider.type = "range";
        offsetSlider.name = "Amount";
        offsetSlider.min = 0;
        offsetSlider.max = 1;
        offsetSlider.value = this.node.offset.value;
        offsetSlider.step = 0.05;
        on(offsetSlider, "change", (evt) => {
          this.node.offset.value = parseFloat(offsetSlider.value);
        });
        this.elementControls.appendChild(offsetSlider);
        break;
      case "convolver":
        this.node = audioCtx.createConvolver();
        break;
      case "delay":
        this.node = audioCtx.createDelay();
        let delayNum = make("input");
        delayNum.classList.add("node-config-slider", "node-controls-colors");
        delayNum.type = "range";
        delayNum.name = "Amount";
        delayNum.min = 0;
        delayNum.max = 1;
        delayNum.value = this.node.delayTime.value;
        delayNum.step = 0.05;
        on(delayNum, "change", (evt) => {
          this.node.delayTime.value = parseFloat(delayNum.value);
        });
        this.elementControls.appendChild(delayNum);
        break;
      case "dynamicscompressor":
        this.node = audioCtx.createDynamicsCompressor();
        break;
      case "gain":
        this.node = audioCtx.createGain();
        let gainSlider = make("input");
        gainSlider.classList.add("node-config-slider", "node-controls-colors");
        gainSlider.type = "range";
        gainSlider.name = "Amount";
        gainSlider.min = 0;
        gainSlider.max = 1;
        gainSlider.value = this.node.gain.value;
        gainSlider.step = 0.05;
        on(gainSlider, "change", (evt) => {
          this.node.gain.value = parseFloat(gainSlider.value);
        });
        this.elementControls.appendChild(gainSlider);
        break;
      case "iirfilter":
        throw "Not implemented";
        //this.node = audioCtx.createIIRFilter();
        break;
      case "mediaelementsource":
        let audioElement = make("audio");
        audioElement.controls = true;
        audioElement.classList.add("node-config-mediasource", "node-controls-colors");
        this.elementControls.appendChild(audioElement);

        this.node = audioCtx.createMediaElementSource(audioElement);
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
        let freqSlider = make("input");
        freqSlider.classList.add("node-config-number", "node-controls-colors");
        freqSlider.type = "number";
        freqSlider.name = "Amount";
        freqSlider.min = 0;
        freqSlider.max = this.node.frequency.maxValue / 4;
        freqSlider.value = this.node.frequency.value;
        freqSlider.step = 0.05;
        on(freqSlider, "change", (evt) => {
          this.node.frequency.value = parseFloat(freqSlider.value);
        });
        this.elementControls.appendChild(freqSlider);
        break;
      case "panner":
        this.node = audioCtx.createPanner();
        break;
      // case "periodicwave":
      //   this.node = audioCtx.createPeriodicWave();
      //   break;
      case "scriptprocessor":
        // /**@type {ScriptProcessorNode}*/
        this.node = audioCtx.createScriptProcessor();
        break;
      case "stereopanner":
        this.node = audioCtx.createStereoPanner();
        let panSlider = make("input");
        panSlider.classList.add("node-config-slider", "node-controls-colors");
        panSlider.type = "range";
        panSlider.name = "Amount";
        panSlider.min = -1;
        panSlider.max = 1;
        panSlider.value = this.node.pan.value;
        panSlider.step = 0.05;
        on(panSlider, "change", (evt) => {
          this.node.pan.value = parseFloat(panSlider.value);
        });
        this.elementControls.appendChild(panSlider);
        break;
      case "waveshaper":
        this.node = audioCtx.createWaveShaper();
        break;
      case "destination":
        this.node = audioCtx.destination;
        break;
      default:
        throw "Node type " + this.type + " is not handled!";
    }
    if (this.node.start) {
      this.node.start();
    }
    this.node.element = this;
  }

  isConnected(to) {
    return this.outputNodes.includes(to);
  }

  /**Connect this to the input of another
   * @param {Node} to
   * @returns {boolean} true if successful
   */
  connect(to) {
    if (this.isConnected(to)) {
      return false;
    }
    this.node.connect(to.node);
    this.outputNodes.push(to);
    return true;
  }

  /**Disconnect from another node
   * @param {Node} to 
   * @returns {boolean} successful
   */
  disconnect(to) {
    let ind = this.outputNodes.indexOf(to);
    if (ind === -1) return false;
    this.node.disconnect(to.node);
    this.outputNodes.splice(ind, 1);
    return true;
  }

  hasOutput(i) {
    return i < this.outputNodes.length && i >= 0;
  }

  moveBy(xa, ya, snap = 0) {
    this.setPos(this.x + xa, this.y + ya, snap);
  }

  snapTo(snap = 0.1) {
    this.x = Utils.roundTo(this.x, snap);
    this.y = Utils.roundTo(this.y, snap);
  }

  setPos(x, y, snap = 0) {
    if (snap !== 0) {
      this.x = Utils.roundTo(x, snap);
      this.y = Utils.roundTo(y, snap);
    } else {
      this.x = x;
      this.y = y;
    }
  }

  pointInside(x, y) {
    x += this.w / 2;
    y += this.h / 2;
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
    ctx.save();

    //let outs = node.node.numberOfOutputs;
    let outs = node.outputNodes.length;
    if (outs < node.node.numberOfOutputs) outs = node.node.numberOfOutputs;

    let outSize = 1 / outs * node.h;
    let padSize = outSize / 16;
    
    for (let i = 0; i < outs; i++) {
      //for (let i = 0; i < node.node.numberOfOutputs; i++) {
      ctx.fillStyle = node.outputColor;
      let nx = node.x + node.w / 2;
      let ny = node.y - node.h / 2 + (i * outSize + padSize);
      let nw = padSize * outs * 3;
      let nh = outSize - padSize * 2;

      if (node.hasOutput(i)) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(nx + nw, ny + nh / 2);
        let other = node.outputNodes[i];
        ctx.lineTo(other.x - other.w / 2 - nw, other.y);
        ctx.closePath();
        ctx.lineWidth *= 4;
        ctx.stroke();
        ctx.restore();
      }

      roundRect(ctx, nx, ny, nw, nh, 0.25 * nw);
      ctx.fill();
    }

    roundRect(ctx, node.x - node.w / 2, node.y - node.h / 2, node.w, node.h, 0.1);

    ctx.fillStyle = node.color;
    ctx.fill();

    let ins = node.node.numberOfInputs;
    let inSize = 1 / ins * node.h;
    padSize = inSize / 16;

    for (let i = 0; i < node.node.numberOfInputs; i++) {
      ctx.fillStyle = node.inputColor;
      let nx = node.x - node.w / 2 + (-padSize * ins * 3);
      let ny = node.y - node.h / 2 + (i * inSize + padSize);

      let nw = padSize * ins * 3;
      let nh = inSize - padSize * 2;
      roundRect(ctx, nx, ny, nw, nh, 0.25 * nw);
      ctx.fill();
    }

    ctx.fillStyle = "white";
    ctx.font = node.font;
    ctx.fillText(
      node.name,
      node.x - node.w / 2 + nodeTextPadding,
      node.y - node.h / 2 + (node.fontSize * 1.25)
    );
    ctx.restore();
  }
}

export { Node };


import { make, on, setProps } from "./aliases.js";

import { Utils, roundRect, isAnyOf } from "./math.js";
import { Knob } from "./ui/knob.js";

const nodeTextPadding = 0.1;

class Node {
  /**@param {CanvasRenderingContext2D} drawCtx
   * @param {AudioContext} audioCtx
   * @param {"keyboard"|"analyser"|"biquadfilter"|"constant"|"convolver"|"delay"|"dynamicscompressor"|"gain"|"iirfilter"|"mediaelementsource"|"mediastreamdestination"|"mediastreamsource"|"mediastreamtracksource"|"oscillator"|"panner"|"periodicwave"|"scriptprocessor"|"stereopanner"|"waveshaper"} type
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
    this.elementTitle.classList.add("node-config-title");
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

    let label;

    switch (this.type) {
      case "analyser":
        this.node = audioCtx.createAnalyser();
        break;
      case "biquadfilter":
        this.node = audioCtx.createBiquadFilter();

        let freqCtrl = new Knob()
          .label("Frequency", "node-config-knob-label")
          .min(0)
          .max(this.node.frequency.maxValue / 8)
          .maxRotation(2)
          .onChange((evt)=>{
            this.node.frequency.value = evt.detail.value;
          })
          .styleClasses("node-config-knob")
          .knobStyle("./textures/knob01.svg", "node-config-knob-control")
          .mount(this.elementControls);

        
        let detuneCtrl = new Knob()
          .label("Detune (cents)", "node-config-knob-label")
          .min(-440)
          .max(440)
          .maxRotation(0.5)
          .onChange((evt)=>{
            this.node.detune.value = evt.detail.value;
          })
          .styleClasses("node-config-knob")
          .knobStyle("./textures/knob01.svg", "node-config-knob-control")
          .mount(this.elementControls);
        
        let qCtrl = new Knob()
          .label("Q (quality)", "node-config-knob-label")
          .min(0.0001)
          .max(1000)
          .maxRotation(3)
          .onChange((evt)=>{
            this.node.Q.value = evt.detail.value;
          })
          .styleClasses("node-config-knob")
          .knobStyle("./textures/knob01.svg", "node-config-knob-control")
          .mount(this.elementControls);
        
        
        let bGainCtrl = new Knob()
          .label("Gain (dB)", "node-config-knob-label")
          .min(-40)
          .max(40)
          .maxRotation(0.75)
          .onChange((evt)=>{
            this.node.gain.value = evt.detail.value;
          })
          .styleClasses("node-config-knob")
          .knobStyle("./textures/knob01.svg", "node-config-knob-control")
          .mount(this.elementControls);

        //BIQUAD FILTER TYPE
        label = make("label");
        label.textContent = "filter type";
        this.elementControls.appendChild(label);

        let filterCtrl = make("select");
        filterCtrl.classList.add("node-config-select");
        setProps(filterCtrl, {
          name:"filter type",
          value:this.node.type.value
        });
        let filterOptionCtrl = make("option");
        setProps(filterOptionCtrl, {
          value:"lowpass",
          textContent:"lowpass"
        });
        filterCtrl.appendChild(filterOptionCtrl);

        filterOptionCtrl = make("option");
        setProps(filterOptionCtrl, {
          value:"highpass",
          textContent:"highpass"
        });
        filterCtrl.appendChild(filterOptionCtrl);

        filterOptionCtrl = make("option");
        setProps(filterOptionCtrl, {
          value:"bandpass",
          textContent:"bandpass"
        });
        filterCtrl.appendChild(filterOptionCtrl);

        filterOptionCtrl = make("option");
        setProps(filterOptionCtrl, {
          value:"lowshelf",
          textContent:"lowshelf"
        });
        filterCtrl.appendChild(filterOptionCtrl);

        filterOptionCtrl = make("option");
        setProps(filterOptionCtrl, {
          value:"highshelf",
          textContent:"highshelf"
        });
        filterCtrl.appendChild(filterOptionCtrl);

        filterOptionCtrl = make("option");
        setProps(filterOptionCtrl, {
          value:"peaking",
          textContent:"peaking"
        });
        filterCtrl.appendChild(filterOptionCtrl);

        filterOptionCtrl = make("option");
        setProps(filterOptionCtrl, {
          value:"notch",
          textContent:"notch"
        });
        filterCtrl.appendChild(filterOptionCtrl);

        filterOptionCtrl = make("option");
        setProps(filterOptionCtrl, {
          value:"allpass",
          textContent:"allpass"
        });
        filterCtrl.appendChild(filterOptionCtrl);

        on(filterCtrl, "change", (evt)=>{
          if (isAnyOf(filterCtrl.value, [
            "lowpass", "highpass", "bandpass"
          ])) {
            bGainCtrl.hide();
          } else {
            bGainCtrl.show();
          }

          if (isAnyOf(filterCtrl.value, [
            "lowshelf", "highshelf"
          ])) {
            qCtrl.hide();
          } else {
            qCtrl.show();
          }
          this.node.type = filterCtrl.value;
        });
        this.elementControls.appendChild(filterCtrl);

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
        label = make("label");
        label.textContent = "Delay (s)";
        this.elementControls.appendChild(label);

        let delayNum = make("input");
        delayNum.classList.add("node-config-number", "node-controls-colors");
        delayNum.type = "number";
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

        let bGainCtrl0 = new Knob()
          .label("Gain (dB)", "node-config-knob-label")
          .min(0)
          .max(1)
          .maxRotation(0.5)
          .onChange((evt)=>{
            this.node.gain.value = evt.detail.value;
          })
          .styleClasses("node-config-knob")
          .knobStyle("./textures/knob01.svg", "node-config-knob-control")
          .mount(this.elementControls);
        break;
      case "iirfilter":
        throw "Not implemented";
        //this.node = audioCtx.createIIRFilter();
        break;
      case "mediaelementsource":
        label = make("label");
        label.textContent = "Controls";
        this.elementControls.appendChild(label);

        let audioElement = make("audio");
        audioElement.controls = true;
        audioElement.classList.add("node-config-mediasource", "node-controls-colors");
        this.elementControls.appendChild(audioElement);

        label = make("label");
        label.textContent = "Source";
        this.elementControls.appendChild(label);

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

        let freqCtrl1 = new Knob()
          .label("Frequency", "node-config-knob-label")
          .min(0)
          .max(this.node.frequency.maxValue / 8)
          .maxRotation(2)
          .onChange((evt)=>{
            console.log(evt.detail.value);
            this.node.frequency.value = evt.detail.value;
          })
          .styleClasses("node-config-knob")
          .knobStyle("./textures/knob01.svg", "node-config-knob-control")
          .mount(this.elementControls);

        label = make("label");
        label.textContent = "wave type";
        this.elementControls.appendChild(label);

        let waveSelect = make("select");
        waveSelect.classList.add("node-config-select");
        setProps(waveSelect, {
          name:"wave type",
          value:"sine"
        });
        let waveSelectSine = make("option");
        setProps(waveSelectSine, {
          value:"sine",
          textContent:"sine"
        });
        waveSelect.appendChild(waveSelectSine);

        let waveSelectSquare = make("option");
        setProps(waveSelectSquare, {
          value:"square",
          textContent:"square"
        });
        waveSelect.appendChild(waveSelectSquare);

        let waveSelectSaw = make("option");
        setProps(waveSelectSaw, {
          value:"sawtooth",
          textContent:"sawtooth"
        });
        waveSelect.appendChild(waveSelectSaw);

        let waveSelectTri = make("option");
        setProps(waveSelectTri, {
          value:"triangle",
          textContent:"triangle"
        });
        waveSelect.appendChild(waveSelectTri);

        on(waveSelect, "change", (evt)=>{
          this.node.type = waveSelect.value;
        });
        this.elementControls.appendChild(waveSelect);

        let detuneCtrl0 = new Knob()
          .label("Detune (cents)", "node-config-knob-label")
          .min(440*-4)
          .max(440*4)
          .maxRotation(2)
          .onChange((evt)=>{
            this.node.detune.value = evt.detail.value;
          })
          .styleClasses("node-config-knob")
          .knobStyle("./textures/knob01.svg", "node-config-knob-control")
          .mount(this.elementControls);
        break;
      case "panner":
        this.node = audioCtx.createPanner();
        break;
      case "scriptprocessor":
        this.node = audioCtx.createScriptProcessor();
        break;
      case "stereopanner":
        this.node = audioCtx.createStereoPanner();
        label = make("label");
        label.textContent = "Pan (L R)";
        this.elementControls.appendChild(label);

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
        label = make("label");
        label.textContent = "Audio Output";
        this.elementControls.appendChild(label);
        break;
      case "keyboard":
        
        break;
      default:
        throw "Node type " + this.type + " is not handled!";
    }
    if (this.node) {
      if (this.node.start) {
        this.node.start();
      }
      this.node.element = this;
    }
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
    if (to.node && to.node instanceof AudioNode && to.node !== this.node) {
      this.node.connect(to.node);
      this.outputNodes.push(to);
    }
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

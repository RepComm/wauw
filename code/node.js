
class Node {
    /**@param {CanvasRenderingContext2D} drawCtx
     * @param {AudioContext} audioCtx
     * @param {"analyser"|"biquadfilter"|"constant"|"convolver"|"delay"|"dynamicscompressor"|"gain"|"iirfilter"|"mediaelementsource"|"mediastreamdestination"|"mediastreamsource"|"mediastreamtracksource"|"oscillator"|"panner"|"periodicwave"|"scriptprocessor"|"stereopanner"|"waveshaper"} type
     * @param {String} name
     */
    constructor (drawCtx, audioCtx, type, name) {
        this.color = "#ffffff55";
        this.outputColor = "#00aaff";
        this.inputColor = "#ff00ff";
        this.type = type;
        
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
        this.w = metrics.width;
        this.h = this.fontSize*2;

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
                this.node = audioCtx.createIIRFilter();
                break;
            case "mediaelementsource":
                this.node = audioCtx.createMediaElementSource();
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
                this.node = audioCtx.createScriptProcessor();
                break;
            case "stereopanner":
                this.node = audioCtx.createStereoPanner();
                break;
            case "waveshaper":
                this.node = audioCtx.createWaveShaper();
                break;
            default:
                throw "Node type " + this.type + " is not handled!";
        }
        this.node.element = this;
    }

    setPos (x, y) {
        this.x = x;
        this.y = y;
    }

    pointInside (x, y) {
        return (
            x > this.x && x < this.x + this.w &&
            y > this.y && y < this.y + this.h
        );
    }

    render () {
        this.drawCtx.beginPath();
        this.drawCtx.rect(0, 0, this.w, this.h);
        this.drawCtx.closePath();

        this.drawCtx.fillStyle = this.color;
        this.drawCtx.fill();

        let outs = this.node.numberOfOutputs;
        let outSize = 1/outs * this.h;
        let padSize = outSize/16;

        for (let i=0; i<this.node.numberOfOutputs; i++) {
            this.drawCtx.fillStyle = this.outputColor;
            this.drawCtx.fillRect(
                this.w,
                i * outSize + padSize,
                padSize,
                outSize - padSize*2
            );
        }

        let ins = this.node.numberOfOutputs;
        let inSize = 1/ins * this.h;
        padSize = inSize/16;

        //this.drawCtx.beginPath();
        for (let i=0; i<this.node.numberOfInputs; i++) {
            this.drawCtx.fillStyle = this.inputColor;
            this.drawCtx.fillRect(
                -padSize,
                i * inSize + padSize,
                padSize,
                inSize - padSize*2
            );
            //this.drawCtx.ellipse(-padSize, i * inSize + padSize, padSize, padSize, 0, 0, Math.PI*2);
        }
        // this.drawCtx.closePath();
        // this.drawCtx.fillStyle = this.inputColor;
        // this.drawCtx.fill();

        this.drawCtx.fillStyle = "white";
        this.drawCtx.font = this.font;
        this.drawCtx.fillText(this.name, 0, this.fontSize);
    }
}

export { Node };

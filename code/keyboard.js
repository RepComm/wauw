
import { Node } from "./node.js";
import { lerp, pointInRect, roundRect } from "./math.js";

let twelthRootTwo = 1.059463094359;
let A4 = 440;

let scale = {
  A:0,
  AsBb:1,
  B:2,
  C:3,
  CsDb:4,
  D:5,
  DsEb:6,
  E:7,
  F:8,
  FsGb:9,
  G:10,
  GsAb:11
};

let blackNotes = [
  scale.AsBb,
  scale.CsDb,
  scale.DsEb,
  scale.FsGb,
  scale.GsAb
];

let blackToWhiteRatio = 12 / 7;

export function stepsToFreq (halfSteps, fromFreq=A4) {
  return fromFreq * Math.pow(twelthRootTwo, halfSteps);
}

export function noteToFreq (halfSteps, moreOctaves=0, fromFreq=A4) {
  return stepsToFreq(halfSteps + (moreOctaves*12), fromFreq);
}

export class KeyboardDisplay extends Node {
  /**@param {CanvasRenderingContext2D} drawCtx
   * @param {AudioContext} audioCtx
   * @param {String} name
   */
  constructor (drawCtx, audioCtx, name) {
    super(drawCtx, audioCtx, "keyboard");
    this.range = 24;
    this.w = 6;
    this.h = 1;
    this.blackNoteHeight = 0.75;

    this.headerHeight = 0.5;
  }

  /**@param {CanvasRenderingContext2D} drawCtx 
   */
  render () {
    this.drawCtx.save();

    this.drawCtx.fillStyle = this.color;
    roundRect(
      this.drawCtx,
      this.x,
      this.y - this.headerHeight,
      this.w,
      this.h + this.headerHeight,
      0.1
    );
    this.drawCtx.fill();

    let nx = this.x;
    let ny = this.y;
    let nw = 0;
    let nh = this.h;

    let blackNoteColor = "#333355";
    let whiteNoteColor = "#aaaaff";

    let noteWidth = lerp(0, this.w, (1/this.range) * blackToWhiteRatio );

    let note = 0;

    //Render white notes
    for (let i=0; i<this.range; i++) {
      note = i % 12;
      // while (note > 11) {
      //   note -= 11;
      // }

      nw = noteWidth;

      if (blackNotes.includes(note)) {
        
      } else {
        nh = this.h;
        this.drawCtx.fillStyle = whiteNoteColor;

        this.drawCtx.fillRect(nx, ny, nw, nh);
        this.drawCtx.strokeStyle = "black";
        this.drawCtx.strokeRect(nx, ny, nw, nh);

        nx += noteWidth;
      }
    }

    nx = this.x;

    for (let i=0; i<this.range; i++) {

      note = i % 12;

      nw = noteWidth;

      if (blackNotes.includes(note)) {
        nx -= noteWidth / 2;
        this.drawCtx.fillStyle = blackNoteColor;
        nh = this.h * this.blackNoteHeight;

        nw *= 0.5;

        this.drawCtx.fillRect(nx + (nw/2), ny, nw, nh);
        this.drawCtx.strokeStyle = "black";
        this.drawCtx.strokeRect(nx + (nw/2), ny, nw, nh);

        nx += noteWidth / 2;
      } else {
        nx += noteWidth;
      }
    }
    this.drawCtx.restore();
  }

  getNoteForPosition (x, y) {
    let localy = (y - this.y) / this.h;
    let nx = this.x;

    let noteWidth = lerp(0, this.w, (1/this.range) * blackToWhiteRatio );
    let halfNoteWidth = noteWidth / 2;

    let localnote = 0;

    for (let note=0; note<this.range; note++) {
      localnote = note % 12;
      
      //Look ahead by adding 1 and clipping to range of 12
      let blackNoteLookAhead = (localnote + 1) % 12;

      // Test for intersection of left half of black note
      if (blackNotes.includes( blackNoteLookAhead )) {
        if (x > nx + halfNoteWidth && x < nx + noteWidth && localy < this.blackNoteHeight) {

          console.log("Black", note+1);
          return note+1;
        }
      } else if (blackNotes.includes(localnote)) {
        //Test for intersection of right half of black note
        if (x > nx && x < nx + halfNoteWidth && localy < this.blackNoteHeight) {

          console.log("Black", note);
          return note;
        }
        note++;
        localnote = note % 12;
      }

      // Test intersection of white note
      if (x > nx && x < nx + noteWidth) {
        console.log("White", note);
        return note;
      }
      nx += noteWidth;
    }

    return -1;
  }

  /**For dragging nodes collision checking
   * @override
   * @param {Number} x 
   * @param {Number} y 
   */
  pointInside (x, y) {
    return pointInRect(
      x,
      y,
      this.x,
      this.y - this.headerHeight,
      this.w,
      this.headerHeight
    );
  }

  pointInsidePiano (x, y) {
    return pointInRect(
      x,
      y,
      this.x,
      this.y,
      this.w,
      this.h
    )
  }

  onEvent (evt) {
    if (evt.type === "mouse-down") {
      let note = this.getNoteForPosition(evt.x, evt.y);
      
      let freq = stepsToFreq(note);

      for (let out of this.outputNodes) {
        if (out.node) {
          if (out.node instanceof GainNode) {
            out.node.gain.value = 0.5;
          } else if (out.node instanceof OscillatorNode) {
            out.node.frequency.value = freq;
          }
        }
      }
      if (this.osc) {
        this.osc.frequency.value = freq;
      }
    } else if (evt.type === "mouse-up") {
      for (let out of this.outputNodes) {
        if (out.node) {
          if (out.node instanceof GainNode) {
            out.node.gain.value = 0.0;
          }
        }
      }
    }
  }

  /**Check if we're connected to another node
   * @override
   * @param {Node} to 
   */
  isConnected(to) {
    return this.outputNodes.includes(to);
  }

  /**Connect this to the input of another
   * @override
   * @param {Node} to
   * @returns {boolean} true if successful
   */
  connect(to) {
    if (this.isConnected(to)) {
      return false;
    }
    //this.node.connect(to.node);
    this.outputNodes.push(to);
    return true;
  }

  /**Disconnect from another node
   * @override
   * @param {Node} to 
   * @returns {boolean} successful
   */
  disconnect(to) {
    let ind = this.outputNodes.indexOf(to);
    if (ind === -1) return false;
    //this.node.disconnect(to.node);
    this.outputNodes.splice(ind, 1);
    return true;
  }

  /**Check if output index is in range of our output node array
   * @override
   * @param {Number} i 
   */
  hasOutput(i) {
    return i < this.outputNodes.length && i >= 0;
  }
}

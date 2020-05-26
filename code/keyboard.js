
import { lerp, isAnyOf } from "./math.js";

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

export function stepsToFreq (halfSteps, fromFreq=A4) {
  return fromFreq * Math.pow(twelthRootTwo, halfSteps);
}

export function noteToFreq (halfSteps, moreOctaves=0, fromFreq=A4) {
  return stepsToFreq(halfSteps + (moreOctaves*12), fromFreq);
}

export class KeyboardDisplay {
  constructor () {
    this.range = 44;
    this.x = 0;
    this.y = 0;
    this.w = 8;
    this.h = 1;
  }

  /**@param {CanvasRenderingContext2D} drawCtx 
   */
  render (drawCtx) {
    let nx = 0;
    let ny = 0;
    let nw = 0;
    let nh = this.h;

    let blackNoteColor = "#333355";
    let whiteNoteColor = "#aaaaff";

    let noteWidth = lerp(0, this.w, 1/this.range);

    let note = 0;
    let nextNoteHalfWidth = false;

    //Render white notes
    for (let i=0; i<this.range; i++) {
      note = i;
      while (note > 11) {
        note -= 11;
      }

      nw = noteWidth;

      if (blackNotes.includes(note)) {
        
      } else {
        nh = this.h;
        nx += noteWidth;
        drawCtx.fillStyle = whiteNoteColor;

        drawCtx.fillRect(nx, ny, nw, nh);
        drawCtx.strokeStyle = "black";
        drawCtx.strokeRect(nx, ny, nw, nh);
      }
    }

    nx = 0;

    for (let i=0; i<this.range; i++) {

      note = i % 12;

      nw = noteWidth;

      if (blackNotes.includes(note)) {
        nx += noteWidth / 2;
        nextNoteHalfWidth = !nextNoteHalfWidth;
        drawCtx.fillStyle = blackNoteColor;
        nh = this.h/1.5;

        nw *= 0.5;

        drawCtx.fillRect(nx + (nw/2), ny, nw, nh);
        drawCtx.strokeStyle = "black";
        drawCtx.strokeRect(nx + (nw/2), ny, nw, nh);

        nx -= noteWidth / 2;
      } else {
        nx += noteWidth;
      }
    }
  }

  onEvent (evt) {
    
  }
}

console.log(noteToFreq);


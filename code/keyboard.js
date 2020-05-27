
import { lerp, pointInRect, Utils } from "./math.js";

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

export class KeyboardDisplay {
  constructor () {
    this.range = 24;
    this.x = 0;
    this.y = 0;
    this.w = 8;
    this.h = 1;
    console.log(this);
    this.blackNoteHeight = 0.75;
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

  /**@param {CanvasRenderingContext2D} drawCtx 
   */
  render (drawCtx) {
    this.drawCtx = drawCtx;
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
        drawCtx.fillStyle = whiteNoteColor;

        drawCtx.fillRect(nx, ny, nw, nh);
        drawCtx.strokeStyle = "black";
        drawCtx.strokeRect(nx, ny, nw, nh);

        nx += noteWidth;
      }
    }

    nx = this.x;

    for (let i=0; i<this.range; i++) {

      note = i % 12;

      nw = noteWidth;

      if (blackNotes.includes(note)) {
        nx -= noteWidth / 2;
        drawCtx.fillStyle = blackNoteColor;
        nh = this.h * this.blackNoteHeight;

        nw *= 0.5;

        drawCtx.fillRect(nx + (nw/2), ny, nw, nh);
        drawCtx.strokeStyle = "black";
        drawCtx.strokeRect(nx + (nw/2), ny, nw, nh);

        nx += noteWidth / 2;
      } else {
        nx += noteWidth;
      }
    }

    drawCtx.strokeStyle = "red";
    drawCtx.strokeRect(this.x, this.y, this.w, this.h);
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

  pointInside (x, y) {
    return pointInRect(x, y, this.x, this.y, this.w, this.h);
  }

  onEvent (evt) {
    if (evt.type === "click") {
      let note = this.getNoteForPosition(evt.x, evt.y);
      
      let freq = stepsToFreq(note);

      console.log(freq);

      if (this.osc) {
        this.osc.frequency.value = freq;
      }
    }
  }
}

console.log(noteToFreq);


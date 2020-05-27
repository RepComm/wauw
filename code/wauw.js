
import { rect, on, clearChildren, get } from "./aliases.js";
import { Utils } from "./math.js";
import { Node } from "./node.js";
import { KeyboardDisplay } from "./keyboard.js";

class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas renderer element
   * @param {Boolean} renderGrid should the grid render or not
   * @param {Number} gridSpacing coordinate spacing between grid vertices
   */
  constructor(canvas, renderGrid = true, gridSpacing = 1) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    /**@type {HTMLDivElement} .node-config-panel*/
    this.config = get("config");

    /**@type {Array<Node>} */
    this.nodes = new Array();

    this.renderGrid = renderGrid;
    this.gridSpacing = gridSpacing;
    this.gridColor = "white";
    this.gridLineWidth = 0.5;

    this.graphingColor = "blue";

    this.needsRender = true;

    this.centerX = 0;
    this.centerY = 0;
    this.left = 0;
    this.right = 0;
    this.top = 0;
    this.bottom = 0;

    this.zoom = 100;

    this.drawRect = rect(this.canvas);
    this.prevDrawRect = { width: 0, height: 0 };

    this.cursor = { x: 0, y: 0, localx: 0, localy: 0, dragNode: undefined };

    /**@type {Node}*/
    this.lastSelectedNode = undefined;

    this.renderRequestCallback = () => {
      this.render();
    };

    on(window, "resize", () => {
      console.log("Resize");
      this.needsRender = true;
    });

    requestAnimationFrame(this.renderRequestCallback);
  }

  /** Set the page-space (layerX/layerY) cursor position
   * Triggers a render
   * @param {Integer} x 
   * @param {Integer} y
   */
  setCursor(x, y) {
    this.cursor.x = x;
    this.cursor.y = y;
    this.cursor.localx = ((this.cursor.x - this.drawRect.width / 2) / this.zoom) + this.centerX;
    this.cursor.localy = ((this.cursor.y - this.drawRect.height / 2) / this.zoom) + this.centerY;
    this.needsRender = true;
  }

  /** Set the origin the viewer is viewing from
   * Triggers a render
   * @param {Integer} x
   * @param {Integer} y 
   */
  setCenter(x, y) {
    this.centerX = x;
    this.centerY = y;
    this.needsRender = true;
  }

  /** Move the origin the viewer is viewing from by some amounts
   * @param {Integer} xa move amount x
   * @param {Integer} ya move amount y
   */
  moveCenter(xa, ya) {
    this.setCenter(this.centerX + xa, this.centerY + ya);
  }
  /**Tries to select a node under the cursor in order of visibility
   * @returns {Node}
   */
  selectNode() {
    //Reverse loop iteration to pick nodes that are rendered on top first
    let node;
    for (let i = this.nodes.length - 1; i > -1; i--) {
      node = this.nodes[i];
      if (node.pointInside(this.cursor.localx, this.cursor.localy)) {
        return node;
      }
    }
  }
  mouseDown() {
    this.cursor.dragNode = this.selectNode();
    if (!this.cursor.dragNode) {
      for (let node of this.nodes) {
        if (node instanceof KeyboardDisplay) {
          if (node.pointInsidePiano(this.cursor.localx, this.cursor.localy)) {
            node.onEvent({
              type: "mouse-down",
              x: this.cursor.localx,
              y: this.cursor.localy
            });
            return;
          }
        }
      }
    }
  }
  mouseUp() {
    if (this.cursor.dragNode) {
      this.cursor.dragNode.snapTo(0.25);
      this.cursor.dragNode = undefined;
      this.needsRender = true;
    } else {
      for (let node of this.nodes) {
        if (node instanceof KeyboardDisplay) {
          if (node.pointInsidePiano(this.cursor.localx, this.cursor.localy)) {
            node.onEvent({
              type: "mouse-up",
              x: this.cursor.localx,
              y: this.cursor.localy
            });
            return;
          }
        }
      }
    }
  }
  
  mouseDrag(xa, ya, forceMoveCenter) {
    if (this.cursor.dragNode && !forceMoveCenter) {
      this.cursor.dragNode.moveBy(-xa, -ya);
    } else {
      this.moveCenter(xa, ya);
    }
  }

  populateConfig(node, clearExisting = true) {
    if (clearExisting) clearChildren(this.config);
    if (!node) return; //If no node specified just clear the contents of config menu

    //Add the node's html config screen to the config menu
    config.appendChild(node.element);
  }

  onEvent(evt) {
    switch (evt.type) {
      case "wheel":
        this.addZoom((evt.delta * this.zoom) / 50);
        break;
      case "select-node":
        this.lastSelectedNode = evt.node;
        this.populateConfig(this.lastSelectedNode);
        break;
      case "add-select-node":
        this.populateConfig(evt.node, false);
        break;
      case "deselect-node":
        this.lastSelectedNode = undefined;
        this.populateConfig(undefined, true);
        break;
      case "connect-node": //Connect two nodes when we select them
        if (this.lastSelectedNode) {
          if (this.lastSelectedNode.isConnected(evt.node)) {
            this.lastSelectedNode.disconnect(evt.node);
          } else {
            this.lastSelectedNode.connect(evt.node);
          }
          //Deselects the selected node
          this.lastSelectedNode = undefined;
        } else {
          this.lastSelectedNode = evt.node;
        }
        break;
    }
  }

  render() {
    requestAnimationFrame(this.renderRequestCallback);
    if (!this.needsRender) return;
    this.needsRender = false;

    this.drawRect = rect(this.canvas);
    if (this.prevDrawRect.width !== this.drawRect.width ||
      this.prevDrawRect.height !== this.drawRect.height) {
      this.prevDrawRect.width = this.drawRect.width;
      this.prevDrawRect.height = this.drawRect.height;
      this.canvas.width = this.drawRect.width;
      this.canvas.height = this.drawRect.height;
    }

    this.left = (-this.drawRect.width / 2) / this.zoom;
    this.right = (this.drawRect.width / 2) / this.zoom;
    this.top = (-this.drawRect.height / 2) / this.zoom;
    this.bottom = (this.drawRect.height / 2) / this.zoom;

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.drawRect.width, this.drawRect.height);
    this.ctx.translate(this.drawRect.width / 2, this.drawRect.height / 2);

    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.lineWidth = this.gridLineWidth / this.zoom;
    this.ctx.translate(-this.centerX, -this.centerY);

    if (this.renderGrid) {
      this.ctx.beginPath();
      let xOffset = Utils.roundTo(this.left + this.centerX, this.gridSpacing);
      for (let x = xOffset; x < this.right + this.centerX; x += this.gridSpacing) {
        this.ctx.moveTo(x, this.top + this.centerY);
        this.ctx.lineTo(x, this.bottom + this.centerY);
      }
      let yOffset = Utils.roundTo(this.top + this.centerY, this.gridSpacing);
      for (let y = yOffset; y < this.bottom + this.centerY; y += this.gridSpacing) {
        this.ctx.moveTo(this.left + this.centerX, y);
        this.ctx.lineTo(this.right + this.centerX, y);
      }
      this.ctx.strokeStyle = this.gridColor;
      this.ctx.stroke();
    }

    for (let node of this.nodes) {
      // this.ctx.save();
      // this.ctx.translate(node.x, node.y);
      if (node instanceof KeyboardDisplay) {
        node.render();
      } else {
        Node.render(this.ctx, node);
      }
      // this.ctx.restore();
    }

    this.ctx.fillStyle = "white";
    this.ctx.font = "0.15px courier";
    this.ctx.fillText(
      `x:${this.cursor.localx.toFixed(2)}, y:${this.cursor.localy.toFixed(2)}`,
      this.cursor.localx,
      this.cursor.localy
    );

    this.ctx.restore();
  }

  /** Add some zoom to your room..
   * Triggers a render
   * @param {Number} za zoom amount
   */
  addZoom(za) {
    this.zoom -= za;
    if (this.zoom < 8) {
      this.zoom = 8;
    } else if (this.zoom > 400) {
      this.zoom = 400;
    }
    this.needsRender = true;
  }
}

export { Renderer };

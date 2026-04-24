export class InputManager {
  constructor(canvas) {
    this.keys = {};
    this.mouse = { x: 0, y: 0, left: false, right: false };
    this.locked = false;
    this.canvas = canvas;
    
    // Desktop controls
    window.addEventListener('keydown', e => this.keys[e.code] = true);
    window.addEventListener('keyup', e => this.keys[e.code] = false);
    
    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) this.mouse.left = true;
      if (e.button === 2) this.mouse.right = true;
      if (!this.locked) {
        canvas.requestPointerLock();
      }
    });
    
    canvas.addEventListener('mouseup', e => {
      if (e.button === 0) this.mouse.left = false;
      if (e.button === 2) this.mouse.right = false;
    });
    
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
    });
    
    this.mouseMoveCallback = null;
    document.addEventListener('mousemove', e => {
      if (this.locked && this.mouseMoveCallback) {
        this.mouseMoveCallback(e.movementX, e.movementY);
      }
    });
    
    // Disable context menu
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }
  
  getMoveInput() {
    return {
      forward: this.keys['KeyW'] || this.keys['ArrowUp'],
      back: this.keys['KeyS'] || this.keys['ArrowDown'],
      left: this.keys['KeyA'] || this.keys['ArrowLeft'],
      right: this.keys['KeyD'] || this.keys['ArrowRight'],
      sprint: this.keys['ShiftLeft'] || this.keys['ShiftRight'],
    };
  }
  
  onMouseMove(callback) {
    this.mouseMoveCallback = callback;
  }
}
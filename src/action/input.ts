import { PlayerInput } from "../type";

export default class BasicCharacterControllerInput {
  keys: PlayerInput;
  constructor() {
    this.initialize();
  }

  initialize() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
      leftClick: false,
      rightClick: false,
    };

    document.addEventListener("keydown", (e) => this.onKeydown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyup(e), false);
    document.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
    document.addEventListener("mouseup", (e) => this.onMouseUp(e), false);

    document.addEventListener(
      "pointerlockchange",
      () => this.handleLockChange(),
      false
    );
  }

  handleLockChange() {
    const canvas = document.querySelector("canvas");
    if (document.pointerLockElement !== canvas) {
      this.keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        space: false,
        shift: false,
        leftClick: false,
        rightClick: false,
      };
    }
  }

  onMouseUp(e: MouseEvent) {
    switch (e.button) {
      case 0:
        this.keys.leftClick = false;
      case 2:
        this.keys.rightClick = false;
    }
  }

  onMouseDown(e: MouseEvent) {
    switch (e.button) {
      case 0:
        this.keys.leftClick = true;
      case 2:
        this.keys.rightClick = true;
    }
  }

  onKeydown(e: KeyboardEvent) {
    switch (e.keyCode) {
      case 87: // w
        this.keys.forward = true;
        break;
      case 65: // a
        this.keys.left = true;
        break;
      case 83: // s
        this.keys.backward = true;
        break;
      case 68: // d
        this.keys.right = true;
        break;
      case 32: // space
        this.keys.space = true;
        break;
      case 16: // shift
        this.keys.shift = true;
        break;
    }
  }

  onKeyup(e: KeyboardEvent) {
    switch (e.keyCode) {
      case 87: // w
        this.keys.forward = false;
        break;
      case 65: // a
        this.keys.left = false;
        break;
      case 83: // s
        this.keys.backward = false;
        break;
      case 68: // d
        this.keys.right = false;
        break;
      case 32: // space
        this.keys.space = false;
        break;
      case 16: // shift
        this.keys.shift = false;
        break;
    }
  }
}

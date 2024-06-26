import { PlayerInput } from "@/type";

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

    document.addEventListener("keydown", this.onKeydown.bind(this), false);
    document.addEventListener("keyup", this.onKeyup.bind(this), false);
    document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    document.addEventListener("mouseup", this.onMouseUp.bind(this), false);

    document.addEventListener(
      "pointerlockchange",
      this.handleLockChange.bind(this),
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
    switch (e.code) {
      case "KeyW": // w
        this.keys.forward = true;
        break;
      case "KeyA": // a
        this.keys.left = true;
        break;
      case "KeyS": // s
        this.keys.backward = true;
        break;
      case "KeyD": // d
        this.keys.right = true;
        break;
      case "Space": // space
        this.keys.space = true;
        break;
      case "ShiftLeft": // shift
        this.keys.shift = true;
        break;
    }
  }

  onKeyup(e: KeyboardEvent) {
    switch (e.code) {
      case "KeyW": // w
        this.keys.forward = false;
        break;
      case "KeyA": // a
        this.keys.left = false;
        break;
      case "KeyS": // s
        this.keys.backward = false;
        break;
      case "KeyD": // d
        this.keys.right = false;
        break;
      case "Space": // space
        this.keys.space = false;
        break;
      case "ShiftLeft": // shift
        this.keys.shift = false;
        break;
    }
  }

  dispose() {
    document.removeEventListener("keydown", this.onKeydown.bind(this), false);
    document.removeEventListener("keyup", this.onKeyup.bind(this), false);
    document.removeEventListener(
      "mousedown",
      this.onMouseDown.bind(this),
      false
    );
    document.removeEventListener("mouseup", this.onMouseUp.bind(this), false);

    document.removeEventListener(
      "pointerlockchange",
      this.handleLockChange.bind(this),
      false
    );
  }
}

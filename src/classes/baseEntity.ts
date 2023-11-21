import { Camera, Scene } from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { GUI } from "dat.gui";

export interface BasePropsType {
  scene?: Scene;
  control?: PointerLockControls;
  gui?: GUI;
  camera?: Camera;
}

export default class BaseEntity {
  scene?: Scene;
  control?: PointerLockControls;
  gui?: GUI;
  camera?: Camera;

  constructor(props?: BasePropsType) {
    const { control, gui, scene, camera } = props || {};
    this.control = control;
    this.gui = gui;
    this.scene = scene;
    this.camera = camera;
  }
}

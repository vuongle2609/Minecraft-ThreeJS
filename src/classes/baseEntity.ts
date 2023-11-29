import { Camera, Scene } from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { GUI } from "dat.gui";
import { World } from "cannon-es";
import MouseControl from "@/action/mouseControl";
import PhysicsEngine from "@/physics";

export interface BasePropsType {
  scene?: Scene;
  control?: PointerLockControls;
  mouseControl?: MouseControl;
  gui?: GUI;
  camera?: Camera;
  physicsEngine?: PhysicsEngine;
}

export default class BaseEntity {
  scene?: Scene;
  control?: PointerLockControls;
  gui?: GUI;
  camera?: Camera;
  mouseControl?: MouseControl;
  physicsEngine?: PhysicsEngine;

  constructor(props?: BasePropsType) {
    const { control, gui, scene, camera, mouseControl, physicsEngine } =
      props || {};
    this.control = control;
    this.gui = gui;
    this.scene = scene;
    this.camera = camera;
    this.mouseControl = mouseControl;
    this.physicsEngine = physicsEngine;
  }
}

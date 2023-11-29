import { Camera, Scene } from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { GUI } from "dat.gui";
import { World } from "cannon-es";
import MouseControl from "@/action/mouseControl";
import PhysicsEngine from "@/physics";
import BlockManager from "./blockManager";

export interface BasePropsType {
  scene?: Scene;
  control?: PointerLockControls;
  mouseControl?: MouseControl;
  gui?: GUI;
  camera?: Camera;
  physicsEngine?: PhysicsEngine;
  blockManager?: BlockManager;
}

export default class BaseEntity {
  scene?: Scene;
  control?: PointerLockControls;
  gui?: GUI;
  camera?: Camera;
  mouseControl?: MouseControl;
  physicsEngine?: PhysicsEngine;
  blockManager?: BlockManager;

  constructor(props?: BasePropsType) {
    const {
      control,
      gui,
      scene,
      camera,
      mouseControl,
      physicsEngine,
      blockManager,
    } = props || {};
    this.control = control;
    this.gui = gui;
    this.scene = scene;
    this.camera = camera;
    this.mouseControl = mouseControl;
    this.physicsEngine = physicsEngine;
    this.blockManager = blockManager;
  }
}

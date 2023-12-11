import MouseControl from "@/game/action/mouseControl";
import PhysicsEngine from "@/game/physics";
import { GUI } from "dat.gui";
import { Camera, Scene } from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import BlockManager from "./blockManager";

export interface BasePropsType {
  scene?: Scene;
  control?: PointerLockControls;
  mouseControl?: MouseControl;
  gui?: GUI;
  camera?: Camera;
  physicsEngine?: PhysicsEngine;
  blockManager?: BlockManager;
  worker?: Worker;
}

export default class BaseEntity {
  scene?: Scene;
  control?: PointerLockControls;
  gui?: GUI;
  camera?: Camera;
  mouseControl?: MouseControl;
  blockManager?: BlockManager;
  worker?: Worker;

  constructor(props?: BasePropsType) {
    const { control, gui, scene, camera, mouseControl, blockManager, worker } =
      props || {};
    this.control = control;
    this.gui = gui;
    this.scene = scene;
    this.camera = camera;
    this.mouseControl = mouseControl;
    this.blockManager = blockManager;
    this.worker = worker;
  }
}

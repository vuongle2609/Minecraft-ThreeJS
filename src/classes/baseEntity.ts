import { Camera, Scene } from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { GUI } from "dat.gui";
import { World } from "cannon-es";
import MouseControl from "@/action/mouseControl";

export interface BasePropsType {
  scene?: Scene;
  control?: PointerLockControls;
  mouseControl?: MouseControl;
  gui?: GUI;
  camera?: Camera;
  world?: World;
}

export default class BaseEntity {
  scene?: Scene;
  control?: PointerLockControls;
  gui?: GUI;
  camera?: Camera;
  world?: World;
  mouseControl?: MouseControl;

  constructor(props?: BasePropsType) {
    const { control, gui, scene, camera, world, mouseControl } = props || {};
    this.control = control;
    this.gui = gui;
    this.scene = scene;
    this.camera = camera;
    this.world = world;
    this.mouseControl = mouseControl;
  }
}

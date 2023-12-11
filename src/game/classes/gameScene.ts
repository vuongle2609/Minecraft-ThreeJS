import MouseControl from "@/game/action/mouseControl";
import Player from "@/game/player/character";
import { $ } from "@/UI/utils/selector";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import BlockManager from "./blockManager";
import InventoryManager from "./inventoryManager";
import Light from "./light";
import { RenderPage } from "./renderPage";
import PhysicsWorker from "../physics/worker?worker";

export default class GameScene extends RenderPage {
  removedWindow = false;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#gameScene") as HTMLCanvasElement,
  });

  worker = new PhysicsWorker();

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  control = new PointerLockControls(this.camera, document.body);

  coordinateElement: HTMLElement;
  fpsElement: HTMLElement;

  clock = new THREE.Clock();
  frames = 0;
  prevTime = performance.now();

  player: Player;

  mouseControl: MouseControl;

  blockManager: BlockManager;

  inventoryManager: InventoryManager;

  lastCallTime = 0;

  constructor() {
    super();

    this.initialize();
  }

  initialize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    window.addEventListener(
      "resize",
      () => {
        this.onWindowResize();
      },
      false
    );

    this.element = this.renderer.domElement;

    document.body.appendChild(this.element);

    this.scene.background = new THREE.Color("#87CEEB");

    new Light({
      scene: this.scene,
    });

    this.inventoryManager = new InventoryManager();

    this.coordinateElement = $("#coordinate");
    this.fpsElement = $("#fps");

    this.mouseControl = new MouseControl({
      control: this.control,
      camera: this.camera,
    });

    this.blockManager = new BlockManager({
      mouseControl: this.mouseControl,
      scene: this.scene,
      camera: this.camera,
      inventoryManager: this.inventoryManager,
      control: this.control,
      worker: this.worker,
    });

    this.player = new Player({
      scene: this.scene,
      camera: this.camera,
      blockManager: this.blockManager,
      worker: this.worker,
    });

    this.inventoryManager.renderInventory();

    this.control?.lock();

    this.RAF(0);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  renderCoordinate() {
    const { x, y, z } = this.player?.player.position || {};

    if (this.coordinateElement)
      this.coordinateElement.innerHTML = `X: ${x.toFixed(3)}, Y: ${y.toFixed(
        3
      )}, Z: ${z.toFixed(3)}`;
  }

  renderFps() {
    this.frames++;
    const time = performance.now();

    if (time >= this.prevTime + 1000) {
      if (this.fpsElement)
        this.fpsElement.innerHTML =
          "FPS: " +
          String(Math.round((this.frames * 1000) / (time - this.prevTime)));

      this.frames = 0;
      this.prevTime = time;
    }
  }

  disposeRender() {
    this.renderer.dispose();
    this.removedWindow = true;
  }

  RAF(t: number) {
    requestAnimationFrame((t) => {
      if (this.removedWindow) return;

      this.RAF(t);
    });

    if (!this.mouseControl?.paused) {
      const delta = this.clock.getDelta();

      // prevent when user not click and delta get larger make
      // miss calculate player init position :))
      if (delta > 0.1) return;

      this.renderCoordinate();

      this.renderFps();

      this.player?.update(delta, t);

      this.blockManager?.update();

      this.renderer.render(this.scene, this.camera);
    }
  }
}
import MouseControl from "@/action/mouseControl";
import Player from "@/player/character";
import { $ } from "@/utils/selector";
import { GUI } from "dat.gui";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import BlockManager from "./blockManager";
import InventoryManager from "./inventoryManager";
import Light from "./light";
import { RenderPage } from "./renderPage";

export default class GameScene extends RenderPage {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#gameScene") as HTMLCanvasElement,
  });

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  control = new PointerLockControls(this.camera, document.body);

  gui = new GUI({});

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

  afterRender = () => {
    const app = document.querySelector("#app");

    // focus section -->

    // planing: make custom cursor -->
    // cursor section -->

    app?.insertAdjacentHTML(
      "beforeend",
      `
      <div id="modal_focus" class="fixed top-0 bottom-0 left-0 right-0 items-center justify-center bg-blue-500 flex flex-col" style="background-image: url('/assets/home/bg.jpg')">
        <div class="flex flex-col w-full h-full backdrop-blur-md items-center justify-center px-[200px]">
            <img src="/assets/home/minecraft-logo-8.png" class="max-w-[800px] w-full mb-20"/>

            <button class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full max-w-[500px]" id="focus">Focus</button>
        </div>
      </div>

      <div id="modal_game" class="fixed top-0 bottom-0 left-0 right-0 hidden items-center justify-center">
        <div class="text-white font-medium fixed top-2 left-2">
          <span id="coordinate"></span>
          <br/>
          <span id="fps"></span>
        </div>

        <div class="relative shadow-md">
          <div class="w-1 h-5 bg-gray-500 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"></div>
          <div class="w-5 h-1 bg-gray-500 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"></div>
        </div>

        <div id="itemLabel" class="fixed opacity-0 text-white bottom-20 text-xl transition-all duration-300 drop-shadow-md"></div>

        <div class="fixed bottom-1 bg-gray-900/60 border-4 border-solid border-black rounded-md">
          <div class="border-4 border-solid border-gray-300 flex" id="inventory_container">
              
          </div>
        </div>
      </div>
      `
    );

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
    });

    this.player = new Player({
      scene: this.scene,
      camera: this.camera,
      blockManager: this.blockManager,
    });

    this.inventoryManager.renderInventory();
  };

  constructor() {
    super();

    this.initialize();

    this.afterRender();
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

  RAF(t: number) {
    requestAnimationFrame((t) => {
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

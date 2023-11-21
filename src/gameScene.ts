import { GUI } from "dat.gui";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { RenderPage } from "./classes/renderPage";
import Player from "./player/character";
import MouseControl from "./action/mouseControl";
import Terrant from "./classes/terrant";
import Light from "./classes/light";

export default class GameScene extends RenderPage {
  renderer = new THREE.WebGLRenderer({ antialias: true });

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  control = new PointerLockControls(this.camera, document.body);

  gui = new GUI({});

  clock = new THREE.Clock();

  player: Player;

  afterRender = () => {
    const app = document.querySelector("#app");

    // focus section -->

    // planing: make custom cursor -->
    // cursor section -->

    app?.insertAdjacentHTML(
      "beforeend",
      `
      <div id="modal_focus" class="fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-blue-500">
        <button class="bg-red-600 p-9" id="focus">Focus</button>
      </div>

      <div id="modal_game" class="fixed top-0 bottom-0 left-0 right-0 hidden items-center justify-center">
        <div class="relative">
          <div class="w-1 h-5 bg-white absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"></div>
          <div class="w-5 h-1 bg-white absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"></div>
        </div>
      </div>
      `
    );

    new MouseControl({
      control: this.control,
    });
  };

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

    this.camera.position.set(0, 3, 20);
    this.camera.lookAt(0, 4, 0);

    this.player = new Player({
      scene: this.scene,
      camera: this.camera,
    });

    new Terrant({
      scene: this.scene,
    });

    new Light({
      scene: this.scene,
    });

    this.RAF(0);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  RAF(t: number) {
    requestAnimationFrame((t) => {
      this.RAF(t);
    });

    const delta = this.clock.getDelta();

    this.player.update(delta);

    this.renderer.render(this.scene, this.camera);
  }
}

const gameScene = new GameScene();
export { gameScene };

export const scene = gameScene.scene;
export const control = gameScene.control;
export const gui = gameScene.gui;

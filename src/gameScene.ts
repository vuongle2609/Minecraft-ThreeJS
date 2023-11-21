import { GUI } from "dat.gui";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { RenderPage } from "./classes/renderPage";

export default class GameScene extends RenderPage {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  control: PointerLockControls;
  gui: GUI;

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
    `
    );
  };

  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
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

    this.gui = new GUI({});

    // create 2 separate scene for gun and game
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#87CEEB");

    // handle camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    this.camera.position.set(0, 3, 20);
    this.camera.lookAt(0, 4, 0);

    this.control = new PointerLockControls(this.camera, document.body);

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

    this.renderer.render(this.scene, this.camera);
  }
}

// const gameScene = new GameScene();

// export const scene = gameScene.scene;
// export const gui = gameScene.gui;
// export const sceneGun = gameScene.sceneGun;

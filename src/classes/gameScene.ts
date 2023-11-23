import MouseControl from "@/action/mouseControl";
import Player from "@/player/character";
import { Vec3, World, ContactMaterial, Material } from "cannon-es";
import { GUI } from "dat.gui";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import BlockManager from "./blockManager";
import InventoryManager from "./inventoryManager";
import Light from "./light";
import { RenderPage } from "./renderPage";
import Terrant from "./terrant";
import CannonDebugger from "cannon-es-debugger";

export const physicsMaterial = new Material("physics");

export const humanMaterial = new Material("human");

export default class GameScene extends RenderPage {
  renderer = new THREE.WebGLRenderer({ antialias: true });

  scene = new THREE.Scene();

  world = new World({
    gravity: new Vec3(0, -60, 0),
    frictionGravity: new Vec3(),
  });

  worker = new Worker(new URL("../physics/index", import.meta.url), {
    type: "module",
  });

  worldBodiesPositions = new Float32Array(3);

  //@ts-ignore
  cannonDebugger = new CannonDebugger(this.scene, this.world, {});

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
      <div id="modal_focus" class="fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-blue-500">
         <button class="bg-red-600 p-9" id="focus">Focus</button>
      </div>

      <div id="modal_game" class="fixed top-0 bottom-0 left-0 right-0 hidden items-center justify-center">
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

    this.mouseControl = new MouseControl({
      control: this.control,
      camera: this.camera,
    });

    this.blockManager = new BlockManager({
      mouseControl: this.mouseControl,
      scene: this.scene,
      camera: this.camera,
      world: this.world,
      inventoryManager: this.inventoryManager,
    });

    this.inventoryManager.renderInventory();
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

    const physics_physics = new ContactMaterial(
      physicsMaterial,
      humanMaterial,
      {
        friction: 0,
        restitution: 0,
      }
    );

    this.world.addContactMaterial(physics_physics);

    this.player = new Player({
      scene: this.scene,
      camera: this.camera,
      world: this.world,
    });

    new Terrant({
      scene: this.scene,
      world: this.world,
    });

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

  RAF(t: number) {
    requestAnimationFrame((t) => {
      this.RAF(t);
    });

    if (!this.mouseControl?.paused) {
      const delta = this.clock.getDelta();

      // if (delta) this.world.step(timeStep, delta);

      this.player.update(delta);

      this.blockManager?.update();

      this.cannonDebugger.update();

      this.renderer.render(this.scene, this.camera);
    }
  }
}

const gameScene = new GameScene();
export { gameScene };

export const scene = gameScene.scene;
export const control = gameScene.control;
export const gui = gameScene.gui;

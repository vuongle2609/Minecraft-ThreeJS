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
import { lerp } from "three/src/math/MathUtils";

export const physicsMaterial = new Material("physics");

export const humanMaterial = new Material("human");

export default class GameScene extends RenderPage {
  renderer = new THREE.WebGLRenderer({ antialias: true });

  scene = new THREE.Scene();

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
      inventoryManager: this.inventoryManager,
      worker: this.worker,
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

    this.player = new Player({
      scene: this.scene,
      camera: this.camera,
      worker: this.worker,
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

      this.player.update(delta);

      this.blockManager?.update();

      // this.cannonDebugger.update();

      this.renderer.render(this.scene, this.camera);
    }
  }
}

const gameScene = new GameScene();
export { gameScene };

export const scene = gameScene.scene;
export const control = gameScene.control;
export const gui = gameScene.gui;


// import("@dimforge/rapier3d").then((RAPIER) => {
//   // Use the RAPIER module here.
//   let gravity = { x: 0.0, y: -9.81, z: 0.0 };
//   let world = new RAPIER.World(gravity);

//   // Create the ground
//   let groundColliderDesc = RAPIER.ColliderDesc.cuboid(1.0, 1.0, 1.0);
//   world.createCollider(groundColliderDesc);

//   let rigidBodyDesc = new RAPIER.RigidBodyDesc(
//     RAPIER.RigidBodyType.KinematicVelocityBased
//   )
//     .setTranslation(0, 2, 0)
//     .setGravityScale(50);
//   let characterBody = world.createRigidBody(rigidBodyDesc);

//   let colliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.5);
//   colliderDesc.setMass(2);
//   let collider = world.createCollider(colliderDesc, characterBody);

//   let offset = 0.01;
//   let characterController = world.createCharacterController(offset);

//   characterController.setUp({ x: 0, y: 1, z: 0 });

//   let vy = -20;
//   let ground = false;

//   const ray = new RAPIER.Ray(
//     {
//       x: 0,
//       y: 0,
//       z: 0,
//     },
//     {
//       x: 0,
//       y: -1,
//       z: 0,
//     }
//   );

//   let storedFall = 0;

//   // get all bodies position
//   const getBodyProperties = ({
//     position,
//     delta,
//   }: {
//     position: Float32Array;
//     delta: number;
//   }) => {
//     world.step();

//     ray.origin.x = characterBody.translation().x;
//     ray.origin.y = characterBody.translation().y;
//     ray.origin.z = characterBody.translation().z;

//     let hit = world.castRay(ray, 0.5, true);

//     let yDirection = 0;

//     yDirection += lerp(storedFall, -9.81 * delta * 100, 0.1);
//     storedFall = yDirection;

//     if (hit) {
//       const point = ray.pointAt(hit.toi);
//       let diff = characterBody.translation().y - (point.y + 0.5);
//       console.log("🚀 ~ file: index.ts:69 ~ import ~ diff:", diff);
//       if (diff < 0.0) {
//         yDirection = lerp(0, Math.abs(diff), 0.5);
//       }
//     }

//     characterController.computeColliderMovement(collider, {
//       x: position[0],
//       y: position[1],
//       z: position[2],
//     });

//     const correctMovement = characterController.computedMovement();

//     characterBody.setLinvel(correctMovement, true);

//     let { x, y, z } = characterBody.translation();

//     // console.log("🚀 ~ file: index.ts:46 ~ import ~ { x, y, z } :", { x, y, z });

//     position[0] = x;
//     position[1] = y;
//     position[2] = z;

//     // self.postMessage({ position, delta });

//     gameScene.player.player.

//     // self.postMessage()
//   };

//   const handleJumpBody = () => {
//     // if (ground) {
//     //   ground = false;
//     //   vy = 40;
//     // }
//   };

//   const eventMapping = {
//     // handleAddBlockToWorld,
//     getBodyProperties,
//     handleJumpBody,
//   };

//   self.onmessage = (
//     e: MessageEvent<{
//       type: keyof typeof eventMapping;
//       payload: any;
//     }>
//   ) => {
//     eventMapping[e.data.type]?.(e.data.payload);
//   };
// });

import { $ } from "@/UI/utils/selector";
import MouseControl from "@/game/action/mouseControl";
import Player from "@/game/player/character";
import { WorldsType } from "@/type";
import { Clock, Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import ChunkManager from "./chunkManager";
import Cloud from "./cloud";
import InventoryManager from "./inventoryManager";
import Light from "./light";
import { RenderPage } from "./renderPage";

export default class GameScene extends RenderPage {
  id: string;
  worldStorage: WorldsType;

  removedWindow = false;

  renderer = new WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#gameScene") as HTMLCanvasElement,
  });

  rendererDebug = new WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#gameSceneDebug") as HTMLCanvasElement,
  });

  worker = new Worker(new URL("../physics/worker", import.meta.url), {
    type: "module",
  });

  scene = new Scene();

  camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  cameraDebug = new PerspectiveCamera(70, 200 / 200, 0.1, 2000);

  control = new PointerLockControls(this.camera, document.body);

  coordinateElement: HTMLElement;
  fpsElement: HTMLElement;
  chunkElement: HTMLElement;

  clock = new Clock();
  frames = 0;
  prevTime = performance.now();

  player: Player;

  mouseControl: MouseControl;

  chunkManager: ChunkManager;

  inventoryManager: InventoryManager;

  lastCallTime = 0;
  cloud = new Cloud({ scene: this.scene });

  constructor(id: string) {
    super();

    this.id = id;
    this.worldStorage = JSON.parse(localStorage.getItem("worlds") || "{}")[id];

    this.initialize();
  }

  initialize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;

    this.rendererDebug.setSize(200, 200);

    window.addEventListener(
      "resize",
      () => {
        this.onWindowResize();
      },
      false
    );

    this.element = this.renderer.domElement;

    document.body.appendChild(this.element);

    this.scene.background = new Color("#6EB1FF");
    // this.scene.fog = new Fog(0xcccccc, 3, 40);
    // this.scene.fog = new FogExp2(0xcccccc, 0.014);

    if (this.worldStorage.rotation)
      this.camera.rotation.fromArray(this.worldStorage.rotation as any);

    new Light({
      scene: this.scene,
    });

    this.coordinateElement = $("#coordinate");
    this.fpsElement = $("#fps");
    this.chunkElement = $("#chunk");

    this.mouseControl = new MouseControl({
      control: this.control,
      camera: this.camera,
    });

    this.inventoryManager = new InventoryManager({
      control: this.control,
      mouseControl: this.mouseControl,
    });

    this.worker.postMessage({
      type: "init",
      data: {
        seed: this.worldStorage?.seed,
        type: this.worldStorage?.worldType,
        chunkBlocksCustom: this.worldStorage.blocksWorldChunk,
        initPos: this.worldStorage.initPos,
      },
    });

    this.chunkManager = new ChunkManager({
      mouseControl: this.mouseControl,
      scene: this.scene,
      camera: this.camera,
      inventoryManager: this.inventoryManager,
      control: this.control,
      worker: this.worker,
      id: this.id,
      worldStorage: this.worldStorage,
    });

    this.player = new Player({
      scene: this.scene,
      camera: this.camera,
      chunkManager: this.chunkManager,
      worker: this.worker,
    });

    this.inventoryManager.renderHotbar();

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
      this.coordinateElement.innerHTML = `XYZ: ${x.toFixed(3)} / ${y.toFixed(
        3
      )} / ${z.toFixed(3)}`;

    if (this.chunkElement)
      this.chunkElement.innerHTML =
        "Chunk: " +
        this.chunkManager.currentChunk[0] +
        " " +
        this.chunkManager.currentChunk[1];
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
    this.chunkManager.dispose();
    this.player.input.dispose();
    this.removedWindow = true;
    this.worker.terminate();
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

      this.cameraDebug.position.set(
        this.player.player.position.x + 4,
        this.player.player.position.y + 4,
        this.player.player.position.z + 4
      );

      this.cameraDebug.lookAt(this.player.player.position);

      this.cloud?.update(this.player.player.position);

      this.chunkManager?.update();

      this.renderer.render(this.scene, this.camera);
      this.rendererDebug.render(this.scene, this.cameraDebug);
    }
  }
}

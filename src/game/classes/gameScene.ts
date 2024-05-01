import { $ } from "@/UI/utils/selector";
import MouseControl from "@/game/action/mouseControl";
import Player from "@/game/player/character";
import { WorldsType } from "@/type";
import {
  Clock,
  Color,
  Fog,
  PerspectiveCamera,
  SRGBTransfer,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import ChunkManager from "./chunkManager";
import InventoryManager from "./inventoryManager";
import Light from "./light";
import { RenderPage } from "./renderPage";

export default class GameScene extends RenderPage {
  id: string;
  worldStorage: WorldsType;

  removedWindow = false;

  renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: document.querySelector("#gameScene") as HTMLCanvasElement,
  });

  worker = new Worker(new URL("../physics/worker", import.meta.url), {
    type: "module",
  });

  scene = new Scene();

  camera = new PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  devCamera = new PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  control = new PointerLockControls(this.camera, document.body);

  coordinateElement: HTMLElement;
  fpsElement: HTMLElement;

  clock = new Clock();
  frames = 0;
  prevTime = performance.now();

  player: Player;

  mouseControl: MouseControl;

  chunkManager: ChunkManager;

  inventoryManager: InventoryManager;

  lastCallTime = 0;

  constructor(id: string) {
    super();

    this.id = id;
    this.worldStorage = JSON.parse(localStorage.getItem("worlds") || "{}")[id];

    this.initialize();
  }

  initialize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;

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
    this.scene.fog = new Fog(0xcccccc, 3, 40);

    if (this.worldStorage.rotation)
      this.camera.rotation.fromArray(this.worldStorage.rotation as any);

    new Light({
      scene: this.scene,
    });

    this.coordinateElement = $("#coordinate");
    this.fpsElement = $("#fps");

    this.mouseControl = new MouseControl({
      control: this.control,
      camera: this.camera,
    });

    this.inventoryManager = new InventoryManager({
      control: this.control,
      mouseControl: this.mouseControl,
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
      initPos: this.worldStorage.initPos,
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

  renderDevCam() {
    const { x, y, z } = this.player.player.position;
    this.devCamera.position.set(x, y , z + 6);
    // this.devCamera.lookAt(new Vector3(x, y, z));
    this.devCamera.rotation.copy(this.camera.rotation);
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
      this.renderDevCam();
      this.chunkManager?.update();

      this.renderer.render(this.scene, this.camera);
    }
  }
}

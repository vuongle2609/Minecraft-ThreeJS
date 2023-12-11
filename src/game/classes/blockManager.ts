import nameFromCoordinate from "@/game/helpers/nameFromCoordinate";
import {
  BoxGeometry,
  InstancedMesh,
  Mesh,
  Material,
  Object3DEventMap,
  Vector2,
  Vector3,
} from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";
import InventoryManager from "./inventoryManager";
import Terrant from "./terrant";
import blocks from "@/constants/blocks";

interface PropsType {
  inventoryManager: InventoryManager;
}

export default class BlockManager extends BaseEntity {
  inventoryManager: InventoryManager;

  prevHoverBlockHex: number | null = null;
  prevHoverBlock: Mesh<BoxGeometry, Material[], Object3DEventMap> | null = null;

  geometryBlock = new BoxGeometry(2, 2, 2);

  blocksMapping: Record<string, keyof typeof blocks> = {};
  blocks: Mesh<BoxGeometry, Material[]>[] = [];

  currentPlaceSound: HTMLAudioElement;

  currentBreakSound: HTMLAudioElement;

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.inventoryManager = props.inventoryManager;

    this.initialize();
  }

  async initialize() {
    document.addEventListener("mousedown", (e) => {
      this.onMouseDown(e);
    });

    const blocksTerrant = new Terrant({
      scene: this.scene,
      blocks: this.blocks,
      worker: this.worker,
    });

    this.blocksMapping = {
      ...this.blocksMapping,
      ...blocksTerrant.get(),
    };
  }

  onMouseDown(e: MouseEvent) {
    switch (e.button) {
      case 0:
        // left click
        this.handleBreakBlock();
        break;
      case 2:
        // right click
        this.handlePlaceBlock();
    }
  }

  handleHoverBlock() {
    // using box 3 with outline helper to show focus
    // const { raycaster } = this.mouseControl! || {};
    // if (!this.camera || !this.scene) return;
    // raycaster.setFromCamera(new Vector2(), this.camera);
    // const intersects = raycaster.intersectObjects(this.scene.children, false);
    // if (intersects[0]?.distance > 12) return;
    // const object = intersects[0]?.object as Mesh<
    //   BoxGeometry,
    //   Material[],
    //   Object3DEventMap
    // >;
    // if (this.prevHoverBlock?.material?.length) {
    //   this.prevHoverBlock.material = this.prevHoverBlock.material.map(
    //     (item) => {
    //       item.emissive.setHex(this.prevHoverBlockHex as number);
    //       return item;
    //     }
    //   );
    // }
    // if (!object) return;
    // if (object.material?.length)
    //   object.material = object.material.map((item) => {
    //     this.prevHoverBlockHex = item.emissive.getHex();
    //     // random hex for block lighter
    //     item.emissive.setHex(0x6e6e6e50);
    //     return item;
    //   });
    // this.prevHoverBlock = object;
  }

  handleBreakBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene || !this.control?.isLocked) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12) return;

    const { x, y, z } = intersects[0].object.position;

    const name = nameFromCoordinate(x, y, z);

    const objectClicked = this.scene.getObjectByName(name);
    // const objectClicked = this.blocksMapping[name];

    if (!objectClicked) return;

    this.scene.remove(objectClicked);

    if (this.currentBreakSound) {
      this.currentBreakSound.pause();
      this.currentBreakSound.currentTime = 0;
    }

    console.log(
      "🚀 ~ file: blockManager.ts:132 ~ BlockManager ~ handleBreakBlock ~ this.currentBreakSound:",
      this.blocksMapping[name]
    );
    this.currentBreakSound = blocks[this.blocksMapping[name]].break;

    this.currentBreakSound.play();

    delete this.blocksMapping[name];

    this.removeBlockWorker({
      position: [x, y, z],
    });
  }

  handlePlaceBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene || !this.control?.isLocked) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12) return;

    const clickedFace = Math.floor((intersects[0].faceIndex ?? 2) / 2);

    const { x, y, z } = intersects[0].object.position;

    const blockPosition = new Vector3();

    switch (clickedFace) {
      case 0:
        blockPosition.set(x + 2, y, z);
        break;
      case 1:
        blockPosition.set(x - 2, y, z);
        break;
      case 2:
        blockPosition.set(x, y + 2, z);
        break;
      case 3:
        blockPosition.set(x, y - 2, z);
        break;
      case 4:
        blockPosition.set(x, y, z + 2);
        break;
      case 5:
        blockPosition.set(x, y, z - 2);
        break;
    }

    if (this.inventoryManager.currentFocus) {
      const block = new Block({
        position: blockPosition,
        scene: this.scene,
        type: this.inventoryManager.currentFocus,
        blocks: this.blocks,
      });

      this.blocksMapping = {
        ...this.blocksMapping,
        [nameFromCoordinate(blockPosition.x, blockPosition.y, blockPosition.z)]:
          this.inventoryManager.currentFocus,
      };

      this.updateBlockWorker({
        position: [blockPosition.x, blockPosition.y, blockPosition.z],
        type: this.inventoryManager.currentFocus,
      });

      if (this.currentPlaceSound) {
        this.currentPlaceSound.pause();
        this.currentPlaceSound.currentTime = 0;
      }

      this.currentPlaceSound = blocks[this.inventoryManager.currentFocus].place;

      this.currentPlaceSound.play();
    }
  }

  removeBlockWorker({ position }: { position: number[] }) {
    this.worker?.postMessage({
      type: "removeBlock",
      data: {
        position,
      },
    });
  }

  updateBlockWorker({ position, type }: { position: number[]; type: string }) {
    this.worker?.postMessage({
      type: "addBlock",
      data: {
        position,
        type,
      },
    });
  }

  update() {
    this.handleHoverBlock();
  }
}

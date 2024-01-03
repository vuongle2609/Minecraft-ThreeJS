import blocks from "@/constants/blocks";
import nameFromCoordinate from "@/game/helpers/nameFromCoordinate";
import {
  BoxGeometry,
  Material,
  Mesh,
  Object3DEventMap,
  Vector2,
  Vector3,
} from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";
import InventoryManager from "./inventoryManager";
import detailFromName from "../helpers/detailFromName";

interface PropsType {
  inventoryManager: InventoryManager;
}

export default class BlockManager extends BaseEntity {
  inventoryManager: InventoryManager;

  prevHoverBlockHex: number | null = null;
  prevHoverBlock: Mesh<BoxGeometry, Material[], Object3DEventMap> | null = null;

  geometryBlock = new BoxGeometry(2, 2, 2);

  blocksMapping: Record<string, keyof typeof blocks> = {};

  currentPlaceSound: HTMLAudioElement;

  currentBreakSound: HTMLAudioElement;

  cubeMapping: Record<string, Record<string, Record<string, string>>> = {};

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.inventoryManager = props.inventoryManager;

    this.initialize();
  }

  async initialize() {
    document.addEventListener("mousedown", (e) => {
      this.onMouseDown(e);
    });

    const halfWidth = 10 * 2;

    for (let i = -halfWidth; i < halfWidth; i++) {
      for (let j = -halfWidth; j < halfWidth; j++) {
        this.updateBlock(i * 2, 0, j * 2, "grass");
      }
    }
  }

  updateBlock(x: number, y: number, z: number, type: keyof typeof blocks) {
    const position = new Vector3(x, y, z);

    this.cubeMapping[position.x] = {
      ...this.cubeMapping[position.x],
      [position.y]: {
        ...this.cubeMapping[position.x]?.[position.y],
        [position.z]: nameFromCoordinate(position.x, position.y, position.z),
      },
    };

    new Block({
      position: position,
      scene: this.scene,
      type: type,
      blocksMapping: this.cubeMapping,
    });

    this.worker?.postMessage({
      type: "addBlock",
      data: {
        position: [position.x, position.y, position.z],
        type: type,
      },
    });
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

    const clickedDetail = detailFromName(intersects[0].object.name);

    const { x, y, z } = clickedDetail;

    const name = nameFromCoordinate(x, y, z);

    const objectClicked = this.scene.getObjectByName(name);

    if (!objectClicked) return;

    this.scene.remove(objectClicked);

    // play sound
    if (this.currentBreakSound) {
      this.currentBreakSound.pause();
      this.currentBreakSound.currentTime = 0;
    }

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

    const clickedDetail = detailFromName(intersects[0].object.name);

    const clickedFace = clickedDetail.face;

    const { x, y, z } = clickedDetail;

    const blockPosition = new Vector3();

    switch (clickedFace) {
      case "2":
        blockPosition.set(x + 2, y, z);
        break;
      case "3":
        blockPosition.set(x - 2, y, z);
        break;
      case "4":
        blockPosition.set(x, y + 2, z);
        break;
      case "5":
        blockPosition.set(x, y - 2, z);
        break;
      case "0":
        blockPosition.set(x, y, z + 2);
        break;
      case "1":
        blockPosition.set(x, y, z - 2);
        break;
    }

    if (this.inventoryManager.currentFocus) {
      this.updateBlock(
        blockPosition.x,
        blockPosition.y,
        blockPosition.z,
        this.inventoryManager.currentFocus
      );

      // play sound

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

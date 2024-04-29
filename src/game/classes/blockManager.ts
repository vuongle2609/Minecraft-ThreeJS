import blocks, { renderGeometry } from "@/constants/blocks";
import { getChunkCoordinate } from "@/game/helpers/chunkHelpers";
import { detailFromName } from "@/game/helpers/detailFromName";
import {
  nameChunkFromCoordinate,
  nameFromCoordinate,
} from "@/game/helpers/nameFromCoordinate";
import { InstancedMesh, PlaneGeometry, Vector2, Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

import Block from "./block";
import InventoryManager from "./inventoryManager";

interface PropsType {
  inventoryManager: InventoryManager;
}

export default class BlockManager extends BaseEntity {
  inventoryManager: InventoryManager;

  currentPlaceSound: HTMLAudioElement;

  currentBreakSound: HTMLAudioElement;

  blocksMapping: Record<string, Record<string, Record<string, Block>>> = {};

  blocksWorldChunk: Record<string, Record<string, keyof typeof blocks | 0>> =
    {};
  chunksBlocks: Record<string, string[]> = {};

  chunksWorkers: Record<string, Worker> = {};
  chunksActive: string[] = [];

  // intancedFaces: Record<string, number> = Object.keys(blocks).reduce(
  //   (prev, key) => {
  //     return {
  //       ...prev,
  //       [key]: new InstancedMesh(
  //         renderGeometry,
  //         blocks[key as keyof typeof blocks].texture,
  //         1002
  //       ),
  //     };
  //   },
  //   {}
  // );

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.inventoryManager = props.inventoryManager;
    this.blocksWorldChunk = props.worldStorage?.blocksWorldChunk || {};
  }

  async initialize() {
    document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
  }

  getObject(name: string) {
    return this.scene?.getObjectByName(name) as THREE.Object3D;
  }

  updateBlock(
    x: number,
    y: number,
    z: number,
    type: keyof typeof blocks,
    isRenderChunk?: boolean
  ) {
    const newUpdateBlockChunk = getChunkCoordinate(x, z);
    const chunkName = nameChunkFromCoordinate(
      newUpdateBlockChunk.x,
      newUpdateBlockChunk.z
    );
    const coorName = nameFromCoordinate(x, y, z);

    // if render chunk and block marked as destroyed then return
    if (isRenderChunk && this.blocksWorldChunk[chunkName]?.[coorName] == 0) {
      return;
    }

    if (!isRenderChunk) {
      this.blocksWorldChunk[chunkName] = this.blocksWorldChunk[chunkName] || {};
      this.blocksWorldChunk[chunkName][coorName] = type;
    }

    const position = new Vector3(x, y, z);

    const block = new Block({
      position: position,
      scene: this.scene,
      type: type,
      blocksMapping: this.blocksMapping,
      // intancedFaces: this.intancedFaces,
    });

    this.blocksMapping[x] = {
      ...this.blocksMapping[x],
      [y]: {
        ...this.blocksMapping[x]?.[y],
        [z]: block,
      },
    };

    // add newFunction to bulk render on worker
    // if (!isRenderChunk)
    this.worker?.postMessage({
      type: "addBlock",
      data: {
        position: [position.x, position.y, position.z],
        type: type,
      },
    });
  }

  removeBlock(x: number, y: number, z: number, temporary?: boolean) {
    const blockToRemove = this.blocksMapping[x][y][z];

    blockToRemove?.destroy();

    if (!temporary) {
      this.removeBlockWorker({
        position: [x, y, z],
      });

      const newUpdateBlockChunk = getChunkCoordinate(x, z);
      const chunkName = nameChunkFromCoordinate(
        newUpdateBlockChunk.x,
        newUpdateBlockChunk.z
      );

      this.blocksWorldChunk[chunkName] = this.blocksWorldChunk[chunkName] || {};
      this.blocksWorldChunk[chunkName][nameFromCoordinate(x, y, z)] = 0;
    }
  }

  handleHoverBlock() {}

  handleGetBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene || !this.control?.isLocked) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12) return;

    const clickedDetail = detailFromName(intersects[0].object.name);

    const { type } = clickedDetail;

    this.inventoryManager.inventory[this.inventoryManager.currentFocusIndex] =
      type as keyof typeof blocks;
    this.inventoryManager.renderHotbar();
    if (this.inventoryManager.currentFocus)
      this.inventoryManager.renderLabelFocusItem(
        blocks[this.inventoryManager.currentFocus].name
      );
  }

  handleBreakBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene || !this.control?.isLocked) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12 || !intersects[0]) return;

    const clickedDetail = detailFromName(intersects[0].object.name);

    const { x, y, z, type } = clickedDetail;
    this.removeBlock(x, y, z);

    // play sound
    if (this.currentBreakSound) {
      this.currentBreakSound.pause();
      this.currentBreakSound.currentTime = 0;
    }

    this.currentBreakSound = blocks[type as keyof typeof blocks].break;

    this.currentBreakSound.play();
  }

  handlePlaceBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene || !this.control?.isLocked) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12 || !intersects[0]) return;

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
        this.inventoryManager.currentFocus,
        false
      );

      const chunk = getChunkCoordinate(blockPosition.x, blockPosition.z);
      const chunkName = nameChunkFromCoordinate(chunk.x, chunk.z);

      if (this.chunksBlocks[chunkName]) {
        this.chunksBlocks[chunkName].push(
          nameFromCoordinate(blockPosition.x, blockPosition.y, blockPosition.z)
        );
      }

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

  onMouseDown(e: MouseEvent) {
    switch (e.button) {
      case 0:
        // left click
        this.handleBreakBlock();
        break;
      case 1:
        // middle click
        this.handleGetBlock();
        break;
      case 2:
        // right click
        this.handlePlaceBlock();
    }
  }

  update() {
    // :( donno
    this.handleHoverBlock();
  }

  dispose() {
    document.removeEventListener("mousedown", this.onMouseDown.bind(this));
  }
}

import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector2,
  Vector3,
} from "three";

import { Face } from "@/constants/block";
import blocks, { BlockKeys } from "@/constants/blocks";
import { getChunkCoordinate } from "@/game/helpers/chunkHelpers";
import { detailFromName } from "@/game/helpers/detailFromName";
import {
  nameChunkFromCoordinate,
  nameFromCoordinate,
} from "@/game/helpers/nameFromCoordinate";

import { BLOCK_WIDTH } from "@/constants";
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

  blocksMapping: Map<string, Block> = new Map();

  blocksWorldChunk: Record<string, Record<string, BlockKeys | 0>> = {};
  chunksBlocks: Record<string, string[]> = {};

  chunksActive: string[] = [];

  blockDisplayHover = new Mesh(
    new BoxGeometry(BLOCK_WIDTH + 0.01, BLOCK_WIDTH + 0.01, BLOCK_WIDTH + 0.01),
    new MeshStandardMaterial({
      wireframe: true,
      visible: true,
    })
  );

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.inventoryManager = props.inventoryManager;
    this.blocksWorldChunk = props.worldStorage?.blocksWorldChunk || {};
  }

  async initialize() {
    this.blockDisplayHover.name = "helper";
    this.scene?.add(this.blockDisplayHover);

    document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
  }

  updateBlock({
    x,
    y,
    z,
    type,
    facesToRender,
  }: {
    x: number;
    y: number;
    z: number;
    type: BlockKeys | 0;
    facesToRender?: Record<Face, boolean>;
  }) {
    // if block marked as destroyed then return
    if (type == 0) {
      return;
    }

    const position = new Vector3(x, y, z);

    const block = new Block({
      position: position,
      scene: this.scene,
      type: type,
      blocksMapping: this.blocksMapping,
      facesToRender,
    });

    this.blocksMapping.set(nameFromCoordinate(x, y, z), block);
  }

  getIntersectObject() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene || !this.control?.isLocked) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (!intersects[0]) return;

    const intersectObject =
      intersects[0]?.object.name == "player" ? intersects[1] : intersects[0];

    if (intersectObject?.distance > 12) return;

    return intersectObject;
  }

  removeBlock(x: number, y: number, z: number, isClearChunk?: boolean) {
    const blockToRemove = this.blocksMapping.get(nameFromCoordinate(x, y, z));

    blockToRemove?.destroy(isClearChunk);
  }

  handleHoverBlock() {
    const intersectObj = this.getIntersectObject();

    if (!intersectObj) {
      this.blockDisplayHover.visible = false;
      return;
    }

    const clickedDetail = detailFromName(intersectObj.object.name);

    const { x, y, z } = clickedDetail;

    this.blockDisplayHover.visible = true;
    this.blockDisplayHover.position.set(x, y, z);
  }

  handleGetBlock() {
    const intersectObj = this.getIntersectObject();

    if (!intersectObj) return;

    const clickedDetail = detailFromName(intersectObj.object.name);

    const { type } = clickedDetail;

    this.inventoryManager.inventory[this.inventoryManager.currentFocusIndex] =
      type as BlockKeys;

    this.inventoryManager.renderHotbar();

    if (this.inventoryManager.currentFocus)
      this.inventoryManager.renderLabelFocusItem(
        blocks[this.inventoryManager.currentFocus].name
      );
  }

  handleBreakBlock() {
    const intersectObj = this.getIntersectObject();

    if (!intersectObj) return;

    const clickedDetail = detailFromName(intersectObj.object.name);

    const { x, y, z, type } = clickedDetail;

    if (type === "bedrock") return;
    if (type === "water") return;

    this.removeBlock(x, y, z);

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

    // play sound
    if (this.currentBreakSound) {
      this.currentBreakSound.pause();
      this.currentBreakSound.currentTime = 0;
    }

    this.currentBreakSound = blocks[type as BlockKeys].break;

    this.currentBreakSound.play();
  }

  handlePlaceBlock() {
    const intersectObj = this.getIntersectObject();

    if (!intersectObj) return;

    const clickedDetail = detailFromName(intersectObj.object.name);

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

    const placeType = this.inventoryManager.currentFocus;

    if (placeType) {
      this.updateBlock({
        x: blockPosition.x,
        y: blockPosition.y,
        z: blockPosition.z,
        type: placeType,
      });

      this.worker?.postMessage({
        type: "addBlock",
        data: {
          position: [blockPosition.x, blockPosition.y, blockPosition.z],
          type: placeType,
        },
      });

      const chunk = getChunkCoordinate(blockPosition.x, blockPosition.z);
      const chunkName = nameChunkFromCoordinate(chunk.x, chunk.z);

      this.chunksBlocks[chunkName]?.push(
        nameFromCoordinate(blockPosition.x, blockPosition.y, blockPosition.z)
      );

      const coorName = nameFromCoordinate(x, y, z);

      this.blocksWorldChunk[chunkName] = this.blocksWorldChunk[chunkName] || {};
      this.blocksWorldChunk[chunkName][coorName] = placeType;

      // play sound
      if (this.currentPlaceSound) {
        this.currentPlaceSound.pause();
        this.currentPlaceSound.currentTime = 0;
      }

      this.currentPlaceSound = blocks[placeType].place;

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

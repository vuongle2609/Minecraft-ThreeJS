import {
  DynamicDrawUsage,
  InstancedMesh,
  Object3D,
  Vector2,
  Vector3,
} from "three";

import { Face } from "@/constants/block";
import blocks, { BlockKeys, renderGeometry } from "@/constants/blocks";
import { getChunkCoordinate } from "@/game/helpers/chunkHelpers";
import { detailFromName } from "@/game/helpers/detailFromName";
import {
  nameChunkFromCoordinate,
  nameFromCoordinate,
} from "@/game/helpers/nameFromCoordinate";

import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";
import InventoryManager from "./inventoryManager";
import { BlocksInstancedMapping } from "@/type";

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

  dummy = new Object3D();

  blocksInstanced = Object.keys(blocks).reduce((prev, typeKey) => {
    const currBlock = blocks[typeKey as keyof typeof blocks];

    return {
      ...prev,
      [typeKey]: Object.keys(currBlock.texture).reduce((prev, key) => {
        const mesh = new InstancedMesh(
          renderGeometry,
          currBlock.texture[key as unknown as keyof typeof currBlock.texture],
          1000000
        );

        mesh.instanceMatrix.setUsage(DynamicDrawUsage);
        mesh.count = 0;
        mesh.frustumCulled = false;
        mesh.name = typeKey + "_" + key;

        this.scene?.add(mesh);

        return {
          ...prev,
          [key]: {
            mesh,
            count: 0,
            indexCanAllocate: [],
          },
        };
      }, {}),
    };
  }, {}) as BlocksInstancedMapping;

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.inventoryManager = props.inventoryManager;
    this.blocksWorldChunk = props.worldStorage?.blocksWorldChunk || {};
  }

  async initialize() {
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
      instancedPlanes: this.blocksInstanced[type],
      dummy: this.dummy,
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

  removeBlock(
    x: number,
    y: number,
    z: number,
    isClearChunk?: boolean,
    updateMatrix?: boolean
  ) {
    const blockToRemove = this.blocksMapping.get(nameFromCoordinate(x, y, z));

    blockToRemove?.destroy({ isClearChunk, updateMatrix });
  }

  handleHoverBlock() {}

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

    this.removeBlock(x, y, z, false, true);

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

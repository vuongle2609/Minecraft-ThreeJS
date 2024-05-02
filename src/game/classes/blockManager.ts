import blocks, {
  BlockKeys,
  BlockTextureType,
  renderGeometry,
} from "@/constants/blocks";
import { getChunkCoordinate } from "@/game/helpers/chunkHelpers";
import { detailFromName } from "@/game/helpers/detailFromName";
import {
  nameChunkFromCoordinate,
  nameFromCoordinate,
} from "@/game/helpers/nameFromCoordinate";
import {
  DynamicDrawUsage,
  InstancedMesh,
  Object3D,
  Vector2,
  Vector3,
} from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

import Block from "./block";
import InventoryManager from "./inventoryManager";
import { Face } from "@/constants/block";

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

  dummy = new Object3D();
  blocksIntanced = Object.keys(blocks).reduce((prev, typeKey) => {
    const currBlock = blocks[typeKey as keyof typeof blocks];

    return {
      ...prev,
      [typeKey]: Object.keys(currBlock.texture).reduce((prev, key) => {
        const mesh = new InstancedMesh(
          renderGeometry,
          currBlock.texture[key as unknown as keyof typeof currBlock.texture],
          700000
        );

        mesh.instanceMatrix.setUsage(DynamicDrawUsage);

        this.scene?.add(mesh);
        mesh.count = 0;
        mesh.instanceMatrix.needsUpdate = true;
        mesh.frustumCulled = false;
        return {
          ...prev,
          [key]: {
            mesh,
            count: 0,
          },
        };
      }, {}),
    };
  }, {}) as Record<
    BlockKeys,
    Record<
      BlockTextureType,
      {
        mesh: InstancedMesh;
        count: number;
      }
    >
  >;

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

  updateBlock({
    x,
    y,
    z,
    type,
    isRenderChunk,
    shouldNotRenderIntoScene,
  }: {
    x: number;
    y: number;
    z: number;
    type: keyof typeof blocks;
    isRenderChunk?: boolean;
    shouldNotRenderIntoScene?: boolean;
  }) {
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
      shouldNotRender: shouldNotRenderIntoScene,
      dummy: this.dummy,
      intancedPlanes: this.blocksIntanced[type],
    });

    this.blocksMapping[x] = {
      ...this.blocksMapping[x],
      [y]: {
        ...this.blocksMapping[x]?.[y],
        [z]: block,
      },
    };
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
    const intersectObj = this.getIntersectObject();

    if (!intersectObj) return;

    const clickedDetail = detailFromName(intersectObj.object.name);

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
    const intersectObj = this.getIntersectObject();

    if (!intersectObj) return;

    const clickedDetail = detailFromName(intersectObj.object.name);

    const { x, y, z, type } = clickedDetail;

    if (type === "bedrock") return;

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
    const intersectObj = this.getIntersectObject();

    if (!intersectObj) return;

    const clickedDetail = detailFromName(intersectObj.object.name);
    // console.log(intersects[0].object.rotation);

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
      this.updateBlock({
        x: blockPosition.x,
        y: blockPosition.y,
        z: blockPosition.z,
        type: this.inventoryManager.currentFocus,
        isRenderChunk: false,
      });

      this.worker?.postMessage({
        type: "addBlock",
        data: {
          position: [blockPosition.x, blockPosition.y, blockPosition.z],
          type: this.inventoryManager.currentFocus,
        },
      });

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

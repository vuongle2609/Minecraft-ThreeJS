import {
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  Object3D,
  Vector2,
  Vector3,
} from "three";

import { Face } from "@/constants/block";
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

import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";
import InventoryManager from "./inventoryManager";
import { BlocksInstancedMapping, BlocksInstancedType } from "@/type";
import { getFaceFromRotation } from "../helpers/getFaceFromRotaion";
import { BLOCK_WIDTH } from "@/constants";

interface PropsType {
  inventoryManager: InventoryManager;
}

export default class BlockManager extends BaseEntity {
  inventoryManager: InventoryManager;

  currentPlaceSound: HTMLAudioElement;

  currentBreakSound: HTMLAudioElement;

  blocksMapping: Record<string, Record<string, Record<string, Block>>> = {};

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
    isRenderChunk,
    facesToRender,
  }: {
    x: number;
    y: number;
    z: number;
    type: BlockKeys;
    isRenderChunk?: boolean;
    facesToRender?: Record<Face, boolean>;
    updateMatrix?: boolean;
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
      facesToRender,
      dummy: this.dummy,
      intancedPlanes: this.blocksInstanced[type],
    });

    this.blocksMapping[x] = {
      ...this.blocksMapping[x],
      [y]: {
        ...this.blocksMapping[x]?.[y],
        [z]: block,
      },
    };

    return this.blocksInstanced[type];
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
    temporary?: boolean,
    updateMatrix?: boolean
  ) {
    const blockToRemove = this.blocksMapping[x][y][z];

    blockToRemove?.destroy(updateMatrix);

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

    const [type] = intersectObj.object.name.split("_");

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

    const [type, intancedIndex] = intersectObj.object.name.split("_");

    const currentInstanced =
      this.blocksInstanced[type as BlockKeys][
        intancedIndex as unknown as BlockTextureType
      ];

    const holderMatrix = new Matrix4();

    // if (!intersectObj.instanceId) return;

    currentInstanced.mesh.getMatrixAt(
      intersectObj.instanceId as number,
      holderMatrix
    );

    const dummy = new Object3D();
    dummy.applyMatrix4(holderMatrix);

    const { x, y, z } = dummy.position;

    if (type === "bedrock") return;

    this.removeBlock(x, y, z, false, true);

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

    const [type, intancedIndex] = intersectObj.object.name.split("_");

    const currentInstanced =
      this.blocksInstanced[type as BlockKeys][
        intancedIndex as unknown as BlockTextureType
      ];

    const holderMatrix = new Matrix4();

    if (!intersectObj.instanceId) return;

    currentInstanced.mesh.getMatrixAt(intersectObj.instanceId, holderMatrix);

    const dummy = new Object3D();
    dummy.applyMatrix4(holderMatrix);

    const clickedFace = getFaceFromRotation(dummy.rotation);

    const { x, y, z } = dummy.position;

    const blockPosition = new Vector3();

    switch (clickedFace) {
      case Face.top:
        blockPosition.set(x, y + BLOCK_WIDTH, z);
        break;
      case Face.bottom:
        blockPosition.set(x, y - BLOCK_WIDTH, z);
        break;
      case Face.leftX:
        blockPosition.set(x + BLOCK_WIDTH, y, z);
        break;
      case Face.rightX:
        blockPosition.set(x - BLOCK_WIDTH, y, z);
        break;
      case Face.leftZ:
        blockPosition.set(x, y, z + BLOCK_WIDTH);
        break;
      case Face.rightZ:
        blockPosition.set(x, y, z - BLOCK_WIDTH);
        break;
    }

    if (this.inventoryManager.currentFocus) {
      const instanced = this.updateBlock({
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

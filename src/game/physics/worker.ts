import { Vector3 } from "three";

import { BlockKeys, BlocksMappingType, PlayerInput } from "@/type";

import { CHUNK_SIZE, FLAT_WORLD_TYPE, TIME_TO_INTERACT } from "@/constants";
import {
  CHARACTER_LENGTH,
  GRAVITY,
  GRAVITY_SCALE,
  JUMP_FORCE,
  SPEED,
} from "@/constants/player";
import {
  nameChunkFromCoordinate,
  nameFromCoordinate,
} from "@/game/helpers/nameFromCoordinate";
import Physics from "./physics";
import { FlatWorld } from "../terrant/flatWorldGeneration";
import { DefaultWorld } from "../terrant/worldGeneration";
import { getChunkCoordinate } from "../helpers/chunkHelpers";
import {
  getBoundingBoxBlock,
  getBoundingBoxPlayer,
  isBoundingBoxCollide,
} from "../helpers/bounding";
import Control from "./control";

class PhysicsWorker {
  worldGen: FlatWorld | DefaultWorld;
  chunkBlocksCustomMap: Record<string, BlocksMappingType> = {};

  blocksMapping: Map<string, BlockKeys | 0> = new Map();

  spawn = [CHUNK_SIZE / 2, CHARACTER_LENGTH + 60, CHUNK_SIZE / 2];
  playerPos = new Vector3();

  originalVy = -40;
  vy = this.originalVy;
  onGround = true;

  physicsEngine = new Physics(this.blocksMapping);
  control = new Control();

  constructor() {}

  calculateMovement({
    forwardVectorArr,
    delta,
    keys,
  }: {
    forwardVectorArr: number[];
    delta: number;
    keys: PlayerInput;
  }) {
    const directionVector = new Vector3();

    if (keys.left) {
      directionVector.x += 1;
    }

    if (keys.right) {
      directionVector.x -= 1;
    }

    if (keys.forward) {
      directionVector.z += 1;
    }

    if (keys.backward) {
      directionVector.z -= 1;
    }

    if (keys.space && this.onGround) {
      this.vy = JUMP_FORCE;
      this.onGround = false;
    }

    const forwardVector = new Vector3(
      forwardVectorArr[0],
      forwardVectorArr[1],
      forwardVectorArr[2]
    );

    forwardVector.y = 0;
    forwardVector.normalize();

    const vectorUp = new Vector3(0, 1, 0);

    const vectorRight = vectorUp.clone().crossVectors(vectorUp, forwardVector);

    const moveVector = new Vector3().addVectors(
      forwardVector.clone().multiplyScalar(directionVector.z),
      vectorRight.multiplyScalar(directionVector.x)
    );

    moveVector.normalize().multiplyScalar(delta * SPEED);
    //https://www.cgtrader.com/free-3d-models/character/man/minecraft-steve-low-poly-rigged

    if (this.vy > this.originalVy) {
      this.vy -= GRAVITY * GRAVITY_SCALE * delta;
    }

    // round final result y if odd then make it even
    const {
      calculatedMoveVector: correctMovement,
      objectBottom,
      objectTop,
      isOnWater,
      isUnderWater,
    } = this.physicsEngine.calculateCorrectMovement(
      new Vector3(moveVector.x, moveVector.y + this.vy * delta, moveVector.z),
      this.playerPos
    );

    if (isOnWater) {
      correctMovement.multiplyScalar(1 / 2);
    }

    if (!objectBottom && this.onGround) {
      this.vy = -10;
      this.onGround = false;
    }

    if (objectTop) {
      this.vy = -3;
    }

    if (objectBottom) {
      this.onGround = true;
      // this.playerPos.y = Math.round(this.playerPos.y);
    }

    this.playerPos.add(
      new Vector3(correctMovement.x, correctMovement.y, correctMovement.z)
    );

    if (this.playerPos.y < -61) {
      const [x, y, z] = this.spawn;
      this.playerPos.set(x, y, z);
    }

    self.postMessage({
      type: "updatePosition",
      data: {
        position: [this.playerPos.x, this.playerPos.y, this.playerPos.z],
        onGround: this.onGround,
        objectBottom,
      },
    });
  }

  initFunc: undefined | Function = () =>
    setTimeout(() => {
      this.eventMapping = {
        ...this.eventMapping,
        calculateMovement: this.calculateMovement.bind(this),
      };

      self.postMessage({
        type: "removeLoading",
        data: {},
      });
    }, TIME_TO_INTERACT);

  initPhysics() {
    this.initFunc?.();
    this.initFunc = undefined;
  }

  requestPlaceBlock({
    position,
    type,
  }: {
    position: number[];
    type: BlockKeys;
  }) {
    const blockBoundingBox = getBoundingBoxBlock(
      position[0],
      position[1],
      position[2]
    );
    const playerPos = this.playerPos.clone();
    playerPos.y -= CHARACTER_LENGTH / 2;
    const playerBoundingBox = getBoundingBoxPlayer(
      playerPos.x,
      playerPos.y,
      playerPos.z
    );

    const isPlaceBlockCollideWithPlayer = isBoundingBoxCollide(
      blockBoundingBox.min,
      blockBoundingBox.max,
      playerBoundingBox.min,
      playerBoundingBox.max
    );

    if (!isPlaceBlockCollideWithPlayer) {
      this.addBlock({ position, type });

      self.postMessage({
        type: "renderPlaceBlock",
        data: {
          position,
          type,
        },
      });
    }
  }

  addBlock({ position, type }: { position: number[]; type: BlockKeys }) {
    this.blocksMapping.set(
      nameFromCoordinate(position[0], position[1], position[2]),
      type as BlockKeys
    );
  }

  addBlocks({ arrayBlocksData }: { arrayBlocksData: Int32Array }) {
    let tmpPos: number[] = [];
    const lengthCached = arrayBlocksData.length;

    for (let index = 0; index < lengthCached; index++) {
      const num = arrayBlocksData[index];

      if (tmpPos.length === 3) {
        const key = nameFromCoordinate(tmpPos[0], tmpPos[1], tmpPos[2]);

        this.blocksMapping.set(key, num);
        tmpPos = [];
      } else {
        tmpPos.push(num);
      }
    }
  }

  genFirstChunk(initPos: number[]) {
    const { x, z } = getChunkCoordinate(initPos[0], initPos[1], initPos[2]);

    const { blocksInChunk } = this.worldGen.getBlocksInChunk(
      x,
      z,
      this.chunkBlocksCustomMap[nameChunkFromCoordinate(x, z)]
    );

    for (const [_, { position, type }] of blocksInChunk) {
      this.addBlock({
        position,
        type,
      });
    }

    this.initPhysics();
  }

  init({
    seed,
    type,
    chunkBlocksCustom,
    initPos,
  }: {
    seed: number;
    type: number;
    chunkBlocksCustom: Record<string, BlocksMappingType>;
    initPos: number[];
  }) {
    this.worldGen =
      type === FLAT_WORLD_TYPE ? new FlatWorld(seed) : new DefaultWorld(seed);

    this.chunkBlocksCustomMap = chunkBlocksCustom;

    const newInitPos = initPos || this.spawn;

    this.playerPos.set(newInitPos[0], newInitPos[1], newInitPos[2]);

    this.genFirstChunk(newInitPos);
  }

  removeBlock({ position }: { position: number[] }) {
    this.blocksMapping.delete(
      nameFromCoordinate(position[0], position[1], position[2])
    );
  }

  eventMapping: Record<string, Function> = {
    addBlock: this.addBlock.bind(this),
    removeBlock: this.removeBlock.bind(this),
    init: this.init.bind(this),
    addBlocks: this.addBlocks.bind(this),
    requestPlaceBlock: this.requestPlaceBlock.bind(this),
  };
}

let physicsWorker = new PhysicsWorker();

self.onmessage = (
  e: MessageEvent<{
    type: string;
    data: any;
  }>
) => {
  const funcWorker = physicsWorker.eventMapping[
    e.data.type as keyof typeof physicsWorker
  ] as Function;

  funcWorker?.(e.data.data);
};

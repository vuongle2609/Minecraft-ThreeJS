import { Vector3 } from "three";

import { BlockKeys, BlocksMappingType } from "@/type";

import { CHUNK_SIZE, FLAT_WORLD_TYPE, TIME_TO_INTERACT } from "@/constants";
import {
  CHARACTER_LENGTH,
  CHARACTER_WIDTH,
  GRAVITY,
  GRAVITY_SCALE,
  JUMP_FORCE,
  SPEED,
} from "@/constants/player";
import {
  nameChunkFromCoordinate,
  nameFromCoordinate,
} from "@/game/helpers/nameFromCoordinate";
import { FlatWorld } from "../terrant/flatWorldGeneration";
import { DefaultWorld } from "../terrant/worldGeneration";
import { getChunkCoordinate } from "../helpers/chunkHelpers";
import { Physics, PlayerState } from "prismarine-physics";
const mcData = require("minecraft-data")("1.13.2");
const Block = require("prismarine-block")("1.13.2");

const fakeWorld = {
  getBlock: (pos) => {
    const type =
      pos.y < 60 ? mcData.blocksByName.stone.id : mcData.blocksByName.air.id;
    const b = new Block(type, 0, 0);
    b.position = pos;
    return b;
  },
};

function fakePlayer(pos: any, baseVersion: any) {
  return {
    entity: {
      position: pos,
      velocity: new Vector3(0, 0, 0),
      onGround: false,
      isInWater: false,
      isInLava: false,
      isInWeb: false,
      elytraFlying: false,
      isCollidedHorizontally: false,
      isCollidedVertically: false,
      yaw: 0,
      pitch: 0,
      effects: [],
    },
    inventory: {
      slots: [],
    },
    jumpTicks: 0,
    jumpQueued: false,
    fireworkRocketDuration: 0,
    version: baseVersion,
  };
}

class PhysicsWorker {
  worldGen: FlatWorld | DefaultWorld;
  chunkBlocksCustomMap: Record<string, BlocksMappingType> = {};

  blocksMapping: Map<string, BlockKeys | 0> = new Map();

  spawn = [CHUNK_SIZE / 2, CHARACTER_LENGTH + 60, CHUNK_SIZE / 2];
  playerPos = new Vector3();

  originalVy = -40;
  vy = this.originalVy;
  onGround = true;

  physicsEngine = Physics(mcData, fakeWorld);

  playerBody = this.physicsEngine.addBody(
    this.getBoundingBoxPlayer(0, 40, 0, CHARACTER_WIDTH, CHARACTER_LENGTH),
    4,
    4,
    1,
    1,
    () => {
      console.log("collide");
    }
  );
  constructor() {}

  getBoundingBoxPlayer(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number
  ) {
    return {
      vec: [x + width / 2, y + height, z + width / 2],
      base: [x - width / 2, y, z - width / 2],
    };
  }

  getBoundingBoxBlock(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number
  ) {
    return {
      vec: [x + width / 2, y + height / 2, z + width / 2],
      base: [x - width / 2, y - width / 2, z - width / 2],
    };
  }

  calculateMovement({
    directionVectorArr,
    forwardVectorArr,
    position,
    delta,control
  }: {
    forwardVectorArr: number[];
    directionVectorArr: number[];
    position: number[];
    delta: number;control: any
  }) {
    console.log(control);

    // self.postMessage(
    //   {
    //     type: "updatePosition",
    //     data: {
    //       position: playerPos,
    //       onGround: this.onGround,
    //       // collideObject,
    //     },
    //   },
    //   //@ts-ignore
    //   [playerPos.buffer]
    // );
  }

  jumpCharacter() {
    if (this.onGround) {
      this.vy = JUMP_FORCE;
      this.onGround = false;
    }
  }

  initFunc: undefined | Function = () =>
    setTimeout(() => {
      this.eventMapping = {
        ...this.eventMapping,
        calculateMovement: this.calculateMovement.bind(this),
      };
const a = 1;
      self.postMessage({
        type: "removeLoading",
        data: {},
      });
    }, TIME_TO_INTERACT);

  initPhysics() {
    this.initFunc?.();
    this.initFunc = undefined;
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
    jumpCharacter: this.jumpCharacter.bind(this),
    init: this.init.bind(this),
    addBlocks: this.addBlocks.bind(this),
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

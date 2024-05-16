import { Vector3 } from "three";

import { BlocksMappingType } from "@/type";

import { CHUNK_SIZE, FLAT_WORLD_TYPE, TIME_TO_INTERACT } from "../../constants";
import {
  CHARACTER_LENGTH,
  CHARACTER_RADIUS,
  GRAVITY,
  GRAVITY_SCALE,
  JUMP_FORCE,
  SPEED,
} from "../../constants/player";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";
import { FlatWorld } from "../terrant/flatWorldGeneration";
import { DefaultWorld } from "../terrant/worldGeneration";
import Physics from "./physics";

class PhysicsWorker {
  worldGen: FlatWorld | DefaultWorld;

  chunkBlocksCustomMap: Record<string, BlocksMappingType> = {};
  chunkGenerated: Record<string, boolean> = {};

  blocksMapping: Record<string, string | 0> = {};

  spawn = [CHUNK_SIZE / 2, CHARACTER_LENGTH + 60, CHUNK_SIZE / 2];
  playerPos = new Vector3();

  originalVy = -40;
  vy = this.originalVy;
  onGround = true;

  physicsEngine = new Physics();

  constructor() {}

  roundedPosition(position: Vector3) {
    const positionXFloor = 2 * Math.round((position.x + CHARACTER_RADIUS) / 2);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor = 2 * Math.round((position.z + CHARACTER_RADIUS) / 2);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  calculateMovement = ({
    directionVectorArr,
    forwardVectorArr,
    position,
    delta,
  }: {
    forwardVectorArr: number[];
    directionVectorArr: number[];
    position: number[];
    delta: number;
  }) => {
    const forwardVector = new Vector3(
      forwardVectorArr[0],
      forwardVectorArr[1],
      forwardVectorArr[2]
    );

    const directionVector = new Vector3(
      directionVectorArr[0],
      directionVectorArr[1],
      directionVectorArr[2]
    );

    const playerPosition = new Vector3(position[0], position[1], position[2]);

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

    const { calculatedMoveVector: correctMovement, collideObject } =
      this.physicsEngine.calculateCorrectMovement(
        new Vector3(moveVector.x, moveVector.y + this.vy * delta, moveVector.z),
        playerPosition,
        this.blocksMapping
      );

    if (!collideObject && this.onGround) {
      this.vy = -10;
      this.onGround = false;
    }

    if (collideObject) {
      this.onGround = true;
    }

    this.playerPos.add(
      new Vector3(correctMovement.x, correctMovement.y, correctMovement.z)
    );

    if (this.playerPos.y < -61) {
      this.playerPos.copy(
        new Vector3(CHUNK_SIZE / 2, CHARACTER_LENGTH + 60, CHUNK_SIZE / 2)
      );
    }

    self.postMessage({
      type: "updatePosition",
      data: {
        position: [this.playerPos.x, this.playerPos.y, this.playerPos.z],
        onGround: this.onGround,
        collideObject,
      },
    });
  };

  jumpCharacter = () => {
    if (this.onGround) {
      this.vy = JUMP_FORCE;
      this.onGround = false;
    }
  };

  initFunc: undefined | Function = () =>
    setTimeout(() => {
      this.eventMapping = {
        ...this.eventMapping,
        calculateMovement: this.calculateMovement,
      };
    }, TIME_TO_INTERACT);

  initPhysics = () => {
    this.initFunc?.();
    this.initFunc = undefined;
  };

  addBlock = ({ position, type }: { position: number[]; type: string }) => {
    this.blocksMapping = {
      ...this.blocksMapping,
      [nameFromCoordinate(position[0], position[1], position[2])]: type,
    };
  };

  init = ({
    seed,
    type,
    chunkBlocksCustom,
    initPos,
  }: {
    seed: number;
    type: number;
    chunkBlocksCustom: Record<string, BlocksMappingType>;
    initPos: number[];
  }) => {
    this.worldGen =
      type === FLAT_WORLD_TYPE ? new FlatWorld(seed) : new DefaultWorld(seed);

    this.chunkBlocksCustomMap = chunkBlocksCustom;

    if (initPos) this.playerPos.set(initPos[0], initPos[1] + 60, initPos[2]);
    else this.playerPos.set(this.spawn[0], this.spawn[1], this.spawn[2]);
  };

  changeChunk = async ({
    neighborChunksKeys,
  }: {
    neighborChunksKeys: string[];
  }) => {
    if (!this.worldGen)
      await (() =>
        new Promise((resolve, reject) => {
          const check = setInterval(() => {
            if (this.worldGen) {
              clearInterval(check);
              resolve(true);
            }
          }, 200);
        }))();

    neighborChunksKeys.forEach((key) => {
      if (!this.chunkGenerated[key]) {
        const [x, z] = key.split("_");

        const { blocksInChunkTypeOnly } = this.worldGen.getBlocksInChunk(
          Number(x),
          Number(z),
          this.chunkBlocksCustomMap?.[key] || {}
        );

        this.chunkGenerated[key] = true;

        this.blocksMapping = {
          ...this.blocksMapping,
          ...blocksInChunkTypeOnly,
        };
      }
    });

    if (Object.values(this.chunkGenerated).length === 9) this.initPhysics();
  };

  removeBlock = ({ position }: { position: number[] }) => {
    delete this.blocksMapping[
      nameFromCoordinate(position[0], position[1], position[2])
    ];
  };

  eventMapping: Record<string, Function> = {
    addBlock: this.addBlock,
    removeBlock: this.removeBlock,
    jumpCharacter: this.jumpCharacter,
    changeChunk: this.changeChunk,
    init: this.init,
  };
}

let physicsWorker = new PhysicsWorker();

self.onmessage = (
  e: MessageEvent<{
    type: string;
    data: any;
  }>
) => {
  const funcWorker = physicsWorker[
    e.data.type as keyof typeof physicsWorker
  ] as Function;

  funcWorker?.(e.data.data);
};

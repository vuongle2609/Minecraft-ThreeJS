import { Vector3 } from "three";

import { BlockKeys } from "@/type";

import { CHUNK_SIZE, TIME_TO_INTERACT } from "@/constants";
import {
  CHARACTER_LENGTH,
  GRAVITY,
  GRAVITY_SCALE,
  JUMP_FORCE,
  SPEED,
} from "@/constants/player";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import Physics from "./physics";

class PhysicsWorker {
  chunkGenerated = 0;

  blocksMapping: Map<string, BlockKeys | 0> = new Map();

  spawn = [CHUNK_SIZE / 2, CHARACTER_LENGTH + 40, CHUNK_SIZE / 2];
  playerPos = new Vector3();

  originalVy = -40;
  vy = this.originalVy;
  onGround = true;

  physicsEngine = new Physics();

  constructor() {}

  calculateMovement({
    directionVectorArr,
    forwardVectorArr,
    position,
    delta,
  }: {
    forwardVectorArr: number[];
    directionVectorArr: number[];
    position: number[];
    delta: number;
  }) {
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
      this.vy = -5;
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
    this.chunkGenerated += 1;

    if (this.chunkGenerated === 9) {
      this.initPhysics();
    }
  }

  init({ initPos }: { initPos: number[] }) {
    if (initPos) {
      this.playerPos.set(initPos[0], initPos[1] + 0.5, initPos[2]);
    } else {
      this.playerPos.set(this.spawn[0], this.spawn[1], this.spawn[2]);
    }
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

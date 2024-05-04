import { Vector3 } from 'three';

import { BlocksMappingType } from '@/type';

import { BLOCK_WIDTH, CHUNK_SIZE, FLAT_WORLD_TYPE, TIME_TO_INTERACT } from '../../constants';
import {
    CHARACTER_LENGTH, GRAVITY, GRAVITY_SCALE, JUMP_FORCE, SPEED
} from '../../constants/player';
import { nameFromCoordinate } from '../helpers/nameFromCoordinate';
import { FlatWorld } from '../terrant/flatWorldGeneration';
import { DefaultWorld } from '../terrant/worldGeneration';
import Physics from './physics';

let blocksMapping: Record<string, any> = {};

let originalVy = -40;
let vy = originalVy;
let onGround = true;

const physicsEngine = new Physics();

const calculateMovement = ({
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

  const playerPostion = new Vector3(position[0], position[1], position[2]);

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

  if (vy > originalVy) {
    vy -= GRAVITY * GRAVITY_SCALE * delta;
  }

  const { calculatedMoveVector: correctMovement, collideObject } =
    physicsEngine.calculateCorrectMovement(
      new Vector3(moveVector.x, moveVector.y + vy * delta, moveVector.z),
      playerPostion,
      blocksMapping
    );

  if (!collideObject && onGround) {
    vy = -10;
    onGround = false;
  }

  if (collideObject) {
    onGround = true;
  }

  self.postMessage({
    type: "updatePosition",
    data: {
      position: [correctMovement.x, correctMovement.y, correctMovement.z],
      onGround,
      collideObject,
    },
  });
};

const jumpCharacter = () => {
  if (onGround) {
    vy = JUMP_FORCE;
    onGround = false;
  }
};

let initFunc: undefined | Function = () =>
  setTimeout(() => {
    eventMapping = { ...eventMapping, calculateMovement };
  }, TIME_TO_INTERACT);

const initPhysics = () => {
  initFunc?.();
  initFunc = undefined;
};

const addBlock = ({ position, type }: { position: number[]; type: string }) => {
  blocksMapping = {
    ...blocksMapping,
    [nameFromCoordinate(position[0], position[1], position[2])]: type,
  };
};

let worldGen: FlatWorld | DefaultWorld;

let chunkBlocksCustom: Record<string, BlocksMappingType> = {};

const initSeed = ({
  seed,
  type,
  chunkBlocksCustomInit,
}: {
  seed: number;
  type: number;
  chunkBlocksCustomInit: Record<string, BlocksMappingType>;
}) => {
  worldGen =
    type === FLAT_WORLD_TYPE ? new FlatWorld(seed) : new DefaultWorld(seed);

  chunkBlocksCustom = chunkBlocksCustomInit;
};

const chunkGenerated: Record<string, boolean> = {};

const changeChunk = async ({
  neighborChunksKeys,
}: {
  neighborChunksKeys: string[];
}) => {
  await (() =>
    new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (worldGen) {
          clearInterval(check);
          resolve(true);
        }
      }, 200);
    }))();

  neighborChunksKeys.forEach((key) => {
    if (!chunkGenerated[key]) {
      const [x, z] = key.split("_");

      const { blocksInChunkTypeOnly } = worldGen.getBlocksInChunk(
        Number(x),
        Number(z),
        chunkBlocksCustom?.[key] || {}
      );

      chunkGenerated[key] = true;

      blocksMapping = {
        ...blocksMapping,
        ...blocksInChunkTypeOnly,
      };
    }
  });

  if (Object.values(chunkGenerated).length === 9) initPhysics();
};

let playerInitPos = [CHUNK_SIZE / 2, CHARACTER_LENGTH + 0.5, CHUNK_SIZE / 2];
let shouldReturnPosY = false;

const getPlayerShouldSpawn = (blocks: Record<string, any>) => {
  const pos = [...playerInitPos];

  let shouldStop = false;
  let countY = 0;

  while (!shouldStop) {
    if (blocks[nameFromCoordinate(pos[0], countY, pos[2])]) {
      countY += BLOCK_WIDTH;
    } else {
      shouldStop = true;
    }
  }
  shouldReturnPosY = false;
  return [pos[0], countY + 1, pos[2]];
};

const requestPosY = () => {
  shouldReturnPosY = true;
};

const removeBlock = ({ position }: { position: number[] }) => {
  delete blocksMapping[
    nameFromCoordinate(position[0], position[1], position[2])
  ];
};

let eventMapping: Record<string, Function> = {
  addBlock,
  removeBlock,
  jumpCharacter,
  requestPosY,
  changeChunk,
  initSeed,
};

self.onmessage = (
  e: MessageEvent<{
    type: keyof typeof eventMapping;
    data: any;
  }>
) => {
  eventMapping[e.data.type]?.(e.data.data);
};

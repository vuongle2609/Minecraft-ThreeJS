import { Vector3 } from "three";
import nameFromCoordinate from "../helpers/nameFromCoordinate";
import { SPEED, GRAVITY, GRAVITY_SCALE, JUMP_FORCE } from "@/constants/player";
import Physics from "./physics";
import blocks from "@/constants/blocks";
import { CHUNK_SIZE } from "@/constants";

let blocksMapping: Record<string, string | 0> = {};

const addBlock = ({ position, type }: { position: number[]; type: string }) => {
  blocksMapping = {
    ...blocksMapping,
    [nameFromCoordinate(position[0], position[1], position[2])]: type,
  };
};

const removeBlock = ({ position }: { position: number[] }) => {
  delete blocksMapping[
    nameFromCoordinate(position[0], position[1], position[2])
  ];
};

let originalVy = -25;
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

const fakeGenterrant = () => {
  const width = CHUNK_SIZE;
  const height = 2;
  const halfWidth = width / 2;

  const blocksRender = [];

  // maybe remove
  Object.keys(blocksMapping).forEach((key) => {
    const position = key.split("_").map(Number);
    const blockAdding = { position, type: blocksMapping[key] };

    blocksRender.push(blockAdding);
  });

  for (let c = 0; c < height; c++) {
    for (let i = -halfWidth; i < halfWidth; i++) {
      for (let j = -halfWidth; j < halfWidth; j++) {
        const position = [i * 2, c * -2, j * 2];
        const blockAdding = { position, type: "grass" };

        if (
          blocksMapping[
            nameFromCoordinate(position[0], position[1], position[2])
          ] !== 0 ||
          blocksMapping[
            nameFromCoordinate(position[0], position[1], position[2])
          ]
        ) {
          addBlock(blockAdding);
          blocksRender.push(blockAdding);
        }
      }
    }
  }

  self.postMessage({
    type: "renderBlocks",
    data: {
      blocksRender,
    },
  });

  // start allow calculate physics
  setTimeout(() => {
    eventMapping = { ...eventMapping, calculateMovement };
  }, 500);
};

const jumpCharacter = () => {
  if (onGround) {
    vy = JUMP_FORCE;
    onGround = false;
  }
};

const initBlocks = ({
  blocksInit,
}: {
  blocksInit: Record<string, keyof typeof blocks | 0>;
}) => {
  blocksMapping = { ...blocksMapping, ...blocksInit };

  fakeGenterrant();
};

let eventMapping: Record<string, Function> = {
  addBlock,
  removeBlock,
  jumpCharacter,
  initBlocks,
};

self.onmessage = (
  e: MessageEvent<{
    type: keyof typeof eventMapping;
    data: any;
  }>
) => {
  eventMapping[e.data.type]?.(e.data.data);
};

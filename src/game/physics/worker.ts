import { Vector3 } from "three";
import { TIME_TO_INTERACT } from "../../constants";
import {
  GRAVITY,
  GRAVITY_SCALE,
  JUMP_FORCE,
  SPEED,
} from "../../constants/player";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";
import Physics from "./physics";

let blocksMapping: Record<string, string | 0> = {};

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

const bulkAddBlock = ({ blocks }: { blocks: Record<string, string | 0> }) => {
  initPhysics();
  blocksMapping = {
    ...blocksMapping,
    ...blocks,
  };
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
  bulkAddBlock,
};

self.onmessage = (
  e: MessageEvent<{
    type: keyof typeof eventMapping;
    data: any;
  }>
) => {
  eventMapping[e.data.type]?.(e.data.data);
};

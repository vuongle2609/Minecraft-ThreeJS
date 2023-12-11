import { Vector3 } from "three";
import nameFromCoordinate from "../helpers/nameFromCoordinate";
import { SPEED, GRAVITY, GRAVITY_SCALE, JUMP_FORCE } from "../../constants/player";
import Physics from ".";

let blocksMapping: Record<string, string> = {};

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

const physicsTest = new Physics({});

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
    physicsTest.calculateCorrectMovement(
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

const eventMapping = {
  addBlock,
  removeBlock,
  calculateMovement,
  jumpCharacter,
};

self.onmessage = (
  e: MessageEvent<{
    type: keyof typeof eventMapping;
    data: any;
  }>
) => {
  eventMapping[e.data.type](e.data.data);
};

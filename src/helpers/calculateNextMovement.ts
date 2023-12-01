import { Scene, Vector3 } from "three";
import nameFromCoordinate from "./nameFromCoordinate";

const calculateNextMovement = (
  vectorMove: Vector3,
  playerPosition: Vector3,
  scene: Scene
) => {
  playerPosition.y -= 2;

  const nextPosition = playerPosition.clone().add(vectorMove);

  const a = vectorMove.x > 0 ? 1 : -1;
  const b = vectorMove.y > 0 ? 1 : -1;
  const c = vectorMove.z > 0 ? 1 : -1;

  const roundedNextPosition = new Vector3();
  const roundedCurrentPosition = new Vector3();

  const nextPositionXFloor = Math.floor(nextPosition.x);
  const nextPositionYFloor = Math.floor(nextPosition.y);
  const nextPositionZFloor = Math.floor(nextPosition.z);

  const currentPositionXFloor = Math.floor(playerPosition.x);
  const currentPositionYFloor = Math.floor(playerPosition.y);
  const currentPositionZFloor = Math.floor(playerPosition.z);

  roundedNextPosition.x =
    nextPositionXFloor % 2 == 0 ? nextPositionXFloor : nextPositionXFloor + a;
  roundedNextPosition.y =
    nextPositionYFloor % 2 == 0 ? nextPositionYFloor : nextPositionYFloor + b;
  roundedNextPosition.z =
    nextPositionZFloor % 2 == 0 ? nextPositionZFloor : nextPositionZFloor + c;

  roundedCurrentPosition.x =
    currentPositionXFloor % 2 == 0
      ? currentPositionXFloor
      : currentPositionXFloor - 1;
  roundedCurrentPosition.y =
    currentPositionYFloor % 2 == 0
      ? currentPositionYFloor
      : currentPositionYFloor - 1;
  roundedCurrentPosition.z =
    currentPositionZFloor % 2 == 0
      ? currentPositionZFloor
      : currentPositionZFloor - 1;

  // const nextObjectX = scene.getObjectByName(
  //   nameFromCoordinate(
  //     Math.abs(roundedNextPosition.x),
  //     roundedCurrentPosition.y,
  //     roundedCurrentPosition.z
  //   )
  // );

  console.log(roundedCurrentPosition)

  const calculatedMoveVector = new Vector3();

  return calculatedMoveVector;
};

export default calculateNextMovement;

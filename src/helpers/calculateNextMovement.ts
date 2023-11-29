import { Scene, Vector3 } from "three";
import nameFromCoordinate from "./nameFromCoordinate";

const calculateNextMovement = (
  vectorMove: Vector3,
  playerPosition: Vector3,
  scene: Scene
) => {
  //   console.log("🚀 ~ file: calculateNextMovement.ts:9 ~ playerPosition:", playerPosition)
  playerPosition.y -= 2

  const nextPosition = playerPosition.add(vectorMove);

  const roundedNextPosition = new Vector3();
  const roundedCurrentPosition = new Vector3();

  const nextPositionXFloor = Math.floor(nextPosition.x);
  const nextPositionYFloor = Math.floor(nextPosition.y);
  const nextPositionZFloor = Math.floor(nextPosition.z);

  const currentPositionXFloor = Math.floor(playerPosition.x);
  const currentPositionYFloor = Math.floor(playerPosition.y);
  const currentPositionZFloor = Math.floor(playerPosition.z);

  roundedNextPosition.x =
    nextPositionXFloor % 2 == 0 ? nextPositionXFloor : nextPositionXFloor - 1;
  roundedNextPosition.y =
    nextPositionYFloor % 2 == 0 ? nextPositionYFloor : nextPositionYFloor - 1;
  roundedNextPosition.z =
    nextPositionZFloor % 2 == 0 ? nextPositionZFloor : nextPositionZFloor - 1;

  roundedCurrentPosition.x =
    currentPositionXFloor % 2 == 0
      ? currentPositionXFloor
      : currentPositionXFloor + 1;
  roundedCurrentPosition.y =
    currentPositionYFloor % 2 == 0
      ? currentPositionYFloor
      : currentPositionYFloor + 1;
  roundedCurrentPosition.z =
    currentPositionZFloor % 2 == 0
      ? currentPositionZFloor
      : currentPositionZFloor + 1;

  const nextObjectX = scene.getObjectByName(
    nameFromCoordinate(
      roundedNextPosition.x,
      roundedCurrentPosition.y,
      roundedCurrentPosition.z
    )
  );

  const nextObjectY = scene.getObjectByName(
    nameFromCoordinate(
      roundedCurrentPosition.x,
      roundedNextPosition.y,
      roundedCurrentPosition.z
    )
  );

  const nextObjectZ = scene.getObjectByName(
    nameFromCoordinate(
      roundedCurrentPosition.x,
      roundedCurrentPosition.y,
      roundedNextPosition.z
    )
  );

  const calculatedMoveVector = new Vector3();

  calculatedMoveVector.x = nextObjectX ? 0 : vectorMove.x;
  calculatedMoveVector.y = nextObjectY ? 0 : vectorMove.y;
  calculatedMoveVector.z = nextObjectZ ? 0 : vectorMove.z;

  return calculatedMoveVector;
};

export default calculateNextMovement;

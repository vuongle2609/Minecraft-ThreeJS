import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import nameFromCoordinate from "@/helpers/nameFromCoordinate";
import { Vector3 } from "three";

export default class Physics extends BaseEntity {
  constructor(props: BasePropsType) {
    super(props);

    this.initialize();
  }

  initialize() {}

  calculateCorrectMovement(vectorMove: Vector3, playerPosition: Vector3) {
    playerPosition.y -= 2;

    const nextPosition = playerPosition.clone().add(vectorMove);

    const roundedNextPosition = new Vector3();
    const roundedCurrentPosition = new Vector3();

    const nextPositionXFloor = 2 * Math.round(nextPosition.x / 2);
    const nextPositionYFloor = 2 * Math.round(nextPosition.y / 2);
    const nextPositionZFloor = 2 * Math.round(nextPosition.z / 2);

    const currentPositionXFloor = 2 * Math.round(playerPosition.x / 2);
    const currentPositionYFloor = 2 * Math.round(playerPosition.y / 2);
    const currentPositionZFloor = 2 * Math.round(playerPosition.z / 2);

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

    const nextObjectX = this.scene?.getObjectByName(
      nameFromCoordinate(
        roundedNextPosition.x,
        roundedCurrentPosition.y,
        roundedCurrentPosition.z
      )
    );

    const nextObjectY = this.scene?.getObjectByName(
      nameFromCoordinate(
        roundedCurrentPosition.x,
        roundedNextPosition.y,
        roundedCurrentPosition.z
      )
    );

    const nextObjectZ = this.scene?.getObjectByName(
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
  }
}

import BaseEntity, { BasePropsType } from "../../game/classes/baseEntity";
import {
  CHARACTER_LENGTH_CEIL,
  CHARACTER_MIDDLE_LENGTH,
  CHARACTER_RADIUS,
} from "../../constants/player";
import nameFromCoordinate from "../../game/helpers/nameFromCoordinate";
import { Vector3 } from "three";

export default class Physics {
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

  roundedPosition1(position: Vector3) {
    const positionXFloor = 2 * Math.round((position.x - CHARACTER_RADIUS) / 2);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor = 2 * Math.round((position.z - CHARACTER_RADIUS) / 2);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  roundedPosition2(position: Vector3) {
    const positionXFloor = 2 * Math.round((position.x + CHARACTER_RADIUS) / 2);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor = 2 * Math.round((position.z - CHARACTER_RADIUS) / 2);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  roundedPosition3(position: Vector3) {
    const positionXFloor = 2 * Math.round((position.x - CHARACTER_RADIUS) / 2);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor = 2 * Math.round((position.z + CHARACTER_RADIUS) / 2);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  calculateCorrectMovement(
    vectorMove: Vector3,
    playerPosition: Vector3,
    blocksMapping: Record<string, string>
  ) {
    playerPosition.y -= 2;

    const nextPosition = playerPosition.clone().add(vectorMove);

    const roundedNextPosition = this.roundedPosition(nextPosition);
    const roundedNextPosition1 = this.roundedPosition1(nextPosition);
    const roundedNextPosition2 = this.roundedPosition2(nextPosition);
    const roundedNextPosition3 = this.roundedPosition3(nextPosition);

    const roundedCurrentPosition = this.roundedPosition(playerPosition);
    const roundedCurrentPosition1 = this.roundedPosition1(playerPosition);
    const roundedCurrentPosition2 = this.roundedPosition2(playerPosition);
    const roundedCurrentPosition3 = this.roundedPosition3(playerPosition);

    const nextObjectX =
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition.x,
          roundedCurrentPosition.y,
          roundedCurrentPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition.x,
          roundedCurrentPosition.y + CHARACTER_MIDDLE_LENGTH,
          roundedCurrentPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition1.x,
          roundedCurrentPosition1.y,
          roundedCurrentPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_MIDDLE_LENGTH,
          roundedCurrentPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition2.x,
          roundedCurrentPosition2.y,
          roundedCurrentPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_MIDDLE_LENGTH,
          roundedCurrentPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition3.x,
          roundedCurrentPosition3.y,
          roundedCurrentPosition3.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_MIDDLE_LENGTH,
          roundedCurrentPosition3.z
        )
      ];

    const nextObjectY =
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedNextPosition.y,
          roundedCurrentPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedNextPosition1.y,
          roundedCurrentPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedNextPosition2.y,
          roundedCurrentPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedNextPosition3.y,
          roundedCurrentPosition3.z
        )
      ];

    const nextObjectYTop =
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedNextPosition.y + CHARACTER_LENGTH_CEIL,
          roundedCurrentPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedNextPosition1.y + CHARACTER_LENGTH_CEIL,
          roundedCurrentPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedNextPosition2.y + CHARACTER_LENGTH_CEIL,
          roundedCurrentPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedNextPosition3.y + CHARACTER_LENGTH_CEIL,
          roundedCurrentPosition3.z
        )
      ];

    const nextObjectZ =
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedCurrentPosition.y,
          roundedNextPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedCurrentPosition.y + CHARACTER_MIDDLE_LENGTH,
          roundedNextPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedCurrentPosition1.y,
          roundedNextPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_MIDDLE_LENGTH,
          roundedNextPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedCurrentPosition2.y,
          roundedNextPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_MIDDLE_LENGTH,
          roundedNextPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedCurrentPosition3.y,
          roundedNextPosition3.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_MIDDLE_LENGTH,
          roundedNextPosition3.z
        )
      ];

    const calculatedMoveVector = new Vector3();

    calculatedMoveVector.x = nextObjectX ? 0 : vectorMove.x;
    calculatedMoveVector.y = nextObjectYTop || nextObjectY ? 0 : vectorMove.y;
    calculatedMoveVector.z = nextObjectZ ? 0 : vectorMove.z;

    return { calculatedMoveVector, collideObject: nextObjectY };
  }
}

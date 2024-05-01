import { Vector3 } from "three";
import {
  CHARACTER_LENGTH,
  CHARACTER_LENGTH_ROUND,
  CHARACTER_WIDTH,
} from "../../constants/player";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";

export default class Physics2 {
  constructor() {}

  roundedPosition(position: Vector3) {
    const positionXFloor = 2 * Math.round((position.x + CHARACTER_WIDTH) / 2);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor = 2 * Math.round((position.z + CHARACTER_WIDTH) / 2);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  roundedPosition1(position: Vector3) {
    const positionXFloor = 2 * Math.round((position.x - CHARACTER_WIDTH) / 2);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor = 2 * Math.round((position.z - CHARACTER_WIDTH) / 2);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  roundedPosition2(position: Vector3) {
    const positionXFloor = 2 * Math.round((position.x + CHARACTER_WIDTH) / 2);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor = 2 * Math.round((position.z - CHARACTER_WIDTH) / 2);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  roundedPosition3(position: Vector3) {
    const positionXFloor = 2 * Math.round((position.x - CHARACTER_WIDTH) / 2);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor = 2 * Math.round((position.z + CHARACTER_WIDTH) / 2);

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
    blocksMapping: Record<string, string | 0>,
    onGround: boolean
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
          roundedNextPosition1.x,
          roundedCurrentPosition1.y,
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
          roundedNextPosition3.x,
          roundedCurrentPosition3.y,
          roundedCurrentPosition3.z
        )
      ];

    const nextObjectXTop =
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition.x,
          roundedCurrentPosition.y + CHARACTER_LENGTH_ROUND / 2,
          roundedCurrentPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_LENGTH_ROUND / 2,
          roundedCurrentPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_LENGTH_ROUND / 2,
          roundedCurrentPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_LENGTH_ROUND / 2,
          roundedCurrentPosition3.z
        )
      ];

    const nextObjectXTop2 =
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition.x,
          roundedCurrentPosition.y + CHARACTER_LENGTH_ROUND,
          roundedCurrentPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_LENGTH_ROUND,
          roundedCurrentPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_LENGTH_ROUND,
          roundedCurrentPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedNextPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_LENGTH_ROUND,
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
          roundedNextPosition.y,
          roundedCurrentPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedNextPosition.y,
          roundedCurrentPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedNextPosition.y,
          roundedCurrentPosition3.z
        )
      ];

    const nextObjectYTop =
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition.x,
          Math.round(nextPosition.y + CHARACTER_LENGTH),
          roundedCurrentPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          Math.round(nextPosition.y + CHARACTER_LENGTH),
          roundedCurrentPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          Math.round(nextPosition.y + CHARACTER_LENGTH),
          roundedCurrentPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          Math.round(nextPosition.y + CHARACTER_LENGTH),
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
          roundedCurrentPosition1.x,
          roundedCurrentPosition1.y,
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
          roundedCurrentPosition3.x,
          roundedCurrentPosition3.y,
          roundedNextPosition3.z
        )
      ];

    const nextObjectZTop =
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedCurrentPosition.y + CHARACTER_LENGTH_ROUND / 2,
          roundedNextPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_LENGTH_ROUND / 2,
          roundedNextPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_LENGTH_ROUND / 2,
          roundedNextPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_LENGTH_ROUND / 2,
          roundedNextPosition3.z
        )
      ];

    const nextObjectZTop2 =
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedCurrentPosition.y + CHARACTER_LENGTH_ROUND,
          roundedNextPosition.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_LENGTH_ROUND,
          roundedNextPosition1.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_LENGTH_ROUND,
          roundedNextPosition2.z
        )
      ] ||
      blocksMapping[
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_LENGTH_ROUND,
          roundedNextPosition3.z
        )
      ];

    const calculatedMoveVector = new Vector3();

    calculatedMoveVector.x = nextObjectX || nextObjectXTop ? 0 : vectorMove.x;
    calculatedMoveVector.y = nextObjectY || nextObjectYTop ? 0 : vectorMove.y;
    calculatedMoveVector.z = nextObjectZ || nextObjectZTop ? 0 : vectorMove.z;

    return {
      calculatedMoveVector,
      collideObject: nextObjectY,
      touchTop: nextObjectYTop,
    };
  }
}

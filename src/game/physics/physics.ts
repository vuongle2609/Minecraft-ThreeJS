import { Vector3 } from "three";

import { BLOCK_WIDTH } from "@/constants";
import { CHARACTER_LENGTH, CHARACTER_WIDTH } from "@/constants/player";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { BlockKeys } from "@/type";

const halfCharacterWidth = CHARACTER_WIDTH / 2;

export default class Physics {
  constructor() {}

  roundedPosition(position: Vector3) {
    const positionXFloor =
      2 * Math.round((position.x + halfCharacterWidth) / BLOCK_WIDTH);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor =
      2 * Math.round((position.z + halfCharacterWidth) / BLOCK_WIDTH);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  roundedPosition1(position: Vector3) {
    const positionXFloor =
      2 * Math.round((position.x - halfCharacterWidth) / BLOCK_WIDTH);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor =
      2 * Math.round((position.z - halfCharacterWidth) / BLOCK_WIDTH);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  roundedPosition2(position: Vector3) {
    const positionXFloor =
      2 * Math.round((position.x + halfCharacterWidth) / BLOCK_WIDTH);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor =
      2 * Math.round((position.z - halfCharacterWidth) / BLOCK_WIDTH);

    const roundedPosition = new Vector3(
      positionXFloor,
      positionYFloor,
      positionZFloor
    );

    return roundedPosition;
  }

  roundedPosition3(position: Vector3) {
    const positionXFloor =
      2 * Math.round((position.x - halfCharacterWidth) / BLOCK_WIDTH);
    const positionYFloor = 2 * Math.round(position.y / 2);
    const positionZFloor =
      2 * Math.round((position.z + halfCharacterWidth) / BLOCK_WIDTH);

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
    blocksMapping: Map<string, BlockKeys | 0>
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
      blocksMapping.get(
        nameFromCoordinate(
          roundedNextPosition.x,
          roundedCurrentPosition.y,
          roundedCurrentPosition.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedNextPosition1.x,
          roundedCurrentPosition1.y,
          roundedCurrentPosition1.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedNextPosition2.x,
          roundedCurrentPosition2.y,
          roundedCurrentPosition2.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedNextPosition3.x,
          roundedCurrentPosition3.y,
          roundedCurrentPosition3.z
        )
      );

    const nextObjectXTop =
      blocksMapping.get(
        nameFromCoordinate(
          roundedNextPosition.x,
          roundedCurrentPosition.y + CHARACTER_LENGTH,
          roundedCurrentPosition.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedNextPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_LENGTH,
          roundedCurrentPosition1.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedNextPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_LENGTH,
          roundedCurrentPosition2.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedNextPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_LENGTH,
          roundedCurrentPosition3.z
        )
      );

    const nextObjectY =
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedNextPosition.y,
          roundedCurrentPosition.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedNextPosition1.y,
          roundedCurrentPosition1.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedNextPosition2.y,
          roundedCurrentPosition2.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedNextPosition3.y,
          roundedCurrentPosition3.z
        )
      );

    const nextObjectYTop =
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedNextPosition.y + CHARACTER_LENGTH,
          roundedCurrentPosition.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedNextPosition1.y + CHARACTER_LENGTH,
          roundedCurrentPosition1.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedNextPosition2.y + CHARACTER_LENGTH,
          roundedCurrentPosition2.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedNextPosition3.y + CHARACTER_LENGTH,
          roundedCurrentPosition3.z
        )
      );

    const nextObjectZ =
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedCurrentPosition.y,
          roundedNextPosition.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedCurrentPosition1.y,
          roundedNextPosition1.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedCurrentPosition2.y,
          roundedNextPosition2.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedCurrentPosition3.y,
          roundedNextPosition3.z
        )
      );

    const nextObjectZTop =
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedCurrentPosition.y + CHARACTER_LENGTH,
          roundedNextPosition.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_LENGTH,
          roundedNextPosition1.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_LENGTH,
          roundedNextPosition2.z
        )
      ) ||
      blocksMapping.get(
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_LENGTH,
          roundedNextPosition3.z
        )
      );

    const calculatedMoveVector = new Vector3();

    calculatedMoveVector.x =
      (nextObjectX && nextObjectX !== BlockKeys.water) ||
      (nextObjectXTop && nextObjectXTop !== BlockKeys.water)
        ? 0
        : vectorMove.x;
    calculatedMoveVector.y =
      (nextObjectY && nextObjectY !== BlockKeys.water) ||
      (nextObjectYTop && nextObjectYTop !== BlockKeys.water)
        ? 0
        : vectorMove.y;
    calculatedMoveVector.z =
      (nextObjectZ && nextObjectZ !== BlockKeys.water) ||
      (nextObjectZTop && nextObjectZTop !== BlockKeys.water)
        ? 0
        : vectorMove.z;

    return { calculatedMoveVector, collideObject: nextObjectY };
  }
}

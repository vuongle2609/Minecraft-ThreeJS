import { Vector3 } from "three";

import { BLOCK_WIDTH } from "@/constants";
import { CHARACTER_LENGTH, CHARACTER_WIDTH } from "@/constants/player";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { BlockKeys } from "@/type";

const halfCharacterWidth = CHARACTER_WIDTH / 2;

export default class Physics {
  blocksMapping: Map<string, 0 | BlockKeys>;

  constructor(blocksMapping: Map<string, 0 | BlockKeys>) {
    this.blocksMapping = blocksMapping;
  }

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

  doBoundingBoxesCollide(
    box1Min: Vector3,
    box1Max: Vector3,
    box2Min: Vector3,
    box2Max: Vector3
  ) {
    return (
      box1Max.x >= box2Min.x &&
      box1Min.x <= box2Max.x &&
      box1Max.y >= box2Min.y &&
      box1Min.y <= box2Max.y &&
      box1Max.z >= box2Min.z &&
      box1Min.z <= box2Max.z
    );
  }

  getBlocksCandidate(pos: Vector3) {
    pos.y -= CHARACTER_LENGTH / 2;

    const xFloor = Math.floor(pos.x);
    const yFloor = Math.floor(pos.y);
    const zFloor = Math.floor(pos.z);

    const roundedX = xFloor % 2 ? xFloor + 1 : xFloor;
    const roundedY = yFloor % 2 ? yFloor - 1 : yFloor;
    const roundedZ = zFloor % 2 ? zFloor + 1 : zFloor;

    return;
  }

  calculateCorrectMovement1(vectorMove: Vector3, playerPosition: Vector3) {
    const nextPosition = playerPosition.add(vectorMove);

    // const { x, y, z } = nextPosition;

    // const playerBoundingBox = {
    //   max: new Vector3(
    //     x + CHARACTER_WIDTH / 2,
    //     y + CHARACTER_LENGTH / 2,
    //     z + CHARACTER_WIDTH / 2
    //   ),
    //   min: new Vector3(
    //     x - CHARACTER_WIDTH / 2,
    //     y - CHARACTER_LENGTH / 2,
    //     z - CHARACTER_WIDTH / 2
    //   ),
    // };

    // this.getBlocksCandidate(nextPosition);

    // playerPosition.y -= CHARACTER_LENGTH / 2;

    // console.log(playerPosition);
    // playerPosition.y -= 2;

    nextPosition.y -= CHARACTER_LENGTH / 2;

    const xFloor = Math.floor(nextPosition.x);
    const yFloor = Math.floor(nextPosition.y);
    const zFloor = Math.floor(nextPosition.z);

    const roundedX = xFloor % 2 ? xFloor + 1 : xFloor;
    const roundedY = yFloor % 2 ? yFloor + 1 : yFloor;
    const roundedZ = zFloor % 2 ? zFloor + 1 : zFloor;

    const roundedNextPosition = new Vector3(roundedX, roundedY, roundedZ);

    const bellowObjectY = this.blocksMapping.get(
      nameFromCoordinate(roundedX, roundedY, roundedZ)
    );

    const calculatedMoveVector = new Vector3();

    calculatedMoveVector.x = false ? 0 : vectorMove.x;
    calculatedMoveVector.y = bellowObjectY ? 0 : vectorMove.y;
    calculatedMoveVector.z = false ? 0 : vectorMove.z;

    return { calculatedMoveVector, collideObject: bellowObjectY };
  }
}

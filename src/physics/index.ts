import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import {
  CHARACTER_LENGTH_CEIL,
  CHARACTER_MIDDLE_LENGTH,
  CHARACTER_RADIUS,
} from "@/constants/player";
import nameFromCoordinate from "@/helpers/nameFromCoordinate";
import { Vector3 } from "three";

export default class Physics extends BaseEntity {
  constructor(props: BasePropsType) {
    super(props);
  }

  // getBlockCandicate(entityPosition: Vector3, moveVector: Vector3) {
  //   const newEntityPosition = entityPosition.add(moveVector);
  //   const playerRoundedPosition = new Vector3();

  //   // -1,2.34,5 => 0,2,4
  //   // -1.213,3.4,5 => -2,4,4
  //   // -3.423,5,-3 => -4,4,-2
  //   const entityFloorX = 2 * Math.round(newEntityPosition.x / 2);
  //   const entityFloorY = Math.floor(newEntityPosition.y);
  //   const entityFloorZ = 2 * Math.round(newEntityPosition.z / 2);

  //   // remove calculate part
  //   playerRoundedPosition.x =
  //     entityFloorX % 2 == 0 ? entityFloorX : entityFloorX - 1;
  //   playerRoundedPosition.y =
  //     entityFloorY % 2 == 0 ? entityFloorY : entityFloorY - 1;
  //   playerRoundedPosition.z =
  //     entityFloorZ % 2 == 0 ? entityFloorZ : entityFloorZ - 1;

  //   const objectsAround: (null | number[])[][][] = [
  //     [
  //       [null, null, null],
  //       [null, null, null],
  //       [null, null, null],
  //     ],
  //     [
  //       [null, null, null],
  //       [null, null, null],
  //       [null, null, null],
  //     ],
  //   ];

  //   for (let y = 0; y <= 1; y++) {
  //     for (let x = -1; x <= 1; x++) {
  //       for (let z = -1; z <= 1; z++) {
  //         const coordinate = [
  //           playerRoundedPosition.x + x * 2,
  //           playerRoundedPosition.y + y * 2,
  //           playerRoundedPosition.z + z * 2,
  //         ];

  //         const name = nameFromCoordinate(
  //           coordinate[0],
  //           coordinate[1],
  //           coordinate[2]
  //         );

  //         const object = this.scene?.getObjectByName(name);

  //         if (object) objectsAround[y][x + 1][z + 1] = coordinate;
  //       }
  //     }
  //   }

  //   const objectsHorizonal: (null | number[])[] = [null, null];

  //   for (let y = 0; y <= 1; y++) {
  //     const coordinate = [
  //       playerRoundedPosition.x,
  //       playerRoundedPosition.y + (y == 0 ? 4 : -2),
  //       playerRoundedPosition.z,
  //     ];

  //     const name = nameFromCoordinate(
  //       coordinate[0],
  //       coordinate[1],
  //       coordinate[2]
  //     );

  //     const object = this.scene?.getObjectByName(name);

  //     if (object) objectsHorizonal[y] = coordinate;
  //   }

  //   const correctMovementVector = moveVector.clone();

  //   return {
  //     objectsAround,
  //     objectsHorizonal,
  //   };
  // }

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

  calculateCorrectMovement(vectorMove: Vector3, playerPosition: Vector3) {
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
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedNextPosition.x,
          roundedCurrentPosition.y,
          roundedCurrentPosition.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedNextPosition.x,
          roundedCurrentPosition.y + CHARACTER_MIDDLE_LENGTH,
          roundedCurrentPosition.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedNextPosition1.x,
          roundedCurrentPosition1.y,
          roundedCurrentPosition1.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedNextPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_MIDDLE_LENGTH,
          roundedCurrentPosition1.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedNextPosition2.x,
          roundedCurrentPosition2.y,
          roundedCurrentPosition2.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedNextPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_MIDDLE_LENGTH,
          roundedCurrentPosition2.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedNextPosition3.x,
          roundedCurrentPosition3.y,
          roundedCurrentPosition3.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedNextPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_MIDDLE_LENGTH,
          roundedCurrentPosition3.z
        )
      );

    const nextObjectY =
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedNextPosition.y,
          roundedCurrentPosition.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedNextPosition.y + CHARACTER_LENGTH_CEIL,
          roundedCurrentPosition.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedNextPosition1.y,
          roundedCurrentPosition1.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedNextPosition1.y + CHARACTER_LENGTH_CEIL,
          roundedCurrentPosition1.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedNextPosition2.y,
          roundedCurrentPosition2.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedNextPosition2.y + CHARACTER_LENGTH_CEIL,
          roundedCurrentPosition2.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedNextPosition3.y,
          roundedCurrentPosition3.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedNextPosition3.y + CHARACTER_LENGTH_CEIL,
          roundedCurrentPosition3.z
        )
      );

    const nextObjectZ =
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedCurrentPosition.y,
          roundedNextPosition.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition.x,
          roundedCurrentPosition.y + CHARACTER_MIDDLE_LENGTH,
          roundedNextPosition.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedCurrentPosition1.y,
          roundedNextPosition1.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition1.x,
          roundedCurrentPosition1.y + CHARACTER_MIDDLE_LENGTH,
          roundedNextPosition1.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedCurrentPosition2.y,
          roundedNextPosition2.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition2.x,
          roundedCurrentPosition2.y + CHARACTER_MIDDLE_LENGTH,
          roundedNextPosition2.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedCurrentPosition3.y,
          roundedNextPosition3.z
        )
      ) ||
      this.scene?.getObjectByName(
        nameFromCoordinate(
          roundedCurrentPosition3.x,
          roundedCurrentPosition3.y + CHARACTER_MIDDLE_LENGTH,
          roundedNextPosition3.z
        )
      );

    const calculatedMoveVector = new Vector3();

    calculatedMoveVector.x = nextObjectX ? 0 : vectorMove.x;
    calculatedMoveVector.y = nextObjectY ? 0 : vectorMove.y;
    calculatedMoveVector.z = nextObjectZ ? 0 : vectorMove.z;

    return calculatedMoveVector;
  }
}

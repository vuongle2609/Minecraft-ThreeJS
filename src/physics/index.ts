import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import nameFromCoordinate from "@/helpers/nameFromCoordinate";
import { Vector3 } from "three";

export default class Physics extends BaseEntity {
  constructor(props: BasePropsType) {
    super(props);

    this.initialize();
  }

  initialize() {}

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

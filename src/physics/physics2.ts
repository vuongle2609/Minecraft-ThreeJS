import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import nameFromCoordinate from "@/helpers/nameFromCoordinate";
import { Vector3 } from "three";

export default class Physics extends BaseEntity {
  constructor(props: BasePropsType) {
    super(props);

    this.initialize();
  }

  initialize() {}

  getBlockCandicate(entityPosition: Vector3) {
    const playerRoundedPosition = new Vector3();

    const entityFloorX = Math.floor(entityPosition.x);
    const entityFloorY = Math.floor(entityPosition.y);
    const entityFloorZ = Math.floor(entityPosition.z);

    // -1.23123123213 => 0 | 0.324234324 -> 0 | 2.213123 -> 2
    playerRoundedPosition.x =
      entityFloorX % 2 == 0 ? entityFloorX : entityFloorX - 1;
    playerRoundedPosition.y =
      entityFloorY % 2 == 0 ? entityFloorY : entityFloorY - 1;
    playerRoundedPosition.z =
      entityFloorZ % 2 == 0 ? entityFloorZ : entityFloorZ - 1;

    const objectsAround: (null | number)[][][] = [
      [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
    ];

    for (let y = 0; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          const name = nameFromCoordinate(
            playerRoundedPosition.x + x * 2,
            playerRoundedPosition.y + y * 2,
            playerRoundedPosition.z + z * 2
          );

          const object = this.scene?.getObjectByName(name);

          if (object) objectsAround[y][x + 1][z + 1] = 1;
        }
      }
    }

    const objectsHorizonal: (null | number)[] = [null, null];

    for (let y = 0; y <= 1; y++) {
      const name = nameFromCoordinate(
        playerRoundedPosition.x,
        playerRoundedPosition.y + (y == 0 ? 4 : -2),
        playerRoundedPosition.z
      );

      const object = this.scene?.getObjectByName(name);

      if (object) objectsHorizonal[y] = 1;
    }

    console.log(playerRoundedPosition);

    return {
      objectsAround,
      objectsHorizonal,
    };
  }

  calculateCorrectMovement(
    dt: number,
    entityPosition: Vector3,
    moveVector: Vector3
  ) {
    this.getBlockCandicate(entityPosition);
  }
}

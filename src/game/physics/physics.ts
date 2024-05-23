import { Face } from "./../../constants/block";
import { Vector3 } from "three";

import { BLOCK_WIDTH } from "@/constants";
import { CHARACTER_LENGTH, CHARACTER_WIDTH } from "@/constants/player";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { BlockKeys } from "@/type";
import { calNeighborsOffset } from "../helpers/calNeighborsOffset";

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

  getBlockDirection(
    x: number,
    y: number,
    z: number,
    xC: number,
    yC: number,
    zC: number
  ) {
    if (y < yC) {
      return Face.bottom;
    } else if (y > yC) {
      return Face.top;
    } else if (x < xC) {
      return Face.rightX;
    } else if (x > xC) {
      return Face.leftX;
    } else if (z < zC) {
      return Face.rightZ;
    } else if (z > zC) {
      return Face.leftZ;
    }
    return Face.leftZ;
  }

  getBlocksCandidate(pos: Vector3, playerPos: Vector3) {
    const { x, y, z } = playerPos;

    const playerBoundingBox = this.getBoundingBox(
      x,
      y,
      z,
      CHARACTER_WIDTH,
      CHARACTER_LENGTH
    );

    pos.y -= CHARACTER_LENGTH / 2;

    const xFloor = Math.floor(pos.x);
    const yFloor = Math.floor(pos.y);
    const zFloor = Math.floor(pos.z);

    const roundedX = xFloor % 2 ? xFloor + 1 : xFloor;
    const roundedY = yFloor % 2 ? yFloor - 1 : yFloor;
    const roundedZ = zFloor % 2 ? zFloor + 1 : zFloor;

    const facesCollide: Record<string, BlockKeys | 0 | boolean> = {
      [Face.rightZ]: false,
      [Face.leftZ]: false,
      [Face.rightX]: false,
      [Face.leftX]: false,
      [Face.top]: false,
      [Face.bottom]: false,
    };

    const a = [];

    for (let i = 0; i < 4; i++) {
      const neighborsOffset = calNeighborsOffset(1, 2);
      neighborsOffset.forEach(({ x, z }) => {
        if ((i === 1 || i === 2) && x === 0 && z === 0) {
          return;
        }

        const pos = [roundedX + x, roundedY + i * 2, roundedZ + z];

        const block = this.blocksMapping.get(
          nameFromCoordinate(pos[0], pos[1], pos[2])
        );

        if (block) {
          a.push(block);
          const blockBoundingBox = this.getBoundingBox(
            pos[0],
            pos[1],
            pos[2],
            BLOCK_WIDTH,
            BLOCK_WIDTH
          );

          const isCollides = this.doBoundingBoxesCollide(
            blockBoundingBox.min,
            blockBoundingBox.max,
            playerBoundingBox.min,
            playerBoundingBox.max
          );

          if (isCollides) {
            const direction = this.getBlockDirection(
              pos[0],
              pos[1],
              pos[2],
              playerPos.x,
              playerPos.y,
              playerPos.z
            );

            facesCollide[direction] = block;
          }
        }
      });
    }

    console.log(a); 

    return facesCollide;
  }

  getBoundingBox(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number
  ) {
    return {
      max: new Vector3(x + width / 2, y + height / 2, z + width / 2),
      min: new Vector3(x - width / 2, y - height / 2, z - width / 2),
    };
  }

  calculateCorrectMovement1(vectorMove: Vector3, playerPosition: Vector3) {
    const nextPosition = playerPosition.add(vectorMove);

    const collisionFaces = this.getBlocksCandidate(
      nextPosition.clone(),
      nextPosition.clone()
    );

    const calculatedMoveVector = new Vector3();

    calculatedMoveVector.x = false ? 0 : vectorMove.x;
    calculatedMoveVector.y = collisionFaces[Face.bottom] ? 0 : vectorMove.y;
    calculatedMoveVector.z = false ? 0 : vectorMove.z;

    return { calculatedMoveVector, collideObject: collisionFaces[Face.bottom] };
  }
}

import { Face } from "@/constants/block";
import { Vector3 } from "three";

import { BLOCK_WIDTH } from "@/constants";
import { CHARACTER_LENGTH, CHARACTER_WIDTH } from "@/constants/player";
import { calNeighborsOffset } from "@/game/helpers/calNeighborsOffset";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { BlockKeys } from "@/type";

export default class Physics {
  blocksMapping: Map<string, 0 | BlockKeys>;

  constructor(blocksMapping: Map<string, 0 | BlockKeys>) {
    this.blocksMapping = blocksMapping;
  }

  isBoundingBoxCollide(
    box1Min: Vector3,
    box1Max: Vector3,
    box2Min: Vector3,
    box2Max: Vector3
  ) {
    return !(
      box1Max.x < box2Min.x ||
      box1Min.x > box2Max.x ||
      box1Max.y < box2Min.y ||
      box1Min.y > box2Max.y ||
      box1Max.z < box2Min.z ||
      box1Min.z > box2Max.z
    );
  }

  // getBlockDirection(
  //   x: number,
  //   y: number,
  //   z: number,
  //   xC: number,
  //   yC: number,
  //   zC: number
  // ) {
  //   let facesCollide: Record<string, BlockKeys | 0 | boolean> = {
  //     [Face.rightZ]: false,
  //     [Face.leftZ]: false,
  //     [Face.rightX]: false,
  //     [Face.leftX]: false,
  //     [Face.top]: false,
  //     [Face.bottom]: false,
  //   };

  //   const facesCollideTempX: Record<string, BlockKeys | 0 | boolean> = {
  //     [Face.rightX]: false,
  //     [Face.leftX]: false,
  //   };

  //   const facesCollideTempZ: Record<string, BlockKeys | 0 | boolean> = {
  //     [Face.rightZ]: false,
  //     [Face.leftZ]: false,
  //   };

  //   const isTop = y - yC > BLOCK_WIDTH;
  //   const isBot = yC - y === BLOCK_WIDTH;

  //   if (y < yC && isBot) {
  //     facesCollide[Face.bottom] = true;
  //   }

  //   if (y > yC && isTop) {
  //     facesCollide[Face.top] = true;
  //   }

  //   let calX = false;
  //   let calZ = false;

  //   if (x < xC && !isTop && !isBot) {
  //     facesCollideTempX[Face.rightX] = true;
  //     calX = true;
  //   }

  //   if (x > xC && !isTop && !isBot) {
  //     facesCollideTempX[Face.leftX] = true;
  //     calX = true;
  //   }

  //   if (z < zC && !isTop && !isBot) {
  //     facesCollideTempZ[Face.rightZ] = true;
  //     calZ = true;
  //   }

  //   if (z > zC && !isTop && !isBot) {
  //     facesCollideTempZ[Face.leftZ] = true;
  //     calZ = true;
  //   }

  //   // if (calX && calZ) {
  //   //   // facesCollide = {
  //   //   //   ...facesCollide,
  //   //   //   ...facesCollideTempX,
  //   //   // };
  //   // } else {
  //   //   facesCollide = {
  //   //     ...facesCollide,
  //   //     ...facesCollideTempZ,
  //   //     ...facesCollideTempX,
  //   //   };
  //   // }
  //   facesCollide = {
  //     ...facesCollide,
  //     ...facesCollideTempZ,
  //     ...facesCollideTempX,
  //   };
  //   return facesCollide;
  // }

  getRoundedCoordirnate(pos: Vector3) {
    const xFloor = Math.floor(pos.x);
    const yFloor = Math.floor(pos.y);
    const zFloor = Math.floor(pos.z);

    const roundedX = xFloor % 2 ? xFloor + 1 : xFloor;
    const roundedY = yFloor % 2 ? yFloor + 1 : yFloor;
    const roundedZ = zFloor % 2 ? zFloor + 1 : zFloor;

    return [roundedX, roundedY, roundedZ];
  }

  getBlocksCandidateX(vectorMove: Vector3, playerPosition: Vector3) {
    vectorMove.z = 0;
    vectorMove.y = 0;

    const nextPosition = playerPosition.add(vectorMove);

    nextPosition.y -= CHARACTER_LENGTH / 2;

    const playerBoundingBox = this.getBoundingBoxPlayer(
      nextPosition.x,
      nextPosition.y,
      nextPosition.z,
      CHARACTER_WIDTH,
      CHARACTER_LENGTH
    );

    const roundedNextPos = this.getRoundedCoordirnate(nextPosition);

    let facesCollide: Record<string, BlockKeys | 0 | boolean> = {
      [Face.rightX]: false,
      [Face.leftX]: false,
    };

    for (let i = 0; i < 4; i++) {
      const neighborsOffset = calNeighborsOffset(1, 2);
      neighborsOffset.forEach(({ x, z }) => {
        if (!x) {
          return;
        }

        const blockPos = [
          roundedNextPos[0] + x,
          roundedNextPos[1] + i * BLOCK_WIDTH,
          roundedNextPos[2] + z,
        ];

        const block = this.blocksMapping.get(
          nameFromCoordinate(blockPos[0], blockPos[1], blockPos[2])
        );

        if (block && block !== BlockKeys.water) {
          const blockBoundingBox = this.getBoundingBoxBlock(
            blockPos[0],
            blockPos[1],
            blockPos[2],
            BLOCK_WIDTH,
            BLOCK_WIDTH
          );

          const isCollided = this.isBoundingBoxCollide(
            blockBoundingBox.min,
            blockBoundingBox.max,
            playerBoundingBox.min,
            playerBoundingBox.max
          );

          if (isCollided) {
            facesCollide = {
              [Face.rightX]: block,
              [Face.leftX]: block,
            };
          }
        }
      });
    }

    return facesCollide;
  }

  getBlocksCandidateY(vectorMove: Vector3, playerPosition: Vector3) {
    vectorMove.z = 0;
    vectorMove.x = 0;

    const nextPosition = playerPosition.add(vectorMove);

    nextPosition.y -= CHARACTER_LENGTH / 2;

    const playerBoundingBox = this.getBoundingBoxPlayer(
      nextPosition.x,
      nextPosition.y,
      nextPosition.z,
      CHARACTER_WIDTH,
      CHARACTER_LENGTH
    );

    const roundedNextPos = this.getRoundedCoordirnate(nextPosition);

    let facesCollide: Record<string, BlockKeys | 0 | boolean> = {
      [Face.top]: false,
      [Face.bottom]: false,
    };

    for (let i = 0; i < 4; i++) {
      const neighborsOffset = calNeighborsOffset(1, 2);
      neighborsOffset.forEach(({ x, z }) => {
        const blockPos = [
          roundedNextPos[0] + x,
          roundedNextPos[1] + i * BLOCK_WIDTH,
          roundedNextPos[2] + z,
        ];

        const block = this.blocksMapping.get(
          nameFromCoordinate(blockPos[0], blockPos[1], blockPos[2])
        );

        if (block && block !== BlockKeys.water) {
          const blockBoundingBox = this.getBoundingBoxBlock(
            blockPos[0],
            blockPos[1],
            blockPos[2],
            BLOCK_WIDTH,
            BLOCK_WIDTH
          );

          const isCollided = this.isBoundingBoxCollide(
            blockBoundingBox.min,
            blockBoundingBox.max,
            playerBoundingBox.min,
            playerBoundingBox.max
          );

          if (isCollided) {
            facesCollide = {
              [Face.top]: block,
              [Face.bottom]: block,
            };
          }
        }
      });
    }

    return facesCollide;
  }

  getBlocksCandidateZ(vectorMove: Vector3, playerPosition: Vector3) {
    vectorMove.x = 0;
    vectorMove.y = 0;

    const nextPosition = playerPosition.add(vectorMove);

    nextPosition.y -= CHARACTER_LENGTH / 2;

    const playerBoundingBox = this.getBoundingBoxPlayer(
      nextPosition.x,
      nextPosition.y,
      nextPosition.z,
      CHARACTER_WIDTH,
      CHARACTER_LENGTH
    );

    const roundedNextPos = this.getRoundedCoordirnate(nextPosition);

    let facesCollide: Record<string, BlockKeys | 0 | boolean> = {
      [Face.rightZ]: false,
      [Face.leftZ]: false,
    };

    for (let i = 0; i < 4; i++) {
      const neighborsOffset = calNeighborsOffset(1, 2);
      neighborsOffset.forEach(({ x, z }) => {
        if (!z) {
          return;
        }

        const blockPos = [
          roundedNextPos[0] + x,
          roundedNextPos[1] + i * BLOCK_WIDTH,
          roundedNextPos[2] + z,
        ];

        const block = this.blocksMapping.get(
          nameFromCoordinate(blockPos[0], blockPos[1], blockPos[2])
        );

        if (block && block !== BlockKeys.water) {
          const blockBoundingBox = this.getBoundingBoxBlock(
            blockPos[0],
            blockPos[1],
            blockPos[2],
            BLOCK_WIDTH,
            BLOCK_WIDTH
          );

          const isCollided = this.isBoundingBoxCollide(
            blockBoundingBox.min,
            blockBoundingBox.max,
            playerBoundingBox.min,
            playerBoundingBox.max
          );

          if (isCollided) {
            facesCollide = {
              [Face.rightZ]: block,
              [Face.leftZ]: block,
            };
          }
        }
      });
    }

    return facesCollide;
  }

  getBoundingBoxPlayer(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number
  ) {
    return {
      max: new Vector3(x + width / 2, y + height, z + width / 2),
      min: new Vector3(x - width / 2, y, z - width / 2),
    };
  }

  getBoundingBoxBlock(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number
  ) {
    return {
      max: new Vector3(x + width / 2, y + height / 2, z + width / 2),
      min: new Vector3(x - width / 2, y - width / 2, z - width / 2),
    };
  }

  calculateCorrectMovement(vectorMove: Vector3, playerPosition: Vector3) {
    const collisionFacesX = this.getBlocksCandidateX(
      vectorMove.clone(),
      playerPosition.clone()
    );
    const collisionFacesZ = this.getBlocksCandidateZ(
      vectorMove.clone(),
      playerPosition.clone()
    );
    const collisionFacesY = this.getBlocksCandidateY(
      vectorMove.clone(),
      playerPosition.clone()
    );

    const calculatedMoveVector = new Vector3();

    calculatedMoveVector.x =
      collisionFacesX[Face.leftX] || collisionFacesX[Face.rightX]
        ? 0
        : vectorMove.x;

    calculatedMoveVector.y =
      collisionFacesY[Face.bottom] || collisionFacesY[Face.top]
        ? 0
        : vectorMove.y;

    calculatedMoveVector.z =
      collisionFacesZ[Face.leftZ] || collisionFacesZ[Face.rightZ]
        ? 0
        : vectorMove.z;

    return {
      calculatedMoveVector,
      collideObject:
        collisionFacesY[Face.bottom] && Number(collisionFacesY[Face.bottom]),
      collideObjectTop:
        collisionFacesY[Face.top] && Number(collisionFacesY[Face.top]),
    };
  }
}

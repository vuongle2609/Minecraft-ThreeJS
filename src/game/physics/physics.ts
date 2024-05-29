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

  getBlockDirection(
    x: number,
    y: number,
    z: number,
    xC: number,
    yC: number,
    zC: number
  ) {
    const facesCollide: Record<string, BlockKeys | 0 | boolean> = {
      [Face.rightZ]: false,
      [Face.leftZ]: false,
      [Face.rightX]: false,
      [Face.leftX]: false,
      [Face.top]: false,
      [Face.bottom]: false,
    };

    const isTop = y - yC > BLOCK_WIDTH;
    const isBot = yC - y === BLOCK_WIDTH;

    if (y < yC && isBot) {
      facesCollide[Face.bottom] = true;
    }

    if (y > yC && isTop) {
      facesCollide[Face.top] = true;
    }

    if (x < xC && !isTop && !isBot) {
      facesCollide[Face.rightX] = true;
    }

    if (x > xC && !isTop && !isBot) {
      facesCollide[Face.leftX] = true;
    }

    if (z < zC && !isTop && !isBot) {
      facesCollide[Face.rightZ] = true;
    }

    if (z > zC && !isTop && !isBot) {
      facesCollide[Face.leftZ] = true;
    }

    return facesCollide;
  }

  getRoundedCoordirnate(pos: Vector3) {
    const xFloor = Math.floor(pos.x);
    const yFloor = Math.floor(pos.y);
    const zFloor = Math.floor(pos.z);

    const roundedX = xFloor % 2 ? xFloor + 1 : xFloor;
    const roundedY = yFloor % 2 ? yFloor + 1 : yFloor;
    const roundedZ = zFloor % 2 ? zFloor + 1 : zFloor;

    return [roundedX, roundedY, roundedZ];
  }

  getBlocksCandidate(nextPos: Vector3, playerPos: Vector3) {
    nextPos.y -= CHARACTER_LENGTH / 2;
    playerPos.y -= CHARACTER_LENGTH / 2;

    const playerBoundingBox = this.getBoundingBoxPlayer(
      nextPos.x,
      nextPos.y,
      nextPos.z,
      CHARACTER_WIDTH,
      CHARACTER_LENGTH
    );

    const roundedNextPos = this.getRoundedCoordirnate(nextPos);
    const roundedCurrPos = this.getRoundedCoordirnate(playerPos);

    let facesCollide: Record<string, BlockKeys | 0 | boolean> = {
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
        const blockPos = [
          roundedNextPos[0] + x,
          roundedNextPos[1] + i * 2,
          roundedNextPos[2] + z,
        ];

        const block = this.blocksMapping.get(
          nameFromCoordinate(blockPos[0], blockPos[1], blockPos[2])
        );

        if (block) {
          const blockBoundingBox = this.getBoundingBoxBlock(
            blockPos[0],
            blockPos[1],
            blockPos[2],
            BLOCK_WIDTH,
            BLOCK_WIDTH
          );
          a.push(blockBoundingBox);

          const isCollided = this.isBoundingBoxCollide(
            blockBoundingBox.min,
            blockBoundingBox.max,
            playerBoundingBox.min,
            playerBoundingBox.max
          );

          // if (block === 8) {
          //   console.log(
          //     isCollided,
          //     blockBoundingBox.min,
          //     blockBoundingBox.max,
          //     playerBoundingBox.min,
          //     playerBoundingBox.max
          //   );
          // }

          if (isCollided) {
            const newFacesCollide = this.getBlockDirection(
              blockPos[0],
              blockPos[1],
              blockPos[2],
              roundedCurrPos[0],
              roundedCurrPos[1],
              roundedCurrPos[2]
            );

            facesCollide = {
              ...facesCollide,
              [Face.rightZ]:
                newFacesCollide[Face.rightZ] || facesCollide[Face.rightZ],
              [Face.leftZ]:
                newFacesCollide[Face.leftZ] || facesCollide[Face.leftZ],
              [Face.rightX]:
                newFacesCollide[Face.rightX] || facesCollide[Face.rightX],
              [Face.leftX]:
                newFacesCollide[Face.leftX] || facesCollide[Face.leftX],
              [Face.top]: newFacesCollide[Face.top] || facesCollide[Face.top],
              [Face.bottom]:
                newFacesCollide[Face.bottom] || facesCollide[Face.bottom],
            };
          }
        }
      });
    }

    return { facesCollide, a, playerBoundingBox };
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
    const nextPosition = playerPosition.clone().add(vectorMove);

    const {
      facesCollide: collisionFaces,
      a,
      playerBoundingBox,
    } = this.getBlocksCandidate(nextPosition.clone(), playerPosition.clone());

    const calculatedMoveVector = new Vector3();

    calculatedMoveVector.x =
      collisionFaces[Face.leftX] || collisionFaces[Face.rightX]
        ? 0
        : vectorMove.x;

    calculatedMoveVector.y =
      collisionFaces[Face.bottom] || collisionFaces[Face.top]
        ? 0
        : vectorMove.y;

    calculatedMoveVector.z =
      collisionFaces[Face.leftZ] || collisionFaces[Face.rightZ]
        ? 0
        : vectorMove.z;

    return {
      calculatedMoveVector,
      collideObject:
        collisionFaces[Face.bottom] && Number(collisionFaces[Face.bottom]),
      collideObjectTop:
        collisionFaces[Face.top] && Number(collisionFaces[Face.top]),
      a,
      playerBoundingBox,
    };
  }
}

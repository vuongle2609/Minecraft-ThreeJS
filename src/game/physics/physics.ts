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

  getRoundedCoordirnate(pos: Vector3) {
    const xFloor = Math.floor(pos.x);
    const yFloor = Math.floor(pos.y);
    const zFloor = Math.floor(pos.z);

    const roundedX = xFloor % 2 ? xFloor + 1 : xFloor;
    const roundedY = yFloor % 2 ? yFloor + 1 : yFloor;
    const roundedZ = zFloor % 2 ? zFloor + 1 : zFloor;

    return [roundedX, roundedY, roundedZ];
  }

  calCollideFaces(
    vectorMove: Vector3,
    playerPosition: Vector3,
    axis: "x" | "y" | "z"
  ) {
    ["x", "y", "z"].forEach((item) => {
      if (axis !== item) {
        //@ts-ignore
        vectorMove[item] = 0;
      }
    });

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
      [Face.rightZ]: false,
      [Face.leftZ]: false,
      [Face.top]: false,
      [Face.bottom]: false,
    };

    for (let i = 0; i < 4; i++) {
      const neighborsOffset = calNeighborsOffset(1, 2);
      neighborsOffset.forEach(({ x, z }) => {
        if (axis === "z" && !z) return;

        if (axis === "x" && !x) return;

        const blockPos = [
          roundedNextPos[0] + x,
          roundedNextPos[1] + i * BLOCK_WIDTH,
          roundedNextPos[2] + z,
        ];

        const block = this.blocksMapping.get(
          nameFromCoordinate(blockPos[0], blockPos[1], blockPos[2])
        );

        if (!block || block === BlockKeys.water) return;

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

        if (!isCollided) return;

        if (axis === "x") {
          facesCollide = {
            [Face.rightX]: block,
            [Face.leftX]: block,
          };
        } else if (axis === "y") {
          facesCollide = {
            [Face.top]: block,
            [Face.bottom]: block,
          };
        } else if (axis === "z") {
          facesCollide = {
            [Face.rightZ]: block,
            [Face.leftZ]: block,
          };
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
    const collisionFacesX = this.calCollideFaces(
      vectorMove.clone(),
      playerPosition.clone(),
      "x"
    );
    const collisionFacesY = this.calCollideFaces(
      vectorMove.clone(),
      playerPosition.clone(),
      "y"
    );
    const collisionFacesZ = this.calCollideFaces(
      vectorMove.clone(),
      playerPosition.clone(),
      "z"
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
      objectBottom:
        collisionFacesY[Face.bottom] && Number(collisionFacesY[Face.bottom]),
      objectTop: collisionFacesY[Face.top] && Number(collisionFacesY[Face.top]),
    };
  }
}

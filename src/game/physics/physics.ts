import { Face } from "@/constants/block";
import { Vector3 } from "three";

import { BLOCK_WIDTH } from "@/constants";
import { CHARACTER_LENGTH } from "@/constants/player";
import {
  getBoundingBoxBlock,
  getBoundingBoxPlayer,
  isBoundingBoxCollide,
} from "@/game/helpers/bounding";
import { calNeighborsOffset } from "@/game/helpers/calNeighborsOffset";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { BlockKeys } from "@/type";

export default class Physics {
  blocksMapping: Map<string, 0 | BlockKeys>;

  constructor(blocksMapping: Map<string, 0 | BlockKeys>) {
    this.blocksMapping = blocksMapping;
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

    const playerBoundingBox = getBoundingBoxPlayer(
      nextPosition.x,
      nextPosition.y,
      nextPosition.z
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

        const blockBoundingBox = getBoundingBoxBlock(
          blockPos[0],
          blockPos[1],
          blockPos[2]
        );

        const isCollided = isBoundingBoxCollide(
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

  checkWaterInteract(playerPos: Vector3) {
    playerPos.y -= CHARACTER_LENGTH / 2;
    const playerPos2 = playerPos.clone();
    playerPos2.y += 1;

    const roundedCurrentPos = this.getRoundedCoordirnate(playerPos);
    const roundedCurrentPos2 = this.getRoundedCoordirnate(playerPos2);

    const blockBelowPos = [
      roundedCurrentPos[0],
      roundedCurrentPos[1],
      roundedCurrentPos[2],
    ];

    const blockBelowFootPos = [
      roundedCurrentPos2[0],
      roundedCurrentPos2[1] - BLOCK_WIDTH,
      roundedCurrentPos2[2],
    ];

    const blockUpPos = [
      roundedCurrentPos[0],
      roundedCurrentPos[1] + BLOCK_WIDTH,
      roundedCurrentPos[2],
    ];

    const blockBellow = this.blocksMapping.get(
      nameFromCoordinate(blockBelowPos[0], blockBelowPos[1], blockBelowPos[2])
    );

    const blockBellowFoot = this.blocksMapping.get(
      nameFromCoordinate(
        blockBelowFootPos[0],
        blockBelowFootPos[1],
        blockBelowFootPos[2]
      )
    );

    const blockUp = this.blocksMapping.get(
      nameFromCoordinate(blockUpPos[0], blockUpPos[1], blockUpPos[2])
    );

    const isUnderWater =
      blockBellow === BlockKeys.water && blockUp === BlockKeys.water;

    const isOnWater = blockBellow === BlockKeys.water;

    const belowIsWater = blockBellowFoot === BlockKeys.water;

    return {
      isUnderWater,
      isOnWater,
      belowIsWater,
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

    const { isUnderWater, isOnWater, belowIsWater } = this.checkWaterInteract(
      playerPosition.clone()
    );

    return {
      calculatedMoveVector,
      objectBottom:
        collisionFacesY[Face.bottom] && Number(collisionFacesY[Face.bottom]),
      objectTop: collisionFacesY[Face.top] && Number(collisionFacesY[Face.top]),
      isUnderWater,
      isOnWater,
      belowIsWater,
    };
  }
}

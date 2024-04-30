import { Face } from "../../constants/block";
import { CHUNK_SIZE, FLAT_WORLD_HEIGHT } from "../../constants";
import blocks from "../../constants/blocks";
import { detailFromName } from "../helpers/detailFromName";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";
import FastNoiseLite from "fastnoise-lite";

let noise = new FastNoiseLite();
noise.SetFrequency(0.06);
// noise.SetCellularReturnType(FastNoiseLite.CellularReturnType.Distance2Div );
noise.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
noise.SetSeed(2131232);

const { leftZ, rightZ, leftX, rightX } = Face;

type FaceCustom = typeof leftZ | typeof rightZ | typeof leftX | typeof rightX;

export const getBlocksInChunk = (
  x: number,
  z: number,
  chunkBlocksCustom: Record<string, 0 | keyof typeof blocks>,
  sides: FaceCustom[]
) => {
  let blocksInChunk: Record<
    string,
    {
      position: number[];
      type: keyof typeof blocks;
    }
  > = {};

  const boundaries: Record<FaceCustom | string, number> = {
    highestY: 0,
    lowestY: 0,

    [leftZ]: 0,
    [rightZ]: 0,
    [leftX]: 0,
    [rightX]: 0,
  };

  const sideFunc = (side: FaceCustom, pos: number[]) => {
    const calFuncMap: Record<FaceCustom, Function> = {
      [leftZ]: () =>
        boundaries[side]
          ? pos[2] < boundaries[side]
            ? pos[2]
            : boundaries[side]
          : pos[2],
      [rightZ]: () =>
        boundaries[side]
          ? pos[2] > boundaries[side]
            ? pos[2]
            : boundaries[side]
          : pos[2],

      [leftX]: () =>
        boundaries[side]
          ? pos[0] < boundaries[side]
            ? pos[0]
            : boundaries[side]
          : pos[0],
      [rightX]: () =>
        boundaries[side]
          ? pos[0] > boundaries[side]
            ? pos[0]
            : boundaries[side]
          : pos[0],
    };

    boundaries[side] = calFuncMap[side]();
  };

  // wtf
  // for (let yA = 0; yA < FLAT_WORLD_HEIGHT; yA++) {
  for (let xA = x * CHUNK_SIZE; xA < (x + 1) * CHUNK_SIZE; xA++) {
    for (let zA = z * CHUNK_SIZE; zA < (z + 1) * CHUNK_SIZE; zA++) {
      const xPos = xA * 2;
      const zPos = zA * 2;
      const nY = noise.GetNoise(xA, zA);

      const position = [
        xPos,
        Math.round(nY * 10) % 2 ? Math.round(nY * 10) + 1 : Math.round(nY * 10),
        zPos,
      ];

      boundaries.highestY =
        position[1] > boundaries.highestY ? position[1] : boundaries.highestY;

      boundaries.lowestY =
        position[1] < boundaries.lowestY ? position[1] : boundaries.lowestY;

      sides.forEach((side) => sideFunc(side, position));

      const blockName = nameFromCoordinate(
        position[0],
        position[1],
        position[2]
      );

      let shouldAssignBlock = true;

      if (chunkBlocksCustom?.[blockName] == 0) {
        shouldAssignBlock = false;
      }

      if (shouldAssignBlock)
        blocksInChunk[blockName] = {
          position,
          type: "grass",
        };
    }
  }
  // }

  // merge existing or deleted blocks with generated blocks

  if (chunkBlocksCustom) {
    blocksInChunk = {
      ...blocksInChunk,
      ...Object.keys(chunkBlocksCustom).reduce((prev, currKey) => {
        const { x, y, z } = detailFromName(currKey);

        boundaries.highestY = y > boundaries.highestY ? y : boundaries.highestY;

        boundaries.lowestY = y < boundaries.lowestY ? y : boundaries.lowestY;

        sides.forEach((side) => sideFunc(side, [x, y, z]));

        if (chunkBlocksCustom[currKey] == 0) {
          return prev;
        }

        return {
          ...prev,
          [currKey]: {
            position: [x, y, z],
            type: chunkBlocksCustom[currKey],
          },
        };
      }, {}),
    };
  }

  return { blocksInChunk, boundaries };
};
import FastNoiseLite from "fastnoise-lite";
import { BLOCK_WIDTH, CHUNK_SIZE } from "../../constants";
import { Face } from "../../constants/block";
import blocks from "../../constants/blocks";
import { detailFromName } from "../helpers/detailFromName";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";

const { leftZ, rightZ, leftX, rightX } = Face;

type FaceCustom = typeof leftZ | typeof rightZ | typeof leftX | typeof rightX;

export const getBlocksInChunk = (
  x: number,
  z: number,
  chunkBlocksCustom: Record<string, 0 | keyof typeof blocks>,
  seed: number
) => {
  const noise = new FastNoiseLite();
  noise.SetFrequency(0.026);
  noise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
  noise.SetFractalType(FastNoiseLite.FractalType.FBm);
  noise.SetFractalOctaves(1.7);
  noise.SetFractalLacunarity(0.3);
  noise.SetFractalGain(4);
  noise.SetFractalWeightedStrength(3.4);
  noise.SetSeed(seed);

  const noiseTree = new FastNoiseLite();
  noiseTree.SetFrequency(0.007);
  noiseTree.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
  noiseTree.SetFractalType(FastNoiseLite.FractalType.FBm);
  noiseTree.SetFractalOctaves(6);
  noiseTree.SetFractalLacunarity(4.98);
  noiseTree.SetFractalGain(5.63);
  noiseTree.SetFractalWeightedStrength(5);
  noiseTree.SetSeed(seed);

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

  const createBlock = (position: number[], type: keyof typeof blocks) => {
    boundaries.highestY =
      position[1] > boundaries.highestY ? position[1] : boundaries.highestY;

    boundaries.lowestY =
      position[1] < boundaries.lowestY ? position[1] : boundaries.lowestY;

    const blockName = nameFromCoordinate(position[0], position[1], position[2]);

    let shouldAssignBlock = true;

    if (chunkBlocksCustom?.[blockName] == 0) {
      shouldAssignBlock = false;
    }

    if (shouldAssignBlock)
      blocksInChunk[blockName] = {
        position,
        type,
      };
  };

  const createTree = (position: number[], length: number) => {
    const [x, y, z] = position;

    const leavesStack = 3;

    const roundLeavesOffset = [
      { x: -1, z: 0 },
      { x: 1, z: 0 },
      { x: 0, z: -1 },
      { x: 0, z: 1 },
      { x: -1, z: -1 },
      { x: -1, z: 1 },
      { x: 1, z: -1 },
      { x: 1, z: 1 },
    ];

    const roundLeavesOutsideOffset = [
      { x: -2, z: 0 },
      { x: 2, z: 0 },
      { x: 0, z: -2 },
      { x: 0, z: 2 },
      { x: -2, z: -1 },
      { x: -1, z: -2 },
      { x: -1, z: 2 },
      { x: -2, z: 1 },
      { x: 1, z: -2 },
      { x: 2, z: -1 },
      { x: 1, z: 2 },
      { x: 2, z: 1 },
    ];

    createBlock([x, y - BLOCK_WIDTH, z], "dirt");

    for (let l = 0; l < length; l++) {
      createBlock([x, y + BLOCK_WIDTH * l, z], "wood");
    }

    for (let stack = 0; stack < leavesStack; stack++) {
      const offset = stack + length;
      const currentStackY = y + BLOCK_WIDTH * offset;
      createBlock([x, currentStackY, z], "leaves");

      roundLeavesOffset.forEach((offset) => {
        createBlock(
          [
            x + offset.x * BLOCK_WIDTH,
            currentStackY,
            z + offset.z * BLOCK_WIDTH,
          ],
          "leaves"
        );
      });

      if (stack != 2)
        roundLeavesOutsideOffset.forEach((offset) => {
          createBlock(
            [
              x + offset.x * BLOCK_WIDTH,
              currentStackY,
              z + offset.z * BLOCK_WIDTH,
            ],
            "leaves"
          );
        });
    }
  };

  const peakPos = [];
  const treePos = [];

  // wtf

  for (let xA = x * CHUNK_SIZE; xA < (x + 1) * CHUNK_SIZE; xA++) {
    for (let zA = z * CHUNK_SIZE; zA < (z + 1) * CHUNK_SIZE; zA++) {
      const xPos = xA * 2;
      const zPos = zA * 2;
      const nY = noise.GetNoise(xA, zA);
      let yPos =
        (Math.round(nY * 10) % 2
          ? Math.round(nY * 10) + 1
          : Math.round(nY * 10)) + 10;

      yPos = yPos <= 0 ? 2 : yPos;

      const position = [xPos, yPos, zPos];

      peakPos.push(position);

      {
        if (treePos.length < 1) {
          const nY = noiseTree.GetNoise(xA, zA);

          const shouldHaveTree = !Math.floor(nY);

          if (shouldHaveTree) {
            const nYS = noiseTree.GetNoise(xA, zA + 1);
            const positionTree = [
              position[0],
              position[1] + BLOCK_WIDTH,
              position[2],
            ];

            const treeLength = Math.round(nYS * 100) % 2 ? 3 : 2;

            treePos.push({ position: positionTree, treeLength });
          }
        }
      }
    }
  }

  // fill bellow item with stone
  peakPos.forEach((pos) => {
    const [x, y, z] = pos;

    let countSurface = 0;

    for (let yA = y; yA >= 0; yA -= 2) {
      let blockType: keyof typeof blocks = "stone";

      const newPos = [x, yA, z];

      if (countSurface == 0) blockType = "grass";

      if (countSurface == 1) blockType = "dirt";

      if (countSurface > 3) blockType = "stone";

      if (yA == 0) blockType = "bedrock";

      createBlock(newPos, blockType);

      countSurface++;
    }
  });

  // place trees
  treePos.forEach(({ position, treeLength }) => {
    createTree(position, treeLength);
  });

  // merge existing or deleted blocks with generated blocks
  if (chunkBlocksCustom) {
    blocksInChunk = {
      ...blocksInChunk,
      ...Object.keys(chunkBlocksCustom).reduce((prev, currKey) => {
        const { x, y, z } = detailFromName(currKey);

        boundaries.highestY = y > boundaries.highestY ? y : boundaries.highestY;

        boundaries.lowestY = y < boundaries.lowestY ? y : boundaries.lowestY;

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

  return {
    blocksInChunk,
    boundaries,
  };
};

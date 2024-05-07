import FastNoiseLite from "fastnoise-lite";

import { BLOCK_WIDTH, CHUNK_SIZE } from "../../constants";
import { BlockKeys } from "../../constants/blocks";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";
import { BaseGeneration } from "./baseUtilsGeneration";
import { getRound } from "../helpers/getRound";

export class DefaultWorld extends BaseGeneration {
  noise = new FastNoiseLite();
  noiseTree = new FastNoiseLite();
  noiseWaterFlow = new FastNoiseLite();

  constructor(seed: number) {
    super(seed);

    this.setupNoise();
  }

  setupNoise() {
    this.noise.SetFrequency(0.026);
    this.noise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
    this.noise.SetFractalType(FastNoiseLite.FractalType.FBm);
    this.noise.SetFractalOctaves(3);
    this.noise.SetFractalLacunarity(0.65);
    this.noise.SetFractalGain(0.179);
    this.noise.SetFractalWeightedStrength(12);
    this.noise.SetSeed(this.seed);

    this.noiseTree.SetFrequency(0.007);
    this.noiseTree.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
    this.noiseTree.SetFractalType(FastNoiseLite.FractalType.FBm);
    this.noiseTree.SetFractalOctaves(6);
    this.noiseTree.SetFractalLacunarity(4.98);
    this.noiseTree.SetFractalGain(5.63);
    this.noiseTree.SetFractalWeightedStrength(5);
    this.noiseTree.SetSeed(this.seed);

    this.noiseWaterFlow.SetFrequency(0.004);
    this.noiseWaterFlow.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
    this.noiseWaterFlow.SetFractalType(FastNoiseLite.FractalType.FBm);
    this.noiseWaterFlow.SetFractalOctaves(15);
    this.noiseWaterFlow.SetFractalLacunarity(1.55);
    this.noiseWaterFlow.SetFractalGain(0.09);
    this.noiseWaterFlow.SetFractalWeightedStrength(0.47);
    this.noiseWaterFlow.SetDomainWarpType(
      FastNoiseLite.DomainWarpType.BasicGrid
    );
    this.noiseWaterFlow.SetDomainWarpAmp(3.5);
    this.noiseWaterFlow.SetSeed(this.seed);
  }

  getBlocksInChunk(
    x: number,
    z: number,
    chunkBlocksCustom: Record<string, 0 | BlockKeys>
  ) {
    const blocksInChunk: Record<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = {};

    const blocksInChunkTypeOnly: Record<string, BlockKeys | 0> = {};

    const createBlock = (position: number[], type: BlockKeys) => {
      const blockName = nameFromCoordinate(
        position[0],
        position[1],
        position[2]
      );

      let shouldAssignBlock = true;

      if (chunkBlocksCustom?.[blockName] == 0) {
        shouldAssignBlock = false;
        blocksInChunkTypeOnly[blockName] = 0;
      }

      if (shouldAssignBlock) {
        blocksInChunk[blockName] = {
          position,
          type,
        };

        blocksInChunkTypeOnly[blockName] = type;
      }
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

    for (let xA = x * CHUNK_SIZE; xA < (x + 1) * CHUNK_SIZE; xA++) {
      for (let zA = z * CHUNK_SIZE; zA < (z + 1) * CHUNK_SIZE; zA++) {
        const xPos = xA * 2;
        const zPos = zA * 2;

        const nY = this.noise.GetNoise(xA, zA);
        const nY2 = this.noiseWaterFlow.GetNoise(xA, zA);

        let yPos = getRound(nY * 10) + getRound(nY2 * 20) + 40;

        yPos = yPos <= 0 ? 2 : yPos;

        const position = [xPos, yPos, zPos];

        peakPos.push(position);

        {
          if (treePos.length < 1) {
            const nY = this.noiseTree.GetNoise(xA, zA);

            const shouldHaveTree = !Math.floor(nY);

            if (shouldHaveTree) {
              const nYS = this.noiseTree.GetNoise(xA, zA + 1);
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
    peakPos.forEach((position) => {
      const [x, y, z] = position;

      let countSurface = 0;

      for (let yA = y; yA >= 0; yA -= 2) {
        let blockType: BlockKeys = "stone";

        const newPos = [x, yA, z];

        this.lowestY =
          this.lowestY === undefined
            ? newPos[1]
            : newPos[1] < this.lowestY
            ? newPos[1]
            : this.lowestY;

        if (countSurface == 0) blockType = "grass";

        if (countSurface == 1) blockType = "dirt";

        if (countSurface > 3) blockType = "stone";

        if (yA == 0) blockType = "bedrock";

        createBlock(newPos, blockType);

        countSurface++;
      }

      if (y <= 28) {
        let countSurface = 0;

        for (let yA = y; yA <= 28; yA += 2) {
          const newPos = [x, yA, z];

          let blockType: BlockKeys = "water";

          if (countSurface == 0) blockType = "sand";

          countSurface++;

          createBlock(newPos, blockType);
        }
      }
    });

    // place trees
    treePos.forEach(({ position, treeLength }) => {
      if (position[1] > 28) createTree(position, treeLength);
    });

    const { mergedBlocksInChunkTypeOnly, mergedBlocksInChunk } =
      this.mergeBlocks(blocksInChunk, chunkBlocksCustom, blocksInChunkTypeOnly);

    return {
      blocksInChunk: mergedBlocksInChunk,
      blocksInChunkTypeOnly: mergedBlocksInChunkTypeOnly,
    };
  }

  initialize(
    x: number,
    z: number,
    chunkBlocksCustom: Record<string, 0 | BlockKeys>,
    neighborsChunkData: Record<string, Record<string, 0 | BlockKeys>>
  ) {
    const { blocksInChunk } = this.getBlocksInChunk(x, z, chunkBlocksCustom);

    const blocksInChunkNeighbor = Object.keys(neighborsChunkData).reduce(
      (prev, key) => {
        const [x, z] = key.split("_");

        const { blocksInChunkTypeOnly } = this.getBlocksInChunk(
          Number(x),
          Number(z),
          (neighborsChunkData || {})[key]
        );

        return {
          ...prev,
          ...blocksInChunkTypeOnly,
        };
      },
      {}
    );

    const facesToRender = this.calFaceToRender(
      blocksInChunk,
      blocksInChunkNeighbor
    );

    return {
      facesToRender,
      blocksInChunk,
    };
  }
}

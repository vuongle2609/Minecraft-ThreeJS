import { BLOCK_WIDTH } from "@/constants";
import { Face } from "@/constants/block";
import { getNeighborsSeparate } from "@/game/helpers/blocksHelpers";
import { detailFromName } from "@/game/helpers/detailFromName";
import { BlockKeys, FaceAoType } from "@/type";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";

const { leftZ, rightZ, leftX, rightX, bottom, top } = Face;

export class BaseGeneration {
  seed: number;

  lowestY: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // merge existing or deleted blocks with generated blocks
  mergeBlocks(
    blocksInChunk: Map<
      string,
      {
        position: number[];
        type: BlockKeys | 0;
      }
    > = new Map(),
    chunkBlocksCustom: Record<string, 0 | BlockKeys>
  ) {
    Object.keys(chunkBlocksCustom || {}).forEach((currKey) => {
      const { x, y, z } = detailFromName(currKey);

      blocksInChunk.set(currKey, {
        position: [x, y, z],
        type: chunkBlocksCustom[currKey],
      });
    });
  }

  shouldRenderFace(
    neighBor?: { position: number[]; type: BlockKeys | 0 } | boolean,
    type?: BlockKeys
  ) {
    if (typeof neighBor !== "boolean" && neighBor?.type === BlockKeys.water) {
      // does not handle client face process
      if (type === BlockKeys.water) {
        return false;
      }
      return true;
    }

    if (
      typeof neighBor !== "boolean" &&
      (neighBor?.type as unknown as number) === 0
    ) {
      return true;
    }

    return !neighBor;
  }

  getBlockOffset(
    positionOffset: number[],
    position: number[],
    blocksInChunk: Map<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = new Map()
  ) {
    const [x1, y1, z1] = positionOffset;
    const [x, y, z] = position;

    const queryResult = blocksInChunk.get(
      nameFromCoordinate(
        x + x1 * BLOCK_WIDTH,
        y + y1 * BLOCK_WIDTH,
        z + z1 * BLOCK_WIDTH
      )
    );

    return queryResult?.type;
  }

  getFacesOcclusion(
    position: number[],
    blocksInChunk: Map<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = new Map()
  ) {
    let blockTopType = null;

    const blockTop = this.getBlockOffset([0, 1, 0], position, blocksInChunk);

    if (!blockTop) {
      const blockTopC1 = this.getBlockOffset(
        [1, 1, 1],
        position,
        blocksInChunk
      );
      if (blockTopC1) blockTopType = FaceAoType.v3;

      const blockTopC2 = this.getBlockOffset(
        [1, 1, -1],
        position,
        blocksInChunk
      );
      if (blockTopC2) blockTopType = FaceAoType.v2;

      const blockTopC3 = this.getBlockOffset(
        [-1, 1, 1],
        position,
        blocksInChunk
      );
      if (blockTopC3) blockTopType = FaceAoType.v4;

      const blockTopC4 = this.getBlockOffset(
        [-1, 1, -1],
        position,
        blocksInChunk
      );
      if (blockTopC4) blockTopType = FaceAoType.v1;

      const blockTopE1 = this.getBlockOffset(
        [-1, 1, 0],
        position,
        blocksInChunk
      );
      if (blockTopE1) blockTopType = FaceAoType.e4;

      const blockTopE2 = this.getBlockOffset(
        [1, 1, 0],
        position,
        blocksInChunk
      );
      if (blockTopE2) blockTopType = FaceAoType.e2;

      const blockTopE3 = this.getBlockOffset(
        [0, 1, 1],
        position,
        blocksInChunk
      );
      if (blockTopE3) blockTopType = FaceAoType.e3;

      const blockTopE4 = this.getBlockOffset(
        [0, 1, -1],
        position,
        blocksInChunk
      );
      if (blockTopE4) blockTopType = FaceAoType.e1;

      const blockTopLevel1 = this.getBlockOffset(
        [0, 2, 0],
        position,
        blocksInChunk
      );
      const blockTopLevel2 = this.getBlockOffset(
        [0, 3, 0],
        position,
        blocksInChunk
      );
      const blockTopLevel3 = this.getBlockOffset(
        [0, 4, 0],
        position,
        blocksInChunk
      );
      const blockTopLevel4 = this.getBlockOffset(
        [0, 5, 0],
        position,
        blocksInChunk
      );
      if (blockTopLevel1) {
        blockTopType = FaceAoType.f4;
      }
      if (blockTopLevel2) {
        blockTopType = FaceAoType.f3;
      }
      if (blockTopLevel3) {
        blockTopType = FaceAoType.f2;
      }
      if (blockTopLevel4) {
        blockTopType = FaceAoType.f1;
      }
    }

    const valueToSet = {
      [leftZ]: FaceAoType.f4,
      [rightZ]: FaceAoType.f1,
      [leftX]: null,
      [rightX]: null,
      [bottom]: null,
      [top]: blockTopType,
    };

    return valueToSet;
  }

  calFaceToRender(
    blocksInChunk: Map<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = new Map(),
    blocksInChunkNeighbor: Map<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = new Map()
  ) {
    const blockExisting = new Map([...blocksInChunk, ...blocksInChunkNeighbor]);

    Object.keys(blocksInChunk);

    const facesToRender = new Map();
    const blockOcclusion = new Map();

    for (let [key, value] of blocksInChunk) {
      const { position, type } = value;

      const [x, y, z] = position;

      const faceHasNeighbor = getNeighborsSeparate(
        blockExisting,
        { x, y, z },
        {
          [leftZ]: true,
          [rightZ]: true,
          [leftX]: true,
          [rightX]: true,
          [bottom]: true,
          [top]: true,
        },
        BLOCK_WIDTH
      );

      const valueToSet = {
        [leftZ]: this.shouldRenderFace(faceHasNeighbor?.[leftZ], type),
        [rightZ]: this.shouldRenderFace(faceHasNeighbor?.[rightZ], type),
        [leftX]: this.shouldRenderFace(faceHasNeighbor?.[leftX], type),
        [rightX]: this.shouldRenderFace(faceHasNeighbor?.[rightX], type),
        [bottom]: this.shouldRenderFace(faceHasNeighbor?.[bottom], type),
        [top]: this.shouldRenderFace(faceHasNeighbor?.[top], type),
      };

      const shouldSet = Object.values(valueToSet).filter(Boolean).length;

      if (shouldSet) {
        facesToRender.set(key, valueToSet);

        blockOcclusion.set(
          key,
          this.getFacesOcclusion(position, blockExisting)
        );
      }
    }

    return { facesToRender, blockOcclusion };
  }
}

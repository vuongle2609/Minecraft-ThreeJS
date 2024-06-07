import { BLOCK_WIDTH } from "@/constants";
import { Face } from "@/constants/block";
import { getNeighborsSeparate } from "@/game/helpers/blocksHelpers";
import { detailFromName } from "@/game/helpers/detailFromName";
import { BlockKeys, FaceAoType } from "@/type";
import { getFacesOcclusion } from "../helpers/calculateAO";
import {
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Object3D,
  Vector3,
} from "three";
import blocks, { renderGeometry } from "@/constants/blocks";

const { leftZ, rightZ, leftX, rightX, bottom, top } = Face;

export class BaseGeneration {
  seed: number;

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

  calChunkMatrix(
    blocksInChunk: Map<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = new Map(),
    facesToRender: Map<
      string,
      {
        [leftZ]: boolean;
        [rightZ]: boolean;
        [leftX]: boolean;
        [rightX]: boolean;
        [bottom]: boolean;
        [top]: boolean;
      }
    >,
    blockOcclusion: Map<string, Record<Face, FaceAoType | null>>
  ) {
    //{
    //  "type0": {
    //    posColl0: matrix4[],
    //    posColl1: matrix4[],
    //    posColl2: matrix4[],
    //  },
    //  "type1": {
    //    posColl0: matrix4[],
    //    posColl1: matrix4[],
    //    posColl2: matrix4[],
    //  },
    //  "type2": {
    //    posColl0: matrix4[],
    //    posColl1: matrix4[],
    //    posColl2: matrix4[],
    //  },
    //}

    const instanced = Object.keys(blocks).reduce((prev, blockKey) => {
      const currentBlock = blocks[blockKey as unknown as BlockKeys];

      const textureFaceInstanced = Object.keys(
        currentBlock.textureFaceAo
      ).reduce((prev, aoType) => {
        //@ts-ignore
        const currTexture = currentBlock.textureFaceAo[aoType];

        const count = blocksInChunk.size;

        return {
          ...prev,
          [aoType]: {
            prevCount: 0,
          },
        };
      }, {});

      return {
        ...prev,
        [blockKey]: {
          ...currentBlock,
        },
      };
    }, {});

    const dummy = new Object3D();

    let i = 0;
    for (const [key, { position }] of blocksInChunk) {
      const matrix = new Matrix4();
      matrix.setPosition(new Vector3(position[0], position[1], position[2]));
      this.blocks[type].setMatrixAt(this.getCount(type), matrix);
    }

    
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

    const facesToRender = new Map<
      string,
      {
        [leftZ]: boolean;
        [rightZ]: boolean;
        [leftX]: boolean;
        [rightX]: boolean;
        [bottom]: boolean;
        [top]: boolean;
      }
    >();
    const blockOcclusion = new Map<string, Record<Face, FaceAoType | null>>();

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

      let valueToSet = {
        [leftZ]: this.shouldRenderFace(faceHasNeighbor?.[leftZ], type),
        [rightZ]: this.shouldRenderFace(faceHasNeighbor?.[rightZ], type),
        [leftX]: this.shouldRenderFace(faceHasNeighbor?.[leftX], type),
        [rightX]: this.shouldRenderFace(faceHasNeighbor?.[rightX], type),
        [bottom]: this.shouldRenderFace(faceHasNeighbor?.[bottom], type),
        [top]: this.shouldRenderFace(faceHasNeighbor?.[top], type),
      };

      if (type === BlockKeys.bedrock) {
        valueToSet = {
          [leftZ]: false,
          [rightZ]: false,
          [leftX]: false,
          [rightX]: false,
          [bottom]: false,
          [top]: this.shouldRenderFace(faceHasNeighbor?.[top], type),
        };
      }

      const shouldSet = Object.values(valueToSet).filter(Boolean).length;

      if (shouldSet) {
        facesToRender.set(key, valueToSet);

        blockOcclusion.set(key, getFacesOcclusion(position, blockExisting));
      }
    }

    return { facesToRender, blockOcclusion };
  }
}

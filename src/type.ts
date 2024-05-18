import { InstancedMesh } from "three";


export enum BlockKeys {
  grass = 1,
  bedrock = 2,
  stone = 3,
  sand = 4,
  dirt = 5,
  cobblestone = 6,
  leaves = 7,
  wood = 8,
  furnace = 9,
  oakPlanks = 10,
  blockOfDiamond = 11,
  blockOfIron = 12,
  blockOfGold = 13,
  blockOfLapis = 14,
  blockOfEmerald = 15,
  water = 16,
}

export enum BlockTextureType {
  top,
  side,
  sideOther,
  bottom,
  front,
  back,
}
export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  shift: boolean;
  leftClick: boolean;
  rightClick: boolean;
}

export type BlocksMappingType = Record<string, BlockKeys | 0>;

export interface WorldsType {
  createdDate: Date;
  blocksWorldChunk: Record<string, BlocksMappingType>;
  name: string;
  worldType: number;
  seed?: number;
  initPos?: number[];
  rotation?: number[];
}

export interface BlocksIntancedMapping
  extends Record<BlockKeys, BlocksIntancedType> {}

export interface BlocksIntancedType
  extends Record<
    BlockTextureType,
    {
      mesh: InstancedMesh;
      count: number;
      indexCanAllocate: number[];
    }
  > {}

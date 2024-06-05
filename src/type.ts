import { InstancedMesh, MeshLambertMaterial } from "three";

export enum BlockKeys {
  grass = 1,
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
  bedrock = 17,
}

export enum BlockTextureType {
  top,
  side,
  sideOther,
  bottom,
  front,
  back,
}

export enum FaceAoType {
  e1,
  e2,
  e3,
  e4,
  f1,
  f2,
  f3,
  f4,
  v1,
  v2,
  v3,
  v4,
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

export type BlocksType = Record<
  BlockKeys,
  {
    name: string;
    renderInInventory: boolean;
    icon: string;
    step: HTMLAudioElement;
    place: HTMLAudioElement;
    break: HTMLAudioElement;
    volume: 0.1;
    texture: Record<BlockTextureType, MeshLambertMaterial>;
    textureMap: BlockTextureType[];
    textureFaceAo: Record<
      BlockTextureType,
      Record<FaceAoType | "base", MeshLambertMaterial>
    >;
  }
>;

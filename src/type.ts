import blocks, { BlockKeys } from './constants/blocks';

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

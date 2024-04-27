import blocks from "./constants/blocks";

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

export type BlocksMappingType = Record<string, keyof typeof blocks | 0>;

export interface WorldsType {
  createdDate: Date;
  blocksMapping: BlocksMappingType;
  name: string;
  worldType: number;
  initPos?: number[];
  rotation?: number[];
}

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

export interface WorldsType {
  createdDate: Date;
  blocksMapping: {};
  name: string;
  worldType: number;
}

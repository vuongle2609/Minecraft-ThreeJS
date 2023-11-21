export interface CharacterAnimationType {
  running: THREE.AnimationAction | undefined;
  runningBack: THREE.AnimationAction | undefined;
  walking: THREE.AnimationAction | undefined;
  idle: THREE.AnimationAction | undefined;
  jump: THREE.AnimationAction | undefined;
  leftRun: THREE.AnimationAction | undefined;
  rightRun: THREE.AnimationAction | undefined;
  hit: THREE.AnimationAction | undefined;
  hitSecond: THREE.AnimationAction | undefined;
  getHit: THREE.AnimationAction | undefined;
  roll: THREE.AnimationAction | undefined;
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

export type CoordinateType = number[];

export interface VerticesType {
  [key: string]: PointsType;
}

export interface PointsType {
  points: CoordinateType;
  neighBors: CoordinateType[];
}

export interface PointsFormatObj<T> extends PointsType {
  g: null | number;
  f: null | number;
  prev: T | null;
}
export interface PointsFormatObjRecusive
  extends PointsFormatObj<PointsFormatObjRecusive> {}

export interface PointsFormatType {
  [key: string]: PointsFormatObjRecusive;
}

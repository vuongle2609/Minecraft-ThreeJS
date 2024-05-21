import { Mesh } from 'three';

export enum Face {
  leftZ,
  rightZ,
  leftX,
  rightX,
  top,
  bottom,
}

const { leftZ, rightZ, leftX, rightX, top, bottom } = Face;

export type BlockFaces = {
  [leftZ]: null | number;
  [rightZ]: null | number;
  [leftX]: null | number;
  [rightX]: null | number;
  [top]: null | number;
  [bottom]: null | number;
};

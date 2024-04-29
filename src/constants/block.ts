import { Mesh } from "three";

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
  [leftZ]: null | Mesh;
  [rightZ]: null | Mesh;
  [leftX]: null | Mesh;
  [rightX]: null | Mesh;
  [top]: null | Mesh;
  [bottom]: null | Mesh;
};

import { BlockKeys } from "@/type";

export const nameFromCoordinate = (
  x: number,
  y: number,
  z: number,
  type?: BlockKeys,
  face?: number
) => {
  return (
    x +
    "_" +
    y +
    "_" +
    z +
    (type ? "_" + type : "") +
    (face?.toString() ? "_" + face : "")
  );
};

export const nameChunkFromCoordinate = (x: number, z: number) => {
  return x + "_" + z;
};

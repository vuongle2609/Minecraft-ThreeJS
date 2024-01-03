import blocks from "@/constants/blocks";

const nameFromCoordinate = (
  x: number,
  y: number,
  z: number,
  type: string,
  face: number
) => {
  return x + "_" + y + "_" + z + "_" + type + "_" + face;
};

export default nameFromCoordinate;

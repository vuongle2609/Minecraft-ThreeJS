import { BlockKeys } from "@/constants/blocks";
import { Face } from "../../constants/block";
import { nameFromCoordinate } from "./nameFromCoordinate";

const { leftZ, rightZ, leftX, rightX, top, bottom } = Face;

export const getNeighbors = (
  blocks: Record<string, any>,
  { x, y, z }: { x: number; y: number; z: number },
  faces: Record<Face, boolean>,
  offSet: number = 0
) => {
  const neighbor1 = faces[rightZ]
    ? blocks[nameFromCoordinate(x, y, z - offSet)]
    : true;
  const neighbor2 = faces[leftZ]
    ? blocks[nameFromCoordinate(x, y, z + offSet)]
    : true;
  const neighbor3 = faces[rightX]
    ? blocks[nameFromCoordinate(x - offSet, y, z)]
    : true;
  const neighbor4 = faces[leftX]
    ? blocks[nameFromCoordinate(x + offSet, y, z)]
    : true;
  const neighbor5 = faces[top]
    ? blocks[nameFromCoordinate(x, y + offSet, z)]
    : true;
  const neighbor6 = faces[bottom]
    ? blocks[nameFromCoordinate(x, y - offSet, z)]
    : true;

  return (
    neighbor1 && neighbor2 && neighbor3 && neighbor4 && neighbor5 && neighbor6
  );
};

export const getNeighborsSeparate = (
  blocks: Map<string, { position: number[]; type: BlockKeys }>,
  { x, y, z }: { x: number; y: number; z: number },
  faces: Record<Face, boolean>,
  offSet: number = 0
) => {
  const neighbor1 = faces[rightZ]
    ? blocks.get(nameFromCoordinate(x, y, z - offSet))
    : true;
  const neighbor2 = faces[leftZ]
    ? blocks.get(nameFromCoordinate(x, y, z + offSet))
    : true;
  const neighbor3 = faces[rightX]
    ? blocks.get(nameFromCoordinate(x - offSet, y, z))
    : true;
  const neighbor4 = faces[leftX]
    ? blocks.get(nameFromCoordinate(x + offSet, y, z))
    : true;
  const neighbor5 = faces[top]
    ? blocks.get(nameFromCoordinate(x, y + offSet, z))
    : true;
  const neighbor6 = faces[bottom]
    ? blocks.get(nameFromCoordinate(x, y - offSet, z))
    : true;

  return {
    [rightZ]: neighbor1,
    [leftZ]: neighbor2,
    [rightX]: neighbor3,
    [leftX]: neighbor4,
    [top]: neighbor5,
    [bottom]: neighbor6,
  };
};

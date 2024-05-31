import { BLOCK_WIDTH } from "@/constants";
import { CHARACTER_LENGTH, CHARACTER_WIDTH } from "@/constants/player";
import { Vector3 } from "three";

export const getBoundingBoxPlayer = (x: number, y: number, z: number) => {
  return {
    max: new Vector3(
      x + CHARACTER_WIDTH / 2,
      y + CHARACTER_LENGTH,
      z + CHARACTER_WIDTH / 2
    ),
    min: new Vector3(x - CHARACTER_WIDTH / 2, y, z - CHARACTER_WIDTH / 2),
  };
};

export const getBoundingBoxBlock = (x: number, y: number, z: number) => {
  return {
    max: new Vector3(
      x + BLOCK_WIDTH / 2,
      y + BLOCK_WIDTH / 2,
      z + BLOCK_WIDTH / 2
    ),
    min: new Vector3(
      x - BLOCK_WIDTH / 2,
      y - BLOCK_WIDTH / 2,
      z - BLOCK_WIDTH / 2
    ),
  };
};

export const isBoundingBoxCollide = (
  box1Min: Vector3,
  box1Max: Vector3,
  box2Min: Vector3,
  box2Max: Vector3
) => {
  return !(
    box1Max.x < box2Min.x ||
    box1Min.x > box2Max.x ||
    box1Max.y < box2Min.y ||
    box1Min.y > box2Max.y ||
    box1Max.z < box2Min.z ||
    box1Min.z > box2Max.z
  );
};

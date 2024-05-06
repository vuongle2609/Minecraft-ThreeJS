import { Face } from "@/constants/block";
import { Euler } from "three";

const { leftZ, rightZ, leftX, rightX, top, bottom } = Face;

export const getFaceFromRotation = (rotation: Euler) => {
  if (rotation.y > 3) {
    return rightZ;
  } else if (rotation.y > 0) {
    return leftX;
  } else if (rotation.y < 0) {
    return rightX;
  } else if (rotation.x < 0) {
    return top;
  } else if (rotation.x > 0) {
    return bottom;
  } else {
    return leftZ;
  }
};

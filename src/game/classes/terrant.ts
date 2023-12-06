import {
  BoxGeometry,
  Material,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";

export default class Terrant extends BaseEntity {
  constructor(
    props: BasePropsType & {
      blocks: Mesh<BoxGeometry, Material[]>[];
      boxGeometry: BoxGeometry;
    }
  ) {
    super(props);
    this.initialize(props.blocks, props.boxGeometry);
  }

  async initialize(
    blocks: Mesh<BoxGeometry, Material[]>[],
    boxGeometry: BoxGeometry
  ) {
    const halfWidth = 8 * 2;

    for (let i = -halfWidth; i < halfWidth; i++) {
      for (let j = -halfWidth; j < halfWidth; j++) {
        console.log('dat')
        new Block({
          position: new Vector3(i * 2, 0, j * 2),
          scene: this.scene,
          type: "grass",
          blocks: blocks,
          boxGeometry,
        });
      }
    }
  }
}

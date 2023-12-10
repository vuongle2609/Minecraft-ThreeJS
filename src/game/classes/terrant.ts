import { BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";

export default class Terrant extends BaseEntity {
  constructor(
    props: BasePropsType & {
      blocks: Mesh<BoxGeometry, MeshStandardMaterial[]>[];
    }
  ) {
    super(props);
    this.initialize(props.blocks);
  }

  async initialize(blocks: Mesh<BoxGeometry, MeshStandardMaterial[]>[]) {
    const halfWidth = 5 * 2;

    for (let i = -halfWidth; i < halfWidth; i++) {
      for (let j = -halfWidth; j < halfWidth; j++) {
        new Block({
          position: new Vector3(i * 2, 0, j * 2),
          scene: this.scene,
          type: "grass",
          blocks: blocks,
        });
      }
    }
  }
}

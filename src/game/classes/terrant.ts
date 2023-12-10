import { BoxGeometry, Mesh, Material, Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";
import nameFromCoordinate from "../helpers/nameFromCoordinate";

export default class Terrant extends BaseEntity {
  blocksMapping: Record<string, Mesh<BoxGeometry, Material[]>> = {};

  constructor(
    props: BasePropsType & {
      blocks: Mesh<BoxGeometry, Material[]>[];
    }
  ) {
    super(props);
    this.initialize(props.blocks);
  }

  async initialize(blocks: Mesh<BoxGeometry, Material[]>[]) {
    const halfWidth = 5 * 2;

    for (let i = -halfWidth; i < halfWidth; i++) {
      for (let j = -halfWidth; j < halfWidth; j++) {
        const position = new Vector3(i * 2, 0, j * 2);
        const block = new Block({
          position: position,
          scene: this.scene,
          type: "grass",
          blocks: blocks,
        });

        this.blocksMapping = {
          ...this.blocksMapping,
          [nameFromCoordinate(position.x, position.y, position.z)]: block.get(),
        };

        this.worker?.postMessage({
          type: "addBlock",
          data: {
            position: [position.x, position.y, position.z],
            type: "grass",
          },
        });
      }
    }
  }

  get() {
    return this.blocksMapping;
  }
}

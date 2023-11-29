import { BoxGeometry, Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";

export default class Terrant extends BaseEntity {
  geometryBlock = new BoxGeometry(2, 2, 2);

  constructor(props: BasePropsType) {
    super(props);
    this.initialize();
  }

  async initialize() {
    const halfWidth = 7;

    for (let i = -halfWidth; i < halfWidth; i++) {
      for (let j = -halfWidth; j < halfWidth; j++) {
        new Block({
          position: new Vector3(i * 2, 0, j * 2),
          scene: this.scene,
          type: "grass",
          physicsEngine: this.physicsEngine,
          geometryBlock: this.geometryBlock,
        });
      }
    }
  }
}

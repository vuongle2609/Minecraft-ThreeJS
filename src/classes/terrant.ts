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
    for (let i = -40; i < 40; i++) {
      for (let j = -40; j < 40; j++) {
        new Block({
          position: new Vector3(i * 2, 0, j * 2),
          scene: this.scene,
          type: "grass",
          worker: this.worker,
          geometryBlock: this.geometryBlock,
        });
      }
    }
  }
}

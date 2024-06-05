import { AmbientLight } from "three";

import BaseEntity, { BasePropsType } from "./baseEntity";

export default class Light extends BaseEntity {
  constructor(props: BasePropsType) {
    super(props);
    this.initial();
  }

  initial() {
    const ambientLight = new AmbientLight(0xffffff, 0.7);

    this.scene?.add(ambientLight);
  }
}

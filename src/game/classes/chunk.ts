import { InstancedMesh, MeshLambertMaterial } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import { renderGeometry } from "@/constants/blocks";

interface PropsType {
  blocksGroup: any;
}

export default class Chunk extends BaseEntity {
  constructor(props: BasePropsType & PropsType) {
    super(props);

    const { blocksGroup } = props;

    this.initialize(blocksGroup);
  }

  initialize(blocksGroup: any) {
    for (let i = 0; i < 22; i++) {
      const objectTest = new InstancedMesh(
        renderGeometry,
        new MeshLambertMaterial(),
        200
      );
      blocksGroup?.add(objectTest);
    }
  }
}

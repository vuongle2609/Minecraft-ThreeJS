import blocks, { BlockKeys, renderGeometry } from "@/constants/blocks";
import { BlocksInstancedMapping } from "@/type";
import { DynamicDrawUsage, InstancedMesh, Object3D } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

export default class Chunk extends BaseEntity {
  dummy = new Object3D();
  blocksInstanced = Object.keys(blocks).reduce((prev, typeKey) => {
    const currBlock = blocks[typeKey as BlockKeys];

    return {
      ...prev,
      [typeKey]: Object.keys(currBlock.texture).reduce((prev, key) => {
        const mesh = new InstancedMesh(
          renderGeometry,
          currBlock.texture[key as unknown as keyof typeof currBlock.texture],
          100000
        );

        mesh.instanceMatrix.setUsage(DynamicDrawUsage);

        this.scene?.add(mesh);
        mesh.count = 0;
        mesh.instanceMatrix.needsUpdate = true;
        mesh.frustumCulled = false;
        return {
          ...prev,
          [key]: {
            mesh,
            count: 0,
            indexCanAllocate: [],
          },
        };
      }, {}),
    };
  }, {}) as BlocksInstancedMapping;

  constructor(props: BasePropsType) {
    super(props);
  }
}

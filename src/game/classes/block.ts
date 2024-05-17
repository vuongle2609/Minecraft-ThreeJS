import { Matrix4, Mesh, Object3D, Vector3 } from "three";

import { BLOCK_WIDTH } from "@/constants";
import { BlockFaces, Face } from "@/constants/block";
import blocks, {
  BlockAttributeType,
  BlockKeys,
  renderGeometry,
} from "@/constants/blocks";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";

import BaseEntity, { BasePropsType } from "./baseEntity";
import { BlocksInstancedType } from "@/type";

interface PropsType {
  position: Vector3;
  type: BlockKeys;
  blocksMapping: Map<string, Block>;
  facesToRender?: Record<Face, boolean>;
  dummy: Object3D;
  instancedPlanes: BlocksInstancedType;
}

const { leftZ, rightZ, leftX, rightX, top, bottom } = Face;

export default class Block extends BaseEntity {
  blockFaces: BlockFaces = {
    [leftZ]: null,
    [rightZ]: null,
    [leftX]: null,
    [rightX]: null,
    [top]: null,
    [bottom]: null,
  };
  type: BlockKeys;
  position: Vector3;
  atttribute: BlockAttributeType;
  blocksMapping: Map<string, Block>;

  dummy: Object3D;
  instancedPlanes: BlocksInstancedType;

  constructor(props: BasePropsType & PropsType) {
    super(props);

    const {
      type,
      position,
      blocksMapping,
      facesToRender,
      dummy,
      instancedPlanes,
    } = props!;

    this.type = type;
    this.position = position;
    this.atttribute = blocks[type];
    this.blocksMapping = blocksMapping;
    this.dummy = dummy;
    this.instancedPlanes = instancedPlanes;

    facesToRender ? this.renderWithKnownFace(facesToRender) : this.render();
  }

  getObject(name: string) {
    return this.scene?.getObjectByName(name) as THREE.Object3D;
  }

  renderWithKnownFace(facesToRender: Record<Face, boolean>) {
    if (facesToRender[leftZ]) this.addFace(leftZ);
    if (facesToRender[rightZ]) this.addFace(rightZ);
    if (facesToRender[leftX]) this.addFace(leftX);
    if (facesToRender[rightX]) this.addFace(rightX);
    if (facesToRender[top]) this.addFace(top);
    if (facesToRender[bottom]) this.addFace(bottom);
  }

  render() {
    // should handle at top level, maybe dont need?
    // if (position.x % 2 || position.y % 2 || position.z % 2) return;

    const { x, y, z } = this.position;

    const leftZBlock = this.blocksMapping.get(
      nameFromCoordinate(x, y, z + BLOCK_WIDTH)
    );
    if (leftZBlock) {
      leftZBlock.removeFace(rightZ);
    } else {
      this.addFace(leftZ);
    }

    const rightZBlock = this.blocksMapping.get(
      nameFromCoordinate(x, y, z - BLOCK_WIDTH)
    );
    if (rightZBlock) {
      rightZBlock.removeFace(leftZ);
    } else {
      this.addFace(rightZ);
    }

    const leftXBlock = this.blocksMapping.get(
      nameFromCoordinate(x + BLOCK_WIDTH, y, z)
    );
    if (leftXBlock) {
      leftXBlock.removeFace(rightX);
    } else {
      this.addFace(leftX);
    }

    const rightXBlock = this.blocksMapping.get(
      nameFromCoordinate(x - BLOCK_WIDTH, y, z)
    );
    if (rightXBlock) {
      rightXBlock.removeFace(leftX);
    } else {
      this.addFace(rightX);
    }

    const topBlock = this.blocksMapping.get(
      nameFromCoordinate(x, y + BLOCK_WIDTH, z)
    );
    if (topBlock) {
      topBlock.removeFace(bottom);
    } else {
      this.addFace(top);
    }

    const bottomBlock = this.blocksMapping.get(
      nameFromCoordinate(x, y - BLOCK_WIDTH, z)
    );
    if (bottomBlock) {
      bottomBlock.removeFace(top);
    } else {
      this.addFace(bottom);
    }
  }

  removeFace(face: keyof BlockFaces, updateMatrix?: boolean) {
    const currInstanced =
      this.instancedPlanes[this.atttribute.textureMap[face]].mesh;

    const index = this.blockFaces[face];

    if (index !== null) {
      currInstanced.setMatrixAt(
        index,
        new Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      );

      this.instancedPlanes[
        this.atttribute.textureMap[face]
      ].indexCanAllocate.push(index);

      if (updateMatrix) {
        currInstanced.instanceMatrix.needsUpdate = true;
        currInstanced.computeBoundingSphere();
      }
    }
  }

  addFace(face: keyof BlockFaces, updateMatrix?: boolean) {
    const { rotation } = this.calFaceAttr(face);

    const currInstanced =
      this.instancedPlanes[this.atttribute.textureMap[face]];

    const currInstancedMesh = currInstanced.mesh;
    const indexAllowCate = currInstanced.indexCanAllocate.pop();

    const index =
      indexAllowCate !== undefined ? indexAllowCate : currInstancedMesh.count;

    this.dummy.position.copy(this.position);
    this.dummy.rotation.set(rotation[0], rotation[1], rotation[2]);
    this.dummy.updateMatrix();

    this.blockFaces[face] = index;

    currInstancedMesh.setMatrixAt(index, this.dummy.matrix);
    if (updateMatrix) {
      currInstancedMesh.instanceMatrix.needsUpdate = true;
      currInstancedMesh.computeBoundingSphere();
    }
    if (indexAllowCate === undefined) currInstancedMesh.count += 1;
  }

  calFaceAttr(face: keyof BlockFaces) {
    switch (face) {
      case leftZ:
        return { rotation: [0, 0, 0] };
      case rightZ:
        return { rotation: [0, Math.PI, 0] };
      case leftX:
        return {
          rotation: [0, Math.PI / 2, 0],
        };
      case rightX:
        return {
          rotation: [0, -Math.PI / 2, 0],
        };
      case top:
        return {
          rotation: [-Math.PI / 2, 0, 0],
        };
      case bottom:
        return {
          rotation: [Math.PI / 2, 0, 0],
        };
    }
  }

  destroy({
    isClearChunk,
    updateMatrix,
  }: {
    isClearChunk?: boolean;
    updateMatrix?: boolean;
  }) {
    const { x, y, z } = this.position;

    Object.keys(this.blockFaces).forEach((face) => {
      this.removeFace(face as unknown as keyof BlockFaces, updateMatrix);
    });

    if (isClearChunk) return;

    const leftZBlock = this.blocksMapping.get(
      nameFromCoordinate(x, y, z + BLOCK_WIDTH)
    );
    leftZBlock?.addFace(rightZ);

    const rightZBlock = this.blocksMapping.get(
      nameFromCoordinate(x, y, z - BLOCK_WIDTH)
    );
    rightZBlock?.addFace(leftZ);

    const leftXBlock = this.blocksMapping.get(
      nameFromCoordinate(x + BLOCK_WIDTH, y, z)
    );
    leftXBlock?.addFace(rightX);

    const rightXBlock = this.blocksMapping.get(
      nameFromCoordinate(x - BLOCK_WIDTH, y, z)
    );
    rightXBlock?.addFace(leftX);

    const topBlock = this.blocksMapping.get(
      nameFromCoordinate(x, y + BLOCK_WIDTH, z)
    );
    topBlock?.addFace(bottom);

    const bottomBlock = this.blocksMapping.get(
      nameFromCoordinate(x, y - BLOCK_WIDTH, z)
    );
    bottomBlock?.addFace(top);

    this.blocksMapping.delete(nameFromCoordinate(x, y, z));
  }
}

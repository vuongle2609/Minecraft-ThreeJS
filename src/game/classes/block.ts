import { Matrix4, Object3D, Vector3 } from "three";

import { BLOCK_WIDTH } from "@/constants";
import { BlockFaces, Face } from "@/constants/block";
import blocks, { BlockAttributeType, BlockKeys } from "@/constants/blocks";

import { BlocksInstancedType } from "@/type";
import BaseEntity, { BasePropsType } from "./baseEntity";

interface PropsType {
  position: Vector3;
  type: BlockKeys;
  blocksMapping: Record<string, Record<string, Record<string, Block>>>;
  facesToRender?: Record<Face, boolean>;
  dummy: Object3D;
  intancedPlanes: BlocksInstancedType;
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
  blocksMapping: Record<string, Record<string, Record<string, Block>>>;

  dummy: Object3D;
  intancedPlanes: BlocksInstancedType;

  constructor(props: BasePropsType & PropsType) {
    super(props);

    const {
      type,
      position,
      blocksMapping,
      facesToRender,
      dummy,
      intancedPlanes,
    } = props!;

    this.type = type;
    this.position = position;
    this.atttribute = blocks[type];
    this.blocksMapping = blocksMapping;
    this.dummy = dummy;
    this.intancedPlanes = intancedPlanes;

    facesToRender ? this.renderWithKnownFace(facesToRender) : this.render();
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

    const leftZBlock = this.blocksMapping[x]?.[y]?.[z + BLOCK_WIDTH];
    if (leftZBlock) {
      leftZBlock.removeFace(rightZ, true);
    } else {
      this.addFace(leftZ, true);
    }

    const rightZBlock = this.blocksMapping[x]?.[y]?.[z - BLOCK_WIDTH];
    if (rightZBlock) {
      rightZBlock.removeFace(leftZ, true);
    } else {
      this.addFace(rightZ, true);
    }

    const leftXBlock = this.blocksMapping[x + BLOCK_WIDTH]?.[y]?.[z];
    if (leftXBlock) {
      leftXBlock.removeFace(rightX, true);
    } else {
      this.addFace(leftX, true);
    }

    const rightXBlock = this.blocksMapping[x - BLOCK_WIDTH]?.[y]?.[z];
    if (rightXBlock) {
      rightXBlock.removeFace(leftX, true);
    } else {
      this.addFace(rightX, true);
    }

    const topBlock = this.blocksMapping[x]?.[y + BLOCK_WIDTH]?.[z];
    if (topBlock) {
      topBlock.removeFace(bottom, true);
    } else {
      this.addFace(top, true);
    }

    const bottomBlock = this.blocksMapping[x]?.[y - BLOCK_WIDTH]?.[z];
    if (bottomBlock) {
      bottomBlock.removeFace(top, true);
    } else {
      this.addFace(bottom, true);
    }
  }

  removeFace(face: keyof BlockFaces, updateMatrix?: boolean) {
    const currInstanced =
      this.intancedPlanes[this.atttribute.textureMap[face]].mesh;

    const index = this.blockFaces[face];

    if (index !== null) {
      currInstanced.setMatrixAt(
        index,
        new Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      );

      this.intancedPlanes[
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

    const currInstanced = this.intancedPlanes[this.atttribute.textureMap[face]];

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

  destroy(updateMatrix?: boolean) {
    const { x, y, z } = this.position;

    Object.keys(this.blockFaces).forEach((face) => {
      this.removeFace(face as unknown as keyof BlockFaces, updateMatrix);
    });

    const leftZBlock = this.blocksMapping[x]?.[y]?.[z + BLOCK_WIDTH];
    leftZBlock?.addFace(rightZ, updateMatrix);

    const rightZBlock = this.blocksMapping[x]?.[y]?.[z - BLOCK_WIDTH];
    rightZBlock?.addFace(leftZ, updateMatrix);

    const leftXBlock = this.blocksMapping[x + BLOCK_WIDTH]?.[y]?.[z];
    leftXBlock?.addFace(rightX, updateMatrix);

    const rightXBlock = this.blocksMapping[x - BLOCK_WIDTH]?.[y]?.[z];
    rightXBlock?.addFace(leftX, updateMatrix);

    const topBlock = this.blocksMapping[x]?.[y + BLOCK_WIDTH]?.[z];
    topBlock?.addFace(bottom, updateMatrix);

    const bottomBlock = this.blocksMapping[x]?.[y - BLOCK_WIDTH]?.[z];
    bottomBlock?.addFace(top, updateMatrix);

    delete this.blocksMapping[x][y][z];
  }
}

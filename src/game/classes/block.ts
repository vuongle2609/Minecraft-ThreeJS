import { Group, Matrix4, Object3D, Vector3 } from "three";

import { BLOCK_WIDTH } from "@/constants";
import { BlockFaces, Face } from "@/constants/block";
import blocks, { BlockAttributeType } from "@/constants/blocks";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { BlockKeys, BlocksIntancedType } from "@/type";
import BaseEntity, { BasePropsType } from "./baseEntity";

interface PropsType {
  position: Vector3;
  type: BlockKeys;
  blocksGroup: Group;
  blocksMapping: Map<string, Block>;
  facesToRender?: Record<Face, boolean> | null;
  isPlace?: boolean;
  dummy: Object3D;
  intancedPlanes: BlocksIntancedType;
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
  blocksGroup: Group;
  isPlace: boolean;

  dummy: Object3D;
  index: number;
  intancedPlanes: BlocksIntancedType;

  constructor(props: BasePropsType & PropsType) {
    super(props);

    const {
      type,
      position,
      blocksMapping,
      blocksGroup,
      facesToRender,
      isPlace,
      dummy,
      intancedPlanes,
    } = props!;

    this.blocksGroup = blocksGroup;
    this.type = type;
    this.position = position;
    this.atttribute = blocks[type];
    this.blocksMapping = blocksMapping;
    this.isPlace = !!isPlace;
    this.intancedPlanes = intancedPlanes;
    this.blocksMapping = blocksMapping;
    this.dummy = dummy;

    if (facesToRender === null) return;

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

  removeFace(face: keyof BlockFaces) {
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
    }
  }

  addFace(face: keyof BlockFaces) {
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
    if (indexAllowCate === undefined) currInstancedMesh.count += 1;
    currInstancedMesh.instanceMatrix.needsUpdate = true;
  }

  calFaceAttr(face: keyof BlockFaces) {
    switch (face) {
      case leftZ:
        return { rotation: [0, 0, 0] };
      case rightZ:
        return {
          rotation: [0, Math.PI, 0],
        };
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

  destroy(isClearChunk?: boolean) {
    const { x, y, z } = this.position;

    Object.keys(this.blockFaces).forEach((face) => {
      this.removeFace(face as unknown as keyof BlockFaces);
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

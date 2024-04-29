import { BLOCK_WIDTH } from "@/constants";
import blocks, { BlockAttributeType, renderGeometry } from "@/constants/blocks";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { InstancedMesh, Mesh, Object3D, PlaneGeometry, Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

interface PropsType {
  position: Vector3;
  type: keyof typeof blocks;
  blocksMapping: Record<string, Record<string, Record<string, BlockA>>>;
  intancedFaces: Record<string, number>;
}

enum Face {
  leftZ,
  rightZ,
  leftX,
  rightX,
  top,
  bottom,
}

const { leftZ, rightZ, leftX, rightX, top, bottom } = Face;

type BlockFaces = {
  [leftZ]: null | Mesh;
  [rightZ]: null | Mesh;
  [leftX]: null | Mesh;
  [rightX]: null | Mesh;
  [top]: null | Mesh;
  [bottom]: null | Mesh;
};

const halfWidth = BLOCK_WIDTH / 2;

export default class BlockA extends BaseEntity {
  blockFaces: BlockFaces = {
    [leftZ]: null,
    [rightZ]: null,
    [leftX]: null,
    [rightX]: null,
    [top]: null,
    [bottom]: null,
  };
  type: keyof typeof blocks;
  position: Vector3;
  atttribute: BlockAttributeType;
  blocksMapping: Record<string, Record<string, Record<string, BlockA>>>;
  intancedFaces: Record<string, number>;

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.type = props.type;
    this.position = props.position;
    this.atttribute = blocks[props.type];
    this.blocksMapping = props.blocksMapping;
    this.intancedFaces= props.intancedFaces

    this.initialize();
  }

  getObject(name: string) {
    return this.scene?.getObjectByName(name) as THREE.Object3D;
  }

  async initialize() {
    // should handle at top level
    // if (position.x % 2 || position.y % 2 || position.z % 2) return;

    const { x, y, z } = this.position;

    const leftZBlock = this.blocksMapping[x]?.[y]?.[z + BLOCK_WIDTH];
    if (leftZBlock) {
      leftZBlock.removeFace(rightZ);
    } else {
      this.addFace(leftZ);
    }

    const rightZBlock = this.blocksMapping[x]?.[y]?.[z - BLOCK_WIDTH];
    if (rightZBlock) {
      rightZBlock.removeFace(leftZ);
    } else {
      this.addFace(rightZ);
    }

    const leftXBlock = this.blocksMapping[x + BLOCK_WIDTH]?.[y]?.[z];
    if (leftXBlock) {
      leftXBlock.removeFace(rightX);
    } else {
      this.addFace(leftX);
    }

    const rightXBlock = this.blocksMapping[x - BLOCK_WIDTH]?.[y]?.[z];
    if (rightXBlock) {
      rightXBlock.removeFace(leftX);
    } else {
      this.addFace(rightX);
    }

    const topBlock = this.blocksMapping[x]?.[y + BLOCK_WIDTH]?.[z];
    if (topBlock) {
      topBlock.removeFace(bottom);
    } else {
      this.addFace(top);
    }

    const bottomBlock = this.blocksMapping[x]?.[y - BLOCK_WIDTH]?.[z];
    if (bottomBlock) {
      bottomBlock.removeFace(top);
    } else {
      this.addFace(bottom);
    }
  }

  removeFace(face: keyof BlockFaces) {
    this.scene?.remove(this.blockFaces[face] as Object3D);
  }

  addFace(face: keyof BlockFaces) {
    const plane = new Mesh(renderGeometry, this.atttribute.texture[face]);

    const { x, y, z } = this.position;

    const { position, rotation } = this.calFaceAttr(face);

    plane.position.set(position[0], position[1], position[2]);
    plane.rotation.set(rotation[0], rotation[1], rotation[2]);
    plane.name = nameFromCoordinate(x, y, z, this.type, face);

    this.blockFaces[face] = plane;
    this.scene?.add(plane);
  }

  calFaceAttr(face: keyof BlockFaces) {
    const { x, y, z } = this.position;

    switch (face) {
      case leftZ:
        return { position: [x, y, z + halfWidth], rotation: [0, 0, 0] };
      case rightZ:
        return { position: [x, y, z - halfWidth], rotation: [0, Math.PI, 0] };
      case leftX:
        return {
          position: [x + halfWidth, y, z],
          rotation: [0, Math.PI / 2, 0],
        };
      case rightX:
        return {
          position: [x - halfWidth, y, z],
          rotation: [0, -Math.PI / 2, 0],
        };
      case top:
        return {
          position: [x, y + halfWidth, z],
          rotation: [-Math.PI / 2, 0, 0],
        };
      case bottom:
        return {
          position: [x, y - halfWidth, z],
          rotation: [Math.PI / 2, 0, 0],
        };
    }
  }

  destroy() {
    const { x, y, z } = this.position;

    Object.values(this.blockFaces).forEach((item) => {
      if (item) {
        item.geometry.dispose();
        this.scene?.remove(item);
      }
    });

    const leftZBlock = this.blocksMapping[x]?.[y]?.[z + BLOCK_WIDTH];
    leftZBlock?.addFace(rightZ);

    const rightZBlock = this.blocksMapping[x]?.[y]?.[z - BLOCK_WIDTH];
    rightZBlock?.addFace(leftZ);

    const leftXBlock = this.blocksMapping[x + BLOCK_WIDTH]?.[y]?.[z];
    leftXBlock?.addFace(rightX);

    const rightXBlock = this.blocksMapping[x - BLOCK_WIDTH]?.[y]?.[z];
    rightXBlock?.addFace(leftX);

    const topBlock = this.blocksMapping[x]?.[y + BLOCK_WIDTH]?.[z];
    topBlock?.addFace(bottom);

    const bottomBlock = this.blocksMapping[x]?.[y - BLOCK_WIDTH]?.[z];
    bottomBlock?.addFace(top);

    delete this.blocksMapping[x][y][z];
  }
}

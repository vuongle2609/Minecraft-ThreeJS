import { Group, Mesh, Object3D, Vector3 } from "three";

import { BLOCK_WIDTH } from "@/constants";
import { BlockFaces, Face } from "@/constants/block";
import blocks, { BlockAttributeType, renderGeometry } from "@/constants/blocks";
import { nameFromCoordinate } from "@/game/helpers/nameFromCoordinate";
import { BlockKeys, FaceAoType } from "@/type";
import { calNeighborsOffset } from "../helpers/calNeighborsOffset";
import { getFacesOcclusion } from "../helpers/calculateAO";
import BaseEntity, { BasePropsType } from "./baseEntity";

interface PropsType {
  position: Vector3;
  type: BlockKeys;
  blocksGroup: Group;
  blocksMapping: Map<string, Block>;
  facesToRender?: Record<Face, boolean> | null;
  isPlace?: boolean;
  blockOcclusion?: Record<Face, null | FaceAoType> | null;
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
  blockOcclusion: Record<Face, null | FaceAoType> = {
    [leftZ]: null,
    [rightZ]: null,
    [leftX]: null,
    [rightX]: null,
    [bottom]: null,
    [top]: null,
  };

  constructor(props: BasePropsType & PropsType) {
    super(props);

    const {
      type,
      position,
      blocksMapping,
      blocksGroup,
      facesToRender,
      isPlace,
      blockOcclusion,
    } = props!;

    this.blocksGroup = blocksGroup;
    this.type = type;
    this.position = position;
    this.atttribute = blocks[type];
    this.blocksMapping = blocksMapping;
    this.isPlace = !!isPlace;
    if (blockOcclusion) this.blockOcclusion = blockOcclusion;

    if (facesToRender === null) return;

    facesToRender ? this.renderWithKnownFace(facesToRender) : this.render();
  }

  renderWithKnownFace(facesToRender: Record<Face, boolean | any>) {
    if (facesToRender[leftZ]) this.addFace(leftZ);
    if (facesToRender[rightZ]) this.addFace(rightZ);
    if (facesToRender[leftX]) this.addFace(leftX);
    if (facesToRender[rightX]) this.addFace(rightX);
    if (facesToRender[top]) this.addFace(top);
    if (facesToRender[bottom]) this.addFace(bottom);
  }

  calculateAO() {
    const { x, y, z } = this.position;

    this.blockOcclusion = getFacesOcclusion([x, y, z], this.blocksMapping);
  }

  calculateAONeighbors() {
    const offSets = calNeighborsOffset(1, BLOCK_WIDTH);
    for (let hs = 1; hs > -6; hs--) {
      offSets.forEach(({ x, z }) => {
        if (x === 0 && z === 0 && hs === 0) return;

        const blockCoor = [
          this.position.x + x,
          this.position.y + hs * BLOCK_WIDTH,
          this.position.z + z,
        ];

        const block = this.blocksMapping.get(
          nameFromCoordinate(blockCoor[0], blockCoor[1], blockCoor[2])
        );

        block?.calculateAO();
        block?.rerenderAO();
      });
    }
  }

  rerenderAO() {
    Object.values(this.blockFaces).forEach((item) => {
      if (item) {
        this.blocksGroup?.remove(item);
        item.geometry.dispose();
      }
    });

    this.renderWithKnownFace(this.blockFaces);
  }

  render() {
    this.calculateAO();

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
    this.blocksGroup?.remove(this.blockFaces[face] as Object3D);
  }

  addFace(face: keyof BlockFaces) {
    const faceAoKey = this.blockOcclusion[face] || "base";

    const textureAo = this.atttribute.textureFaceAo;

    const material =
      textureAo[this.atttribute.textureMap[face] as keyof typeof textureAo][
        faceAoKey
      ];

    const plane = new Mesh(renderGeometry, material);

    const { rotation } = this.calFaceAttr(face);

    const { x, y, z } = this.position;

    plane.position.set(x, y, z);
    plane.rotation.set(rotation[0], rotation[1], rotation[2]);
    plane.name = nameFromCoordinate(x, y, z, this.type, face);

    this.blockFaces[face] = plane;
    this.blocksGroup?.add(plane);
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

    Object.values(this.blockFaces).forEach((item) => {
      if (item) {
        this.blocksGroup?.remove(item);
        item.geometry.dispose();
      }
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
    this.calculateAONeighbors();
  }
}

import blocks from "@/constants/blocks";
import nameFromCoordinate from "@/game/helpers/nameFromCoordinate";
import { BoxGeometry, Material, Mesh, PlaneGeometry, Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import { BLOCK_WIDTH } from "@/constants";

interface PropsType {
  position: Vector3;
  type: keyof typeof blocks;
  blocksMapping: Record<string, Record<string, Record<string, string>>>;
}

export default class Block extends BaseEntity {
  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.initialize({
      position: props.position,
      type: props.type,
      blocksMapping: props.blocksMapping,
    });
  }

  getObject(name: string) {
    return this.scene?.getObjectByName(name) as THREE.Object3D;
  }

  async initialize({ position, type, blocksMapping }: PropsType) {
    if (position.x % 2 || position.y % 2 || position.z % 2) return;

    const halfWidth = BLOCK_WIDTH / 2;

    const geometry = new PlaneGeometry(BLOCK_WIDTH, BLOCK_WIDTH);

    const placeBlock = blocks[type];

    const textures = placeBlock.texture;

    const { x, y, z } = position;

    const leftZBlock = blocksMapping[x]?.[y]?.[z + BLOCK_WIDTH];
    if (leftZBlock) {
      this.scene?.remove(
        this.getObject(nameFromCoordinate(x, y, z + BLOCK_WIDTH, leftZBlock, 1))
      );
    } else {
      const plane = new Mesh(geometry, textures[0]);
      plane.position.set(x, y, z + halfWidth);
      plane.name = nameFromCoordinate(
        position.x,
        position.y,
        position.z,
        type,
        0
      );
      this.scene?.add(plane);
    }

    const rightZBlock = blocksMapping[x]?.[y]?.[z - BLOCK_WIDTH];
    if (rightZBlock) {
      this.scene?.remove(
        this.getObject(
          nameFromCoordinate(x, y, z - BLOCK_WIDTH, rightZBlock, 0)
        )
      );
    } else {
      const plane = new Mesh(geometry, textures[1]);
      plane.position.set(x, y, z - halfWidth);
      plane.rotation.set(0, Math.PI, 0);
      plane.name = nameFromCoordinate(
        position.x,
        position.y,
        position.z,
        type,
        1
      );
      this.scene?.add(plane);
    }

    const leftXBlock = blocksMapping[x + BLOCK_WIDTH]?.[y]?.[z];
    if (leftXBlock) {
      this.scene?.remove(
        this.getObject(nameFromCoordinate(x + BLOCK_WIDTH, y, z, leftXBlock, 3))
      );
    } else {
      const plane = new Mesh(geometry, textures[4]);
      plane.position.set(x + halfWidth, y, z);
      plane.rotation.set(0, Math.PI / 2, 0);
      plane.name = nameFromCoordinate(
        position.x,
        position.y,
        position.z,
        type,
        2
      );
      this.scene?.add(plane);
    }

    const rightXBlock = blocksMapping[x - BLOCK_WIDTH]?.[y]?.[z];
    if (rightXBlock) {
      this.scene?.remove(
        this.getObject(
          nameFromCoordinate(x - BLOCK_WIDTH, y, z, rightXBlock, 2)
        )
      );
    } else {
      const plane = new Mesh(geometry, textures[5]);
      plane.position.set(x - halfWidth, y, z);
      plane.rotation.set(0, -Math.PI / 2, 0);
      plane.name = nameFromCoordinate(
        position.x,
        position.y,
        position.z,
        type,
        3
      );
      this.scene?.add(plane);
    }

    const topBlock = blocksMapping[x]?.[y + BLOCK_WIDTH]?.[z];
    if (topBlock) {
      this.scene?.remove(
        this.getObject(nameFromCoordinate(x, y + BLOCK_WIDTH, z, topBlock, 5))
      );
    } else {
      const plane = new Mesh(geometry, textures[2]);
      plane.position.set(x, y + halfWidth, z);
      plane.rotation.set(-Math.PI / 2, 0, 0);
      plane.name = nameFromCoordinate(
        position.x,
        position.y,
        position.z,
        type,
        4
      );
      this.scene?.add(plane);
    }

    const bottomBlock = blocksMapping[x]?.[y - BLOCK_WIDTH]?.[z];
    if (bottomBlock) {
      this.scene?.remove(
        this.getObject(
          nameFromCoordinate(x, y - BLOCK_WIDTH, z, bottomBlock, 4)
        )
      );
    } else {
      const plane = new Mesh(geometry, textures[3]);
      plane.position.set(x, y - halfWidth, z);
      plane.rotation.set(Math.PI / 2, 0, 0);
      plane.name = nameFromCoordinate(
        position.x,
        position.y,
        position.z,
        type,
        5
      );
      this.scene?.add(plane);
    }
  }
}

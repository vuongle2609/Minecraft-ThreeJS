import blocks from "@/constants/blocks";
import nameFromCoordinate from "@/game/helpers/nameFromCoordinate";
import { BoxGeometry, Material, Mesh, PlaneGeometry, Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

interface PropsType {
  position: Vector3;
  type: keyof typeof blocks;
  blocksMapping: Record<string, Record<string, Record<string, string>>>;
}

export default class Block extends BaseEntity {
  block: Mesh<BoxGeometry, Material[]>;

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

    const meshWidth = 2;
    const halfWidth = meshWidth / 2;

    const geometry = new PlaneGeometry(meshWidth, meshWidth);

    const gName = nameFromCoordinate(position.x, position.y, position.z);

    // if (this.scene?.getObjectByName(name)) return;

    const placeBlock = blocks[type];

    const textures = placeBlock.texture;

    const { x, y, z } = position;

    const leftZBlock = blocksMapping[x]?.[y]?.[z + 2];
    if (leftZBlock) {
      this.scene?.remove(this.getObject(leftZBlock + "_" + 1));
    } else {
      const plane = new Mesh(geometry, textures[0]);
      plane.position.set(x, y, z + halfWidth);
      plane.name = gName + "_" + 0;
      this.scene?.add(plane);
    }

    const rightZBlock = blocksMapping[x]?.[y]?.[z - 2];
    if (rightZBlock) {
      this.scene?.remove(this.getObject(rightZBlock + "_" + 0));
    } else {
      const plane = new Mesh(geometry, textures[1]);
      plane.position.set(x, y, z - halfWidth);
      plane.rotation.set(0, Math.PI, 0);
      plane.name = gName + "_" + 1;
      this.scene?.add(plane);
    }

    const leftXBlock = blocksMapping[x + 2]?.[y]?.[z];
    if (leftXBlock) {
      this.scene?.remove(this.getObject(leftXBlock + "_" + 3));
    } else {
      const plane = new Mesh(geometry, textures[4]);
      plane.position.set(x + halfWidth, y, z);
      plane.rotation.set(0, Math.PI / 2, 0);
      plane.name = gName + "_" + 2;
      this.scene?.add(plane);
    }

    const rightXBlock = blocksMapping[x - 2]?.[y]?.[z];
    if (rightXBlock) {
      this.scene?.remove(this.getObject(rightXBlock + "_" + 2));
    } else {
      const plane = new Mesh(geometry, textures[5]);
      plane.position.set(x - halfWidth, y, z);
      plane.rotation.set(0, -Math.PI / 2, 0);
      plane.name = gName + "_" + 3;
      this.scene?.add(plane);
    }

    const topBlock = blocksMapping[x]?.[y + 2]?.[z];
    if (topBlock) {
      this.scene?.remove(this.getObject(topBlock + "_" + 5));
    } else {
      const plane = new Mesh(geometry, textures[2]);
      plane.position.set(x, y + halfWidth, z);
      plane.rotation.set(-Math.PI / 2, 0, 0);
      plane.name = gName + "_" + 4;
      this.scene?.add(plane);
    }

    const bottomBlock = blocksMapping[x]?.[y - 2]?.[z];
    if (bottomBlock) {
      this.scene?.remove(this.getObject(bottomBlock + "_" + 4));
    } else {
      const plane = new Mesh(geometry, textures[3]);
      plane.position.set(x, y - halfWidth, z);
      plane.rotation.set(Math.PI / 2, 0, 0);
      plane.name = gName + "_" + 5;
      this.scene?.add(plane);
    }
  }

  get() {
    return this.block;
  }
}

import blocks from "@/constants/blocks";
import nameFromCoordinate from "@/game/helpers/nameFromCoordinate";
import { BoxGeometry, Mesh, Material, Vector3, InstancedMesh } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

interface PropsType {
  position: Vector3;
  type: keyof typeof blocks;
  blocks?: Mesh<BoxGeometry, Material[]>[];
  boxGeometry: BoxGeometry
}
export default class Block extends BaseEntity {
  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.initialize({
      position: props.position,
      type: props.type,
      blocks: props.blocks,
      boxGeometry: props.boxGeometry
    });
  }

  async initialize({ position, type, blocks: blockArr, boxGeometry }: PropsType) {
    if (position.x % 2 || position.y % 2 || position.z % 2) return;

    const name = nameFromCoordinate(position.x, position.y, position.z);

    if (this.scene?.getObjectByName(name)) return;

    const placeBlock = blocks[type];

    const textures = placeBlock.texture;

    const newBlock = new Mesh(
      new BoxGeometry(2,2,2),
      textures,
    );

    newBlock.name = name;
    // newBlock.castShadow = true;
    // newBlock.receiveShadow = true;

    newBlock.position.set(position.x, position.y, position.z);

    blockArr?.push(newBlock);

    this.scene?.add(newBlock);
  }
}

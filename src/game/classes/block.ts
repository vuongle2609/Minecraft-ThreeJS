import blocks from "@/constants/blocks";
import nameFromCoordinate from "@/game/helpers/nameFromCoordinate";
import { BoxGeometry, Mesh, Material, Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

interface PropsType {
  position: Vector3;
  type: keyof typeof blocks;
  blocks?: Mesh<BoxGeometry, Material[]>[];
}

export default class Block extends BaseEntity {
  block: Mesh<BoxGeometry, Material[]>;
  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.initialize({
      position: props.position,
      type: props.type,
      blocks: props.blocks,
    });
  }

  async initialize({ position, type, blocks: blockArr }: PropsType) {
    if (position.x % 2 || position.y % 2 || position.z % 2) return;

    const name = nameFromCoordinate(position.x, position.y, position.z);

    if (this.scene?.getObjectByName(name)) return;

    const placeBlock = blocks[type];

    const textures = placeBlock.texture;

    // textures.forEach(item => {
    //   item.emis
    // })

    const boxGeometry = new BoxGeometry(2, 2, 2);

    this.block = new Mesh(boxGeometry, textures);

    this.block.name = name;

    // this.block.castShadow = true;
    // this.block.receiveShadow = true;

    this.block.position.set(position.x, position.y, position.z);

    blockArr?.push(this.block);

    this.scene?.add(this.block);
  }

  get() {
    return this.block;
  }
}

import blocks from "@/constants/blocks";
import { Body, Box, Vec3 } from "cannon-es";
import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  TextureLoader,
  Vector3,
} from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import { physicsMaterial } from "./gameScene";

interface PropsType {
  position: Vector3;
  type: keyof typeof blocks;
}

export default class Block extends BaseEntity {
  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.initialize({
      position: props.position,
      type: props.type,
    });
  }

  async initialize({ position, type }: PropsType) {
    const textureLoader = new TextureLoader();

    const placeBlock = blocks[type];
    console.log(
      "🚀 ~ file: block.ts:31 ~ Block ~ initialize ~ placeBlock:",
      type
    );

    const textures = await Promise.all(
      placeBlock.texture.map(async (namePath) => {
        const texture = await textureLoader.loadAsync(
          `/assets/${type}/${namePath}.jpg`
        );

        return new MeshStandardMaterial({
          map: texture,
        });
      })
    );

    const newBlock = new Mesh(new BoxGeometry(2, 2, 2), textures);

    const blockPhysicsBody = new Body({
      type: Body.STATIC,
      shape: new Box(new Vec3(1, 1, 1)),
      material: physicsMaterial,
    });
    blockPhysicsBody.position.set(position.x, position.y, position.z);
    this.world?.addBody(blockPhysicsBody);

    newBlock.receiveShadow = true;
    newBlock.castShadow = true;
    newBlock.position.set(position.x, position.y, position.z);

    this.scene?.add(newBlock);
  }
}

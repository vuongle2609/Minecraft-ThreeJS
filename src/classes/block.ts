import blocks from "@/constants/blocks";
import nameFromCoordinate from "@/helpers/nameFromCoordinate";
import { BoxGeometry, InstancedMesh, Mesh, Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

interface PropsType {
  position: Vector3;
  type: keyof typeof blocks;
  geometryBlock?: any;
}

export default class Block extends BaseEntity {
  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.initialize({
      position: props.position,
      type: props.type,
    });
  }

  async initialize({ position, type, geometryBlock }: PropsType) {
    const placeBlock = blocks[type];

    const textures = placeBlock.texture;

    const boxGeometry = new BoxGeometry(2, 2, 2);

    const newBlock = geometryBlock
      ? new InstancedMesh(geometryBlock, textures, 1600 * 2)
      : new Mesh(boxGeometry, textures);

    newBlock.name = nameFromCoordinate(position.x, position.y, position.z);
    newBlock.castShadow = true;
    newBlock.receiveShadow = true;

    newBlock.position.set(position.x, position.y, position.z);

    this.scene?.add(newBlock);

    const blockDesc =
      this.physicsEngine?.RAPIER.RigidBodyDesc.fixed().setTranslation(
        position.x,
        position.y,
        position.z
      );

    if (!blockDesc) return;

    const blockBody = this.physicsEngine?.world.createRigidBody(blockDesc);

    const blockColliderDesc = this.physicsEngine?.RAPIER.ColliderDesc.cuboid(
      1,
      1,
      1
    );

    if (!blockBody || !blockColliderDesc) return;

    this.physicsEngine?.world.createCollider(blockColliderDesc, blockBody);
  }
}

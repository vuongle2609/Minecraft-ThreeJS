import blocks from "@/constants/blocks";
import nameFromCoordinate from "@/helpers/nameFromCoordinate";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NearestFilter,
  TextureLoader,
  Vector3,
} from "three";
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
    const textureLoader = new TextureLoader();

    const placeBlock = blocks[type];

    const textures = await Promise.all(
      placeBlock.texture.map(async (namePath) => {
        const texture = await textureLoader.loadAsync(
          `/assets/block/${namePath}.png`
        );

        texture.magFilter = NearestFilter;

        return new MeshStandardMaterial({
          map: texture,
          side: 0,
        });
      })
    );

    const boxGeometry = new BoxGeometry(2, 2, 2);

    const newBlock = geometryBlock
      ? new InstancedMesh(geometryBlock, textures, 1600 * 2)
      : new Mesh(boxGeometry, textures);

    // newBlock.receiveShadow = true;
    // newBlock.castShadow = true;
    newBlock.name = nameFromCoordinate(position.x, position.y, position.z);

    newBlock.position.set(position.x, position.y, position.z);

    this.scene?.add(newBlock);

    this.worker?.postMessage({
      type: "handleAddBlockToWorld",
      payload: {
        position: new Float32Array([position.x, position.y, position.z]),
      },
    });
  }
}

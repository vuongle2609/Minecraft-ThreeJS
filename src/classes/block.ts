import blocks from "@/constants/blocks";
import nameFromCoordinate from "@/helpers/nameFromCoordinate";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TextureLoader,
  Vector3,
} from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

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

    const textures = await Promise.all(
      placeBlock.texture.map(async (namePath) => {
        const texture = await textureLoader.loadAsync(
          `/assets/${type}/${namePath}.jpg`
        );

        return new MeshStandardMaterial({
          map: texture,
          // side: 0,
          vertexColors: true,
          wireframe: true
        });
      })
    );

    const vertices = [
      // Front face
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,

      // Back face
      -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,

      // Top face
      -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,

      // Bottom face
      -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,

      // Right face
      1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,

      // Left face
      -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
    ];

    // Define the indices of the vertices
    const indices = [
      0,
      1,
      2,
      0,
      2,
      3, // Front face
      4,
      5,
      6,
      4,
      6,
      7, // Back face
      8,
      9,
      10,
      8,
      10,
      11, // Top face
      12,
      13,
      14,
      12,
      14,
      15, // Bottom face
      16,
      17,
      18,
      16,
      18,
      19, // Right face
      20,
      21,
      22,
      20,
      22,
      23, // Left face
    ];

    // Define the colors of the edges
    const colors = [
      1,
      0,
      0, // Front face
      0,
      1,
      0, // Back face
      0,
      0,
      1, // Top face
      1,
      1,
      0, // Bottom face
      1,
      0,
      1, // Right face
      0,
      1,
      1, // Left face
    ];

    const geometry = new BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);


    const boxGeometry = new BoxGeometry(2,2,2)
    const material2 = new MeshBasicMaterial({ vertexColors: true });

    const newBlock = new Mesh(boxGeometry, textures);

    newBlock.receiveShadow = true;
    newBlock.castShadow = true;
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

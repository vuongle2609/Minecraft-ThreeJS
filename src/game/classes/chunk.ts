import { BlockFaces, Face } from "@/constants/block";
import blocks, { renderGeometry } from "@/constants/blocks";
import { BlockKeys, BlocksIntancedMapping, BlocksIntancedType } from "@/type";
import { Group, InstancedMesh, Object3D } from "three";
import { nameFromCoordinate } from "../helpers/nameFromCoordinate";
import BaseEntity, { BasePropsType } from "./baseEntity";

interface PropsType {
  arrayBlocksData: Int32Array;
  facesToRender: Record<string, Record<Face, boolean>>;
  typeRenderCount: Record<BlockKeys, Record<Face, number>>;
  blocksGroup: Group;
}

const { leftZ, rightZ, leftX, rightX, top, bottom } = Face;

export default class Chunk extends BaseEntity {
  blocksGroup: Group;
  dummy = new Object3D();

  constructor(props: BasePropsType & PropsType) {
    const { arrayBlocksData, facesToRender, typeRenderCount, blocksGroup } =
      props;

    super(props);

    this.blocksGroup = blocksGroup;

    this.initialize(arrayBlocksData, facesToRender, typeRenderCount);
  }

  initialize(
    arrayBlocksData: Int32Array,
    facesToRender: Record<string, Record<Face, boolean>>,
    typeRenderCount: Record<BlockKeys, Record<Face, number>>
  ) {
    const blockInstancedMapping = Object.keys(typeRenderCount).reduce(
      (prev, curr) => {
        const typeKey = curr as unknown as BlockKeys;
        const currBlock = blocks[typeKey];
        const faces = typeRenderCount[typeKey];

        const textureCount = new Map();

        Object.keys(faces).forEach((item) => {
          const face = item as unknown as Face;
          const faceNumber = faces[face];
          const textureType = currBlock.textureMap[Number(face)];

          const preTextureCount = textureCount.get(textureType);

          if (!preTextureCount) {
            textureCount.set(textureType, faceNumber);
          } else {
            textureCount.set(textureType, preTextureCount + faceNumber);
          }
        });

        return {
          ...prev,
          [typeKey]: Object.keys(currBlock.texture).reduce((prev, key) => {
            const mesh = new InstancedMesh(
              renderGeometry,
              currBlock.texture[
                key as unknown as keyof typeof currBlock.texture
              ],
              textureCount.get(Number(key))
            );

            this.blocksGroup?.add(mesh);

            mesh.instanceMatrix.needsUpdate = true;
            mesh.frustumCulled = false;

            return {
              ...prev,
              [key]: {
                mesh,
                prevMatrix: 0,
              },
            };
          }, {}),
        };
      },
      {}
    ) as BlocksIntancedMapping;

    let tmpPos: number[] = [];
    const lengthCached = arrayBlocksData.length;
    for (let index = 0; index < lengthCached; index++) {
      const num = arrayBlocksData[index];

      if (tmpPos.length === 3) {
        const blockPos = [...tmpPos];
        tmpPos = [];

        const key = nameFromCoordinate(blockPos[0], blockPos[1], blockPos[2]);

        const currentBlocksFaces = facesToRender[key];

        if (currentBlocksFaces)
          Object.keys(currentBlocksFaces).forEach((item) => {
            const faceKey = item as unknown as Face;
            const renderFace = currentBlocksFaces[faceKey];

            if (renderFace) {
              const faceAttr = this.calFaceAttr(Number(faceKey));

              const { rotation } = faceAttr;

              this.dummy.position.set(blockPos[0], blockPos[1], blockPos[2]);
              this.dummy.rotation.set(rotation[0], rotation[1], rotation[2]);
              this.dummy.updateMatrix();

              const currBlock = blocks[num as unknown as BlockKeys];
              const textureType = currBlock.textureMap[Number(faceKey)];

              const currInstanced =
                blockInstancedMapping[num as BlockKeys][textureType];

              currInstanced.mesh.setMatrixAt(
                currInstanced.prevMatrix,
                this.dummy.matrix
              );

              currInstanced.prevMatrix += 1;
            }
          });
      } else {
        tmpPos.push(num);
      }
    }

    Object.values(blockInstancedMapping).forEach((face) => {
      Object.values(face as BlocksIntancedType).forEach((item) => {
        //@ts-ignore
        const mesh = item.mesh;
        if (mesh) {
          mesh.instanceMatrix.needsUpdate = true;
        }
      });
    });
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
}

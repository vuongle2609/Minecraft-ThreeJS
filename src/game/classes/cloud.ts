import {
  BoxGeometry,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
} from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

export default class Cloud extends BaseEntity {
  dummy = new Object3D();

  count = 20;

  mesh = new InstancedMesh(
    new BoxGeometry(100, 3, 200),
    new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    }),
    this.count
  );

  constructor(props?: BasePropsType) {
    super(props);

    this.initialize();
  }

  initialize() {
    this.scene?.add(this.mesh);

    const preDefinedPos = [
      [-800, -500],
      [400, -800],
      [200, 0],
      [300, -400],
      [-600, 800],
      [-800, 900],
      [-100, 200],
      [-400, 400],
      [-500, 200],
      [-200, 400],
      [500, 1200],
      [100, -100],
      [0, 0],
      [100, 100],
      [-100, -100],
      [600, -200],
      [200, 600],
      [250, 300],
      [500, 500],
      [200, 800],
    ];

    preDefinedPos.forEach((_, i) => {
      this.dummy.position.set(preDefinedPos[i][0], 500, preDefinedPos[i][1]);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    });

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  update(playerPos: Vector3) {
    // if (playerPos) this.mesh.position.set(playerPos.x, 200, playerPos.z);
  }
}

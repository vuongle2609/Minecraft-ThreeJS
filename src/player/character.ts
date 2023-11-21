import BasicCharacterControllerInput from "@/action/input";
import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import { SPEED } from "@/constants/player";
import { CapsuleGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three";

export default class Player extends BaseEntity {
  player: Mesh;
  input = new BasicCharacterControllerInput();

  constructor(props: BasePropsType) {
    super(props);
    this.initialize();
  }

  initialize() {
    this.player = new Mesh(
      new CapsuleGeometry(1, 2),
      new MeshStandardMaterial({})
    );

    this.player.receiveShadow = true;
    this.player.castShadow = true;
    this.player.position.set(0, 2.1, 0);

    this.scene?.add(this.player);
  }

  handleMovement(delta: number) {
    const { keys } = this.input;

    const frontVector = new Vector3();

    const sideVector = new Vector3();

    if (keys.left) sideVector.x += 1;

    if (keys.right) sideVector.x -= 1;

    if (keys.forward) frontVector.z += 1;

    if (keys.backward) frontVector.z -= 1;

    const forwardVector = new Vector3();
    this.camera?.getWorldDirection(forwardVector);

    forwardVector.y = 0;
    forwardVector.normalize();

    const vectorUp = new Vector3(0, 1, 0);

    const vectorRight = vectorUp.clone().crossVectors(vectorUp, forwardVector);

    const moveVector = new Vector3().addVectors(
      forwardVector.clone().multiplyScalar(frontVector.z),
      vectorRight.multiplyScalar(sideVector.x)
    );

    moveVector.normalize().multiplyScalar(delta * SPEED);

    this.player.position.add(moveVector);
  }

  updateCamera() {
    const { x, y, z } = this.player.position;

    this.camera?.position.lerp(new Vector3(x, y + 1, z), 0.4);
  }

  update(delta: number) {
    this.handleMovement(delta);
    this.updateCamera();
  }
}

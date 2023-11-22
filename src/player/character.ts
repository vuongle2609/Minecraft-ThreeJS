import BasicCharacterControllerInput from "@/action/input";
import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import { SPEED } from "@/constants/player";
import { Body, Sphere, Vec3 } from "cannon-es";
import { CapsuleGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three";

export default class Player extends BaseEntity {
  player: Mesh;
  playerPhysicBody: Body;

  jumpVelocity = 10;
  canJump = true;

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

    const radius = 2;
    this.playerPhysicBody = new Body({
      mass: 5,
      shape: new Sphere(radius),
    });
    this.playerPhysicBody.position.set(0, 10, 0);
    this.world?.addBody(this.playerPhysicBody);

    const contactNormal = new Vec3();
    const upAxis = new Vec3(0, 1, 0);

    this.playerPhysicBody.addEventListener("collide", (e: any) => {
      const { contact } = e;

      if (contact.bi.id === this.playerPhysicBody.id) {
        contact.ni.negate(contactNormal);
      } else {
        contactNormal.copy(contact.ni);
      }

      if (contactNormal.dot(upAxis) > 0.5) {
        this.canJump = true;
      }
    });

    this.scene?.add(this.player);
  }

  handleMovement(delta: number) {
    const { keys } = this.input;

    const directionVector = new Vector3();

    if (keys.left) directionVector.x += 1;
    if (keys.right) directionVector.x -= 1;
    if (keys.forward) directionVector.z += 1;
    if (keys.backward) directionVector.z -= 1;

    if (keys.space && this.canJump) {
      this.canJump = false;
      this.playerPhysicBody.velocity.y = this.jumpVelocity;
    }

    const forwardVector = new Vector3();

    this.camera?.getWorldDirection(forwardVector);

    forwardVector.y = 0;
    forwardVector.normalize();

    const vectorUp = new Vector3(0, 1, 0);

    const vectorRight = vectorUp.clone().crossVectors(vectorUp, forwardVector);

    const moveVector = new Vector3().addVectors(
      forwardVector.clone().multiplyScalar(directionVector.z),
      vectorRight.multiplyScalar(directionVector.x)
    );

    moveVector.normalize().multiplyScalar(delta * SPEED);
    //https://www.cgtrader.com/free-3d-models/character/man/minecraft-steve-low-poly-rigged

    const { x, y, z } = moveVector;

    const vectorMoveConverted = this.playerPhysicBody.position.vadd(
      new Vec3(x, y, z)
    );

    this.playerPhysicBody.position.set(
      vectorMoveConverted.x,
      vectorMoveConverted.y,
      vectorMoveConverted.z
    );
  }

  updateCamera() {
    const { x, y, z } = this.player.position;

    //constant lerp and diff y
    this.camera?.position.lerp(new Vector3(x, y + 1, z), 0.4);
  }

  update(delta: number) {
    this.handleMovement(delta);
    this.updateCamera();

    const { x, y, z } = this.playerPhysicBody.position;
    this.player.position.copy(new Vector3(x, y, z));
  }
}

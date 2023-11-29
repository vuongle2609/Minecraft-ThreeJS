import BasicCharacterControllerInput from "@/action/input";
import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import { SPEED } from "@/constants/player";
import {
  Collider,
  KinematicCharacterController,
  RigidBody,
} from "@dimforge/rapier3d";
import { Body } from "cannon-es";
import { CapsuleGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three";

export default class Player extends BaseEntity {
  player: Mesh;
  playerPhysicBody: Body;

  jumpVelocity = 30;
  canJump = true;

  input = new BasicCharacterControllerInput();

  worldBodiesPositionsSend = new Float32Array(3);
  lines: any;

  originalVy = -20;
  vy = this.originalVy;

  characterBody: RigidBody;
  characterCollider: Collider;
  characterController: KinematicCharacterController;

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

    if (!this.physicsEngine) return;

    const RAPIER = this.physicsEngine.RAPIER;

    // init player
    const rigidBodyDesc = new RAPIER.RigidBodyDesc(
      RAPIER.RigidBodyType.KinematicPositionBased
    ).setTranslation(0, 20, 0);

    this.characterBody =
      this.physicsEngine.world.createRigidBody(rigidBodyDesc);

    const colliderDescCharacter = RAPIER.ColliderDesc.capsule(1, 1);
    this.characterCollider = this.physicsEngine.world.createCollider(
      colliderDescCharacter,
      this.characterBody
    );

    const offset = 0.01;
    this.characterController =
      this.physicsEngine.world.createCharacterController(offset);
    this.characterController.disableAutostep();
    this.characterController.setUp({ x: 0, y: 1, z: 0 });

    this.scene?.add(this.player);
  }

  handleMovement(delta: number) {
    const { keys } = this.input;

    const directionVector = new Vector3();

    if (keys.left) directionVector.x += 1;
    if (keys.right) directionVector.x -= 1;
    if (keys.forward) directionVector.z += 1;
    if (keys.backward) directionVector.z -= 1;

    if (keys.space) {
      this.canJump = false;
      this.vy = 20;
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

    this.characterController.computeColliderMovement(this.characterCollider, {
      x: moveVector.x,
      y: moveVector.y + this.vy * delta,
      z: moveVector.z,
    });

    if (this.vy > this.originalVy) {
      this.vy -= 1;
    }

    const correctMovement = this.characterController.computedMovement();

    const newPos = this.characterBody.translation();

    newPos.x += correctMovement.x;
    newPos.y += correctMovement.y;
    newPos.z += correctMovement.z;

    this.characterBody?.setNextKinematicTranslation(newPos);

    let { x, y, z } = this.characterBody.translation();

    this.player.position.set(x, y, z);
  }

  updateCamera() {
    const { x, y, z } = this.player.position;

    // for debug

    //constant lerp and diff y

    // this.camera?.lookAt(0, 0, 0);

    // this.camera?.position.set(10, 10, 10);

    this.camera?.position.copy(new Vector3(x, y + 2, z));
  }

  update(delta: number) {
    this.handleMovement(delta);
    this.updateCamera();
  }
}

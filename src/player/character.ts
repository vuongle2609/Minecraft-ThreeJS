import BasicCharacterControllerInput from "@/action/input";
import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import {
  GRAVITY,
  GRAVITY_SCALE,
  JUMP_FORCE,
  LERP_CAMERA_BREATH,
  SIN_X_MULTIPLY_LENGTH,
  SIN_Y_MULTIPLY_LENGTH,
  SPEED,
} from "@/constants/player";
import Physics from "@/physics/physics2";
import {
  Collider,
  KinematicCharacterController,
  RigidBody,
} from "@dimforge/rapier3d";
import { Body } from "cannon-es";
import {
  ArrowHelper,
  CapsuleGeometry,
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  Vector3,
} from "three";
import { lerp } from "three/src/math/MathUtils";

export default class Player extends BaseEntity {
  input = new BasicCharacterControllerInput();

  // render body
  player: Mesh;
  playerPhysicBody: Body;

  // physics body
  characterBody: RigidBody;
  characterCollider: Collider;
  characterController: KinematicCharacterController;

  // for jumping
  originalVy = -25;
  vy = this.originalVy;
  onGround = true;

  isWalk = false;

  tCounter = 0;
  cameraOffset = 0;

  raycaster = new Raycaster();

  physicsTest = new Physics({
    scene: this.scene,
  });

  constructor(props: BasePropsType) {
    super(props);
    this.initialize();
  }

  initialize() {
    // init player render
    this.player = new Mesh(
      new CapsuleGeometry(0.8, 2),
      new MeshStandardMaterial({})
    );

    this.player.receiveShadow = true;
    this.player.castShadow = true;

    if (!this.physicsEngine) return;

    const RAPIER = this.physicsEngine.RAPIER;

    // init player physics body
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

    this.raycaster.near = 0;
    this.raycaster.far = 2.3;

    this.scene?.add(this.player);
  }

  handleMovement(delta: number) {
    this.isWalk = false;

    const { keys } = this.input;

    const directionVector = new Vector3();

    if (keys.left) {
      this.isWalk = true;
      directionVector.x += 1;
    }
    if (keys.right) {
      this.isWalk = true;
      directionVector.x -= 1;
    }
    if (keys.forward) {
      this.isWalk = true;
      directionVector.z += 1;
    }
    if (keys.backward) {
      this.isWalk = true;
      directionVector.z -= 1;
    }

    if (keys.space && this.onGround) {
      this.onGround = false;
      this.vy = JUMP_FORCE;
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
      this.vy -= GRAVITY * GRAVITY_SCALE * delta;
    }

    const correctMovement = this.characterController.computedMovement();

    const a = this.physicsTest.calculateCorrectMovement(
      delta,
      this.player.position,
      new Vector3(moveVector.x, moveVector.y + this.vy * delta, moveVector.z)
    );

    const newPos = this.characterBody.translation();

    newPos.x += correctMovement.x;
    newPos.y += correctMovement.y;
    newPos.z += correctMovement.z;

    this.characterBody?.setNextKinematicTranslation(newPos);

    let { x, y, z } = this.characterBody.translation();

    this.player.position.set(x, y + 0.05, z);
  }

  trackingOnGround() {
    this.raycaster.set(this.player.position, new Vector3(0, -1, 0));

    const intersects = this.raycaster.intersectObjects(
      this.blockManager?.blocks || []
    );

    if (intersects[0]) {
      this.onGround = true;
    }
  }

  breathingEffect(delta: number) {
    this.tCounter += 1;

    // keo dai duong sin x bang cach chia cho 4
    // cho duong sin y ngan lai bang cach chia tat ca cho 2.5
    // de cho muot thi noi suy no voi offset truoc
    // 1/2.5 * sin(t * 1/4)

    if (this.onGround && this.isWalk) {
      this.cameraOffset =
        lerp(
          this.cameraOffset,
          Math.sin(this.tCounter * SIN_X_MULTIPLY_LENGTH) *
            SIN_Y_MULTIPLY_LENGTH,
          LERP_CAMERA_BREATH
        ) * delta;
    } else {
      this.cameraOffset = 0;
    }
  }

  updateCamera() {
    const { x, y, z } = this.player.position;

    // for debug

    //constant lerp and diff y

    // this.camera?.lookAt(0, 0, 0);

    // this.camera?.position.set(10, 10, 10);

    this.camera?.position.copy(new Vector3(x, y + 1.4 - this.cameraOffset, z));
  }

  update(delta: number, t: number) {
    this.handleMovement(delta);
    this.trackingOnGround();
    this.breathingEffect(delta);
    this.updateCamera();
  }
}

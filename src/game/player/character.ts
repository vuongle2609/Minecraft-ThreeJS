import { CHARACTER_MIDDLE_LENGTH, CHARACTER_RADIUS } from "@/constants/player";
import BasicCharacterControllerInput from "@/game/action/input";
import BaseEntity, { BasePropsType } from "@/game/classes/baseEntity";
import {
  CapsuleGeometry,
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  Vector3,
} from "three";

export default class Player extends BaseEntity {
  input = new BasicCharacterControllerInput();

  // render body
  player: Mesh;
  playerPhysicBody: Body;

  isWalk = false;

  tCounter = 0;
  cameraOffset = 0;

  raycaster = new Raycaster();

  constructor(props: BasePropsType) {
    super(props);
    this.initialize();
  }

  initialize() {
    // init player render
    this.player = new Mesh(
      new CapsuleGeometry(CHARACTER_RADIUS, CHARACTER_MIDDLE_LENGTH),
      new MeshStandardMaterial()
    );

    this.player.receiveShadow = true;
    this.player.castShadow = true;
    this.player.position.set(0, 10, 0);

    this.raycaster.near = 0;
    this.raycaster.far = 2.3;

    this.scene?.add(this.player);

    if (this.worker)
      this.worker.addEventListener("message", (e) => {
        if (e.data.type === "updatePosition")
          this.player.position.add(
            new Vector3(
              e.data.position[0],
              e.data.position[1],
              e.data.position[2]
            )
          );
      });
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

    // if (keys.space && this.onGround) {
    // this.onGround = false;
    // this.vy = JUMP_FORCE;
    // }

    if (keys.space) {
      this.worker?.postMessage({
        type: "jumpCharacter",
      });
    }

    const forwardVector = new Vector3();

    this.camera?.getWorldDirection(forwardVector);

    this.worker?.postMessage({
      type: "calculateMovement",
      data: {
        directionVectorArr: [
          directionVector.x,
          directionVector.y,
          directionVector.z,
        ],
        forwardVectorArr: [forwardVector.x, forwardVector.y, forwardVector.z],
        position: [
          this.player.position.x,
          this.player.position.y,
          this.player.position.z,
        ],
        delta,
      },
    });
  }

  trackingOnGround() {
    // this.raycaster.set(this.player.position, new Vector3(0, -1, 0));
    // const intersects = this.raycaster.intersectObjects(
    //   this.blockManager?.blocks || []
    // );
    // if (intersects[0]) {
    //   this.onGround = true;
    // }
  }

  breathingEffect(delta: number) {
    // this.tCounter += 1;
    // // keo dai duong sin x bang cach chia cho 4
    // // cho duong sin y ngan lai bang cach chia tat ca cho 2.5
    // // de cho muot thi noi suy no voi offset truoc
    // // 1/2.5 * sin(t * 1/4)
    // if (this.onGround && this.isWalk) {
    //   this.cameraOffset =
    //     lerp(
    //       this.cameraOffset,
    //       Math.sin(this.tCounter * SIN_X_MULTIPLY_LENGTH) *
    //         SIN_Y_MULTIPLY_LENGTH,
    //       LERP_CAMERA_BREATH
    //     ) * delta;
    // } else {
    //   this.cameraOffset = 0;
    // }
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

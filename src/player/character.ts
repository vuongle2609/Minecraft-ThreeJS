import BasicCharacterControllerInput from "@/action/input";
import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import { SPEED } from "@/constants/player";
import { Body } from "cannon-es";
import {
  BufferGeometry,
  CapsuleGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Vector3
} from "three";

export default class Player extends BaseEntity {
  player: Mesh;
  playerPhysicBody: Body;

  jumpVelocity = 30;
  canJump = true;

  input = new BasicCharacterControllerInput();

  worldBodiesPositionsSend = new Float32Array(3);
  lines: any;

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

    if (!this.lines) {
      let material = new LineBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
      });
      let geometry = new BufferGeometry();
      this.lines = new LineSegments(geometry, material);
      this.scene?.add(this.lines);
    }

    if (this.worker)
      this.worker.onmessage = (e) => {
        if (e.data === "done_jump") {
          this.canJump = true;
          return;
        }

        if (e.data?.ge === "a") {
          // this.lines.geometry.setAttribute(
          //   "position",
          //   new BufferAttribute(e.data.vertices, 3)
          // );
          // this.lines.geometry.setAttribute(
          //   "color",
          //   new BufferAttribute(e.data.colors, 4)
          // );

          return;
        }

        const [x, y, z] = e.data.position;

        this.player.position.copy(new Vector3(x, y, z));
      };

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
      this.worker?.postMessage({
        type: "handleJumpBody",
      });
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

    this.worldBodiesPositionsSend[0] = moveVector.x;
    this.worldBodiesPositionsSend[1] = 0;
    this.worldBodiesPositionsSend[2] = moveVector.z;

    this.worker?.postMessage({
      type: "getBodyProperties",
      payload: {
        position: this.worldBodiesPositionsSend,
        delta,
      },
    });
  }

  updateCamera() {
    const { x, y, z } = this.player.position;

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

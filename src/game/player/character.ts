import {
  Box3,
  Box3Helper,
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";

import blocks from "@/constants/blocks";
import { CHARACTER_LENGTH, CHARACTER_WIDTH } from "@/constants/player";
import BasicCharacterControllerInput from "@/game/action/input";
import BaseEntity, { BasePropsType } from "@/game/classes/baseEntity";
import { BlockKeys } from "@/type";
import { getChunkCoordinate } from "../helpers/chunkHelpers";
import { BLOCK_WIDTH } from "@/constants";
import { throttle } from "@/UI/utils/throttle";

export default class Player extends BaseEntity {
  input = new BasicCharacterControllerInput();

  // render body
  player: Mesh;

  isWalk = false;
  onGround = true;

  // for camera
  tCounter = 0;
  cameraOffset = 0;

  currentStepKey: BlockKeys | undefined = undefined;
  prevStepKey: BlockKeys | undefined = undefined;
  currentStepSound: HTMLAudioElement;

  currentChunk: {
    x: number;
    z: number;
  };
  currentChunkPhysics: {
    x: number;
    z: number;
  };

  constructor(props: BasePropsType) {
    super(props);
    this.initialize();
  }

  blockDebug = new Mesh(
    new BoxGeometry(BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH),
    new MeshStandardMaterial({
      wireframe: true,
      visible: true,
    })
  );
  debugCollider: any[] = [];

  initialize() {
    // init player render
    this.player = new Mesh(
      new BoxGeometry(CHARACTER_WIDTH, CHARACTER_LENGTH, CHARACTER_WIDTH),
      new MeshStandardMaterial()
    );
    this.player.visible = true;
    this.player.name = "player";

    this.scene?.add(this.player);

    this.handleDetectChunkChange();

    this.worker?.addEventListener("message", (e) => {
      if (e.data.type === "updatePosition") {
        const {
          position,
          onGround,
          collideObject,
          a,
          playerBoundingBox,
          roundedFuturePos,
        } = e.data.data;

        this.debugCollider.forEach((item) => this.scene?.remove(item));
        this.debugCollider = [];
        a.forEach(({ max, min }: { max: any; min: any }) => {
          const box = new Box3(
            new Vector3(min.x, min.y, min.z),
            new Vector3(max.x, max.y, max.z)
          );

          const helper = new Box3Helper(box, 0xffff00);
          this.scene?.add(helper);
          this.debugCollider.push(helper);
        });
        const box = new Box3(
          new Vector3(
            playerBoundingBox.min.x,
            playerBoundingBox.min.y,
            playerBoundingBox.min.z
          ),
          new Vector3(
            playerBoundingBox.max.x,
            playerBoundingBox.max.y,
            playerBoundingBox.max.z
          )
        );

        const helper = new Box3Helper(box, 0xffff00);
        this.scene?.add(helper);
        this.debugCollider.push(helper);
        if (roundedFuturePos) {
          //123
          const box1 = new Box3().setFromCenterAndSize(
            new Vector3(
              roundedFuturePos[0],
              roundedFuturePos[1],
              roundedFuturePos[2]
            ),
            new Vector3(BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH)
          );

          const helper1 = new Box3Helper(box1, 0x00ffff);
          this.scene?.add(helper1);
          this.debugCollider.push(helper1);
        }
        this.prevStepKey = this.currentStepKey;
        this.currentStepKey = collideObject;

        this.onGround = onGround;

        this.player.position.set(position[0], position[1], position[2]);

        this.handleDetectChunkChange();
      }
    });
  }

  handleDetectChunkChange = () => {
    const roundedPos = this.player.position.clone().round();

    const newCalChunk = getChunkCoordinate(roundedPos.x, roundedPos.z);

    if (
      newCalChunk.x != this.currentChunk?.x ||
      newCalChunk.z != this.currentChunk?.z
    ) {
      this.currentChunk = newCalChunk;

      this.chunkManager?.handleRequestChunks(this.currentChunk);
    } else if (!this.currentChunk) {
      this.currentChunk = getChunkCoordinate(roundedPos.x, roundedPos.z);

      this.chunkManager?.handleRequestChunks(this.currentChunk);
    } else {
      this.chunkManager?.validateChunk(this.currentChunk);
      this.chunkManager?.renderChunk();
    }
  };

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

  updateMovementSound() {
    if (this.currentStepSound && this.currentStepSound.paused && this.isWalk) {
      this.currentStepSound.play();
    }

    if ((!this.isWalk || !this.onGround) && this.currentStepSound) {
      this.currentStepSound.pause();
      this.currentStepSound.currentTime = 0;
    }

    if (this.currentStepKey && this.currentStepKey !== this.prevStepKey) {
      if (this.currentStepSound) {
        this.currentStepSound.pause();
        this.currentStepSound.currentTime = 0;
      }
      this.currentStepSound = blocks[this.currentStepKey].step;
    }
  }

  breathingEffect(delta: number) {
    this.tCounter += 1;
    // keo dai duong sin x bang cach chia cho 4
    // cho duong sin y ngan lai bang cach chia tat ca cho 2.5
    // de cho muot thi noi suy no voi offset truoc
    // 1/2.5 * sin(t * 1/4)
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

    this.camera?.position.copy(new Vector3(x, y + 1.4 - this.cameraOffset, z));
  }

  updateMovementThrootle = throttle(this.handleMovement.bind(this), 0);

  update(delta: number, t: number) {
    this.updateMovementThrootle(delta);
    // this.breathingEffect(delta);
    // this.updateMovementSound();
    this.updateCamera();
  }
}

import { BLOCK_WIDTH } from "@/constants";
import blocks from "@/constants/blocks";
import nameFromCoordinate from "@/game/helpers/nameFromCoordinate";
import { Mesh, PlaneGeometry, Vector2, Vector3 } from "three";
import { detailFromName } from "../helpers/detailFromName";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";
import InventoryManager from "./inventoryManager";

interface PropsType {
  inventoryManager: InventoryManager;
}

export default class BlockManager extends BaseEntity {
  inventoryManager: InventoryManager;

  currentPlaceSound: HTMLAudioElement;

  currentBreakSound: HTMLAudioElement;

  blocksMapping: Record<string, Record<string, Record<string, string>>> = {};
  blocksWorld: Record<string, keyof typeof blocks | 0> = {};

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.inventoryManager = props.inventoryManager;
    this.blocksWorld = props.worldStorage?.blocksMapping || {};
    // console.log("🚀 ~ BlockManager ~ constructor ~ this.blocksWorld:", this.blocksWorld)

    this.initialize();
  }

  async initialize() {
    document.addEventListener("mousedown", (e) => {
      this.onMouseDown(e);
    });

    if (this.worker)
      this.worker.addEventListener("message", (e) => {
        if (e.data.type === "renderBlocks") {
          const blocksRender: {
            position: number[];
            type: keyof typeof blocks;
          }[] = e.data.data.blocksRender;

          blocksRender.forEach(({ position, type }) => {
            this.updateBlock(position[0], position[1], position[2], type, true);
          });
        } else if (e.data.type === "removeBlocks") {
        }
      });
  }

  getObject(name: string) {
    return this.scene?.getObjectByName(name) as THREE.Object3D;
  }

  updateBlock(
    x: number,
    y: number,
    z: number,
    type: keyof typeof blocks,
    disableWorker?: boolean
  ) {
    if (disableWorker && this.blocksWorld[nameFromCoordinate(x, y, z)] == 0) {
      return;
    }

    if (!disableWorker) this.blocksWorld[nameFromCoordinate(x, y, z)] = type;

    const position = new Vector3(x, y, z);

    this.blocksMapping[position.x] = {
      ...this.blocksMapping[position.x],
      [position.y]: {
        ...this.blocksMapping[position.x]?.[position.y],
        [position.z]: type,
      },
    };

    new Block({
      position: position,
      scene: this.scene,
      type: type,
      blocksMapping: this.blocksMapping,
    });

    if (!disableWorker)
      this.worker?.postMessage({
        type: "addBlock",
        data: {
          position: [position.x, position.y, position.z],
          type: type,
        },
      });
  }

  removeBlock(x: number, y: number, z: number, type: string) {
    const halfWidth = BLOCK_WIDTH / 2;

    const geometry = new PlaneGeometry(BLOCK_WIDTH, BLOCK_WIDTH);

    for (let i = 0; i < 6; i++) {
      this.scene?.remove(this.getObject(nameFromCoordinate(x, y, z, type, i)));
    }

    const leftZBlock = this.blocksMapping[x]?.[y]?.[z + BLOCK_WIDTH];
    if (leftZBlock) {
      const plane = new Mesh(
        geometry,
        blocks[leftZBlock as keyof typeof blocks].texture[1]
      );
      plane.position.set(x, y, z + BLOCK_WIDTH - halfWidth);
      plane.rotation.set(0, Math.PI, 0);
      plane.name = nameFromCoordinate(x, y, z + BLOCK_WIDTH, leftZBlock, 1);
      this.scene?.add(plane);
    }

    const rightZBlock = this.blocksMapping[x]?.[y]?.[z - BLOCK_WIDTH];
    if (rightZBlock) {
      const plane = new Mesh(
        geometry,
        blocks[rightZBlock as keyof typeof blocks].texture[0]
      );
      plane.position.set(x, y, z - BLOCK_WIDTH + halfWidth);
      plane.name = nameFromCoordinate(x, y, z - BLOCK_WIDTH, rightZBlock, 0);
      this.scene?.add(plane);
    }

    const leftXBlock = this.blocksMapping[x + BLOCK_WIDTH]?.[y]?.[z];
    if (leftXBlock) {
      const plane = new Mesh(
        geometry,
        blocks[leftXBlock as keyof typeof blocks].texture[5]
      );
      plane.position.set(x + BLOCK_WIDTH - halfWidth, y, z);
      plane.rotation.set(0, -Math.PI / 2, 0);
      plane.name = nameFromCoordinate(x + BLOCK_WIDTH, y, z, leftXBlock, 3);
      this.scene?.add(plane);
    }

    const rightXBlock = this.blocksMapping[x - BLOCK_WIDTH]?.[y]?.[z];
    if (rightXBlock) {
      const plane = new Mesh(
        geometry,
        blocks[rightXBlock as keyof typeof blocks].texture[4]
      );
      plane.position.set(x - BLOCK_WIDTH + halfWidth, y, z);
      plane.rotation.set(0, Math.PI / 2, 0);
      plane.name = nameFromCoordinate(x - BLOCK_WIDTH, y, z, rightXBlock, 2);
      this.scene?.add(plane);
    }

    const topBlock = this.blocksMapping[x]?.[y + BLOCK_WIDTH]?.[z];
    if (topBlock) {
      const plane = new Mesh(
        geometry,
        blocks[topBlock as keyof typeof blocks].texture[3]
      );
      plane.position.set(x, y + BLOCK_WIDTH - halfWidth, z);
      plane.rotation.set(Math.PI / 2, 0, 0);
      plane.name = nameFromCoordinate(x, y + BLOCK_WIDTH, z, topBlock, 5);
      this.scene?.add(plane);
    }

    const bottomBlock = this.blocksMapping[x]?.[y - BLOCK_WIDTH]?.[z];
    if (bottomBlock) {
      const plane = new Mesh(
        geometry,
        blocks[bottomBlock as keyof typeof blocks].texture[2]
      );
      plane.position.set(x, y - BLOCK_WIDTH + halfWidth, z);
      plane.rotation.set(-Math.PI / 2, 0, 0);
      plane.name = nameFromCoordinate(x, y - BLOCK_WIDTH, z, bottomBlock, 4);
      this.scene?.add(plane);
    }

    this.blocksWorld[nameFromCoordinate(x, y, z)] = 0;
  }

  onMouseDown(e: MouseEvent) {
    switch (e.button) {
      case 0:
        // left click
        this.handleBreakBlock();
        break;
      case 1:
        // middle click
        this.handleGetBlock();
        break;
      case 2:
        // right click
        this.handlePlaceBlock();
    }
  }

  handleHoverBlock() {}

  handleGetBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene || !this.control?.isLocked) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12) return;

    const clickedDetail = detailFromName(intersects[0].object.name);

    const { type } = clickedDetail;

    this.inventoryManager.inventory[this.inventoryManager.currentFocusIndex] =
      type as keyof typeof blocks;
    this.inventoryManager.renderHotbar();
    if (this.inventoryManager.currentFocus)
      this.inventoryManager.renderLabelFocusItem(
        blocks[this.inventoryManager.currentFocus].name
      );
  }

  handleBreakBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene || !this.control?.isLocked) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12) return;

    const clickedDetail = detailFromName(intersects[0].object.name);

    const { x, y, z, type } = clickedDetail;

    this.removeBlock(x, y, z, type);

    // play sound
    if (this.currentBreakSound) {
      this.currentBreakSound.pause();
      this.currentBreakSound.currentTime = 0;
    }

    this.currentBreakSound = blocks[type as keyof typeof blocks].break;

    this.currentBreakSound.play();

    delete this.blocksMapping[x][y][z];

    this.removeBlockWorker({
      position: [x, y, z],
    });
  }

  handlePlaceBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene || !this.control?.isLocked) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12) return;

    const clickedDetail = detailFromName(intersects[0].object.name);

    const clickedFace = clickedDetail.face;

    const { x, y, z } = clickedDetail;

    const blockPosition = new Vector3();

    switch (clickedFace) {
      case "2":
        blockPosition.set(x + 2, y, z);
        break;
      case "3":
        blockPosition.set(x - 2, y, z);
        break;
      case "4":
        blockPosition.set(x, y + 2, z);
        break;
      case "5":
        blockPosition.set(x, y - 2, z);
        break;
      case "0":
        blockPosition.set(x, y, z + 2);
        break;
      case "1":
        blockPosition.set(x, y, z - 2);
        break;
    }

    if (this.inventoryManager.currentFocus) {
      this.updateBlock(
        blockPosition.x,
        blockPosition.y,
        blockPosition.z,
        this.inventoryManager.currentFocus
      );

      // play sound

      if (this.currentPlaceSound) {
        this.currentPlaceSound.pause();
        this.currentPlaceSound.currentTime = 0;
      }

      this.currentPlaceSound = blocks[this.inventoryManager.currentFocus].place;

      this.currentPlaceSound.play();
    }
  }

  removeBlockWorker({ position }: { position: number[] }) {
    this.worker?.postMessage({
      type: "removeBlock",
      data: {
        position,
      },
    });
  }

  updateBlockWorker({ position, type }: { position: number[]; type: string }) {
    this.worker?.postMessage({
      type: "addBlock",
      data: {
        position,
        type,
      },
    });
  }

  update() {
    this.handleHoverBlock();
  }
}

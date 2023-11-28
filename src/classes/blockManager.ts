import blocks from "@/constants/blocks";
import {
  BoxGeometry,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3DEventMap,
  Vector2,
  Vector3
} from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";
import InventoryManager from "./inventoryManager";
import Terrant from "./terrant";

interface PropsType {
  inventoryManager: InventoryManager;
}

export default class BlockManager extends BaseEntity {
  inventoryManager: InventoryManager;

  prevHoverBlockHex: number | null = null;
  prevHoverBlock: Mesh<
    BoxGeometry,
    MeshStandardMaterial[],
    Object3DEventMap
  > | null = null;

  geometryBlock = new BoxGeometry(2, 2, 2);
  blocks: InstancedMesh<BoxGeometry, MeshStandardMaterial[]>[] = [];

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.inventoryManager = props.inventoryManager;

    this.initialize();
  }

  async initialize() {
   

    const placeBlock = blocks["grass"];

    const textures = placeBlock.texture;

    document.addEventListener("mousedown", (e) => {
      this.onMouseDown(e);
    });
  }

  onMouseDown(e: MouseEvent) {
    switch (e.button) {
      case 0:
        // left click
        this.handleBreakBlock();
        break;
      case 2:
        // right click
        this.handlePlaceBlock();
    }
  }

  handleHoverBlock() {
    // const { raycaster } = this.mouseControl! || {};
    // if (!this.camera || !this.scene) return;
    // raycaster.setFromCamera(new Vector2(), this.camera);
    // const intersects = raycaster.intersectObjects(this.scene.children, false);
    // if (intersects[0]?.distance > 12) return;
    // const object = intersects[0]?.object as Mesh<
    //   BoxGeometry,
    //   MeshStandardMaterial[],
    //   Object3DEventMap
    // >;
    // if (this.prevHoverBlock?.material?.length) {
    //   this.prevHoverBlock.material = this.prevHoverBlock.material.map(
    //     (item) => {
    //       item.emissive.setHex(this.prevHoverBlockHex as number);
    //       return item;
    //     }
    //   );
    // }
    // if (!object) return;
    // if (object.material?.length)
    //   object.material = object.material.map((item) => {
    //     this.prevHoverBlockHex = item.emissive.getHex();
    //     // random hex for block lighter
    //     item.emissive.setHex(0x6e6e6e50);
    //     return item;
    //   });
    // this.prevHoverBlock = object;
  }

  handleBreakBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12) return;

    for (let i = 0; i < intersects.length; i++) {
      // console.log("break block", intersects[i].object);
    }
  }
  // in = 2;
  handlePlaceBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects[0]?.distance > 12) return;

    const clickedFace = Math.floor((intersects[0].faceIndex ?? 2) / 2);

    const { x, y, z }: any = intersects[0].object.position;

    const blockPosition = new Vector3();

    switch (clickedFace) {
      case 0:
        blockPosition.set(x + 2, y, z);
        break;
      case 1:
        blockPosition.set(x - 2, y, z);
        break;
      case 2:
        blockPosition.set(x, y + 2, z);
        break;
      case 3:
        blockPosition.set(x, y - 2, z);
        break;
      case 4:
        blockPosition.set(x, y, z + 2);
        break;
      case 5:
        blockPosition.set(x, y, z - 2);
        break;
    }

    if (this.inventoryManager.currentFocus)
      new Block({
        position: blockPosition,
        scene: this.scene,
        type: this.inventoryManager.currentFocus,
        worker: this.worker,
      });
    // for (let i = -10; i < 10; i++) {
    //   for (let j = -10; j < 10; j++) {
    //     if (this.inventoryManager.currentFocus)
    //       new Block({
    //         position: new Vector3(i * 2, this.in, j * 2),
    //         scene: this.scene,
    //         type: this.inventoryManager.currentFocus,
    //         worker: this.worker,
    //         geometryBlock: this.geometryBlock,
    //       });
    //   }
    // }
    // this.in += 2;
  }

  update() {
    this.handleHoverBlock();
  }
}

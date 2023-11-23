import {
  BoxGeometry,
  Mesh,
  Vector3,
  Object3DEventMap,
  MeshStandardMaterial,
  Vector2,
} from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";
import InventoryManager from "./inventoryManager";

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

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.inventoryManager = props.inventoryManager;

    this.initialize();
  }

  initialize() {
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
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    const object = intersects[0]?.object as Mesh<
      BoxGeometry,
      MeshStandardMaterial[],
      Object3DEventMap
    >;

    if (this.prevHoverBlock?.material?.length) {
      this.prevHoverBlock.material = this.prevHoverBlock.material.map(
        (item) => {
          item.emissive.setHex(this.prevHoverBlockHex as number);

          return item;
        }
      );
    }

    if (!object) return;

    if (object.material?.length)
      object.material = object.material.map((item) => {
        this.prevHoverBlockHex = item.emissive.getHex();
        // random hex for block lighter
        item.emissive.setHex(0x6e6e6e50);

        return item;
      });

    this.prevHoverBlock = object;
  }

  handleBreakBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

    for (let i = 0; i < intersects.length; i++) {
      // console.log("break block", intersects[i].object);
    }
  }

  handlePlaceBlock() {
    const { raycaster } = this.mouseControl! || {};

    if (!this.camera || !this.scene) return;

    raycaster.setFromCamera(new Vector2(), this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, false);

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
  }

  update() {
    this.handleHoverBlock();
  }
}

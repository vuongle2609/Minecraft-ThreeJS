import { ContactMaterial, Material } from "cannon-es";
import { Vector3 } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";
import Block from "./block";

export default class Terrant extends BaseEntity {
  constructor(props: BasePropsType) {
    super(props);
    this.initialize();
  }

  async initialize() {
    const physicsMaterial = new Material("physics");
    const humanMaterial = new Material("human");
    const physics_physics = new ContactMaterial(
      physicsMaterial,
      humanMaterial,
      {
        friction: 0,
        restitution: 0,
      }
    );

    for (let i = -3; i < 3; i++) {
      for (let j = -3; j < 3; j++) {
        new Block({
          position: new Vector3(i * 2, 0, j * 2),
          scene: this.scene,
          world: this.world,
          type: "oak_planks",
        });
      }
    }

    this.world?.addContactMaterial(physics_physics);
  }
}

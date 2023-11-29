import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import RAPIER from "@dimforge/rapier3d";

export default class PhysicsEngine extends BaseEntity {
  gravity = { x: 0.0, y: -9.81, z: 0.0 };

  RAPIER = RAPIER;

  world: RAPIER.World;

  constructor(props: BasePropsType) {
    super(props);
  }

  async initialize() {
    return new Promise<void>((resolve) => {
      import("@dimforge/rapier3d").then((RAPIER) => {
        resolve();

        this.world = new RAPIER.World(this.gravity);

        this.RAPIER = RAPIER;
      });
    });
  }

  update() {
    this.world.step();
  }
}

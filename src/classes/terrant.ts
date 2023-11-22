import {
  Material,
  Mesh,
  MeshStandardMaterial,
  Plane,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader,
} from "three";
import grassImage from "../assets/grass.png";
import BaseEntity, { BasePropsType } from "./baseEntity";
import { ContactMaterial, Body, Plane as PlaneCannon } from "cannon-es";

export default class Terrant extends BaseEntity {
  constructor(props: BasePropsType) {
    super(props);
    this.initialize();
  }

  async initialize() {
    const loader = new TextureLoader();

    const texture = await loader.loadAsync(grassImage, console.log);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(100, 100);

    const plane = new Mesh(
      new PlaneGeometry(200, 200),
      new MeshStandardMaterial({
        color: 0xf0f0f0,
        map: texture,
      })
    );

    plane.receiveShadow = true;
    plane.position.set(0, 0, 0);
    plane.rotation.x = -Math.PI / 2;

    const groundBody = new Body({
      type: Body.STATIC,
      shape: new PlaneCannon(),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world?.addBody(groundBody);

    this.scene?.add(plane);
  }
}

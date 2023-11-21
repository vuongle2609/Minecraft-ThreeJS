import {
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader,
} from "three";
import { gameScene } from "../main";
import grassImage from "../assets/grass.png";

export default class Terrant {
  constructor() {
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

    plane.position.set(0, 0, 0);
    plane.rotation.x = -Math.PI / 2;

    gameScene.scene.add(plane);
  }
}

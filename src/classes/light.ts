import { AmbientLight, CameraHelper, DirectionalLight } from "three";
import { gameScene } from "../main";

export default class Light {
  constructor() {
    this.initial();
  }

  initial() {
    const directionalLight = new DirectionalLight(0xfffbd4, 1);

    directionalLight.intensity = 4;
    directionalLight.position.set(10, 100, 100);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;

    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.mapSize.set(4096, 4096);

    const directionalLightHelper = new CameraHelper(
      directionalLight.shadow.camera
    );
    // gameScene.scene.add(directionalLightHelper);

    gameScene.scene.add(directionalLight);

    const ambientLight = new AmbientLight(0xffffff, 1);
    gameScene.scene.add(ambientLight);
  }
}

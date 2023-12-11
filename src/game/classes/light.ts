import { AmbientLight, DirectionalLight } from "three";
import BaseEntity, { BasePropsType } from "./baseEntity";

export default class Light extends BaseEntity {
  constructor(props: BasePropsType) {
    super(props);
    this.initial();
  }

  initial() {
    const directionalLight = new DirectionalLight(0xfffbd4, 1);

    directionalLight.intensity = 0.8;
    directionalLight.position.set(100, 1000, 1000);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = false;

    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.mapSize.set(4096, 4096);

    // const directionalLightHelper = new CameraHelper(
    //   directionalLight.shadow.camera
    // );
    // this.scene?.add(directionalLightHelper);

    this.scene?.add(directionalLight);

    const ambientLight = new AmbientLight(0x404040);
    this.scene?.add(ambientLight);
  }
}

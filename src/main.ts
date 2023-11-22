import { gameScene } from "./classes/gameScene";
import "./style.css";
import { Cache } from "three";

Cache.enabled = true

class Three {
  gameScene = gameScene;

  constructor() {
    this.initialize();
  }

  initialize() {
    this.gameScene.afterRender();
  }
}

const app = new Three();

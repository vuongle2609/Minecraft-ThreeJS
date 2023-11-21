import { gameScene } from "./classes/gameScene";
import "./style.css";

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

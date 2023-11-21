import MouseControl from "./action/mouseControl";
import Light from "./classes/light";
import Terrant from "./classes/terrant";
import GameScene from "./gameScene";
import "./style.css";

class Three {
  gameScene = new GameScene();

  constructor() {
    this.initialize();
  }

  initialize() {
    this.gameScene.afterRender();

    setTimeout(() => {
      new MouseControl();
      new Terrant();
      new Light();
    }, 200);
  }
}

const app = new Three();
export const gameScene = app.gameScene;

import MouseControl from "./action/mouseControl";
import Light from "./classes/light";
import Terrant from "./classes/terrant";
import { gameScene } from "./gameScene";
import Player from "./player/character";
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

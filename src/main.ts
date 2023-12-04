import { Cache } from "three";
import GameScene from "./classes/gameScene";
import "./style.css";

Cache.enabled = true;

class Three {
  gameScene: GameScene;

  constructor() {
    this.initialize();
  }

  async initialize() {
    this.gameScene = new GameScene();
  }
}

const app = new Three();

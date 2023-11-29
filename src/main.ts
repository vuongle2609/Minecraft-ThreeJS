import GameScene from "./classes/gameScene";
import PhysicsEngine from "./physics";
import "./style.css";
import { Cache } from "three";

Cache.enabled = true;

class Three {
  gameScene: GameScene;

  constructor() {
    this.initialize();
  }

  async initialize() {
    const physicsEngine = new PhysicsEngine({});

    await physicsEngine.initialize()

    this.gameScene = new GameScene(physicsEngine);
  }
}

const app = new Three();

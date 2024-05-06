import './style.css';

import { Cache } from 'three';

import GameScene from './game/classes/gameScene';
import UI from './UI';

Cache.enabled = true;

class Three {
  gameScene: GameScene;
  ui = new UI()

  constructor() {
    this.initialize();
  }

  async initialize() {
    // this.gameScene = new GameScene();
  }
}

const app = new Three();

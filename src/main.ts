import { Cache } from "three";
import GameScene from "./game/classes/gameScene";
import "./style.css";
import UI from "./UI";

Cache.enabled = true;

class Three {
  gameScene: GameScene;
  ui = new UI();
}

const app = new Three();

import MainScreen from "../pages/mainScreen";
import CreateWorld from "../pages/createWorld";
import SelectWorld from "../pages/selectWorld";
import GameRender from "../pages/gameRender";
import SoundManager from "@/game/classes/soundManager";
import InitScreen from "../pages/initScreen";

export default class Router {
  soundManager: SoundManager;

  routes = {
    mainScreen: new MainScreen(this),
    createWorld: new CreateWorld(this),
    selectWorld: new SelectWorld(this),
    gameRender: new GameRender(this),
    initScreen: new InitScreen(this),
  };

  constructor(soundManager: SoundManager) {
    this.soundManager = soundManager;
  }

  navigate(path: keyof typeof this.routes) {
    this.routes[path].render();

    this.soundManager.addButtonClick();
  }
}

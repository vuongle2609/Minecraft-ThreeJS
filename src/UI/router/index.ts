import CreateWorld from "@/UI/pages/createWorld";
import EditWorld from "@/UI/pages/editWorld";
import GameRender from "@/UI/pages/gameRender";
import InitScreen from "@/UI/pages/initScreen";
import MainScreen from "@/UI/pages/mainScreen";
import SelectWorld from "@/UI/pages/selectWorld";
import SoundManager from "@/game/classes/soundManager";

export default class Router {
  soundManager: SoundManager;

  routes = {
    mainScreen: new MainScreen(this),
    createWorld: new CreateWorld(this),
    selectWorld: new SelectWorld(this),
    gameRender: new GameRender(this),
    initScreen: new InitScreen(this),
    editWorld: new EditWorld(this),
  };

  constructor(soundManager: SoundManager) {
    this.soundManager = soundManager;
  }

  navigate<T>(path: keyof typeof this.routes, state?: T) {
    this.routes[path].render<T>(state);

    this.soundManager.addButtonClick();
  }
}

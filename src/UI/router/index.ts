import MainScreen from "../pages/mainScreen";
import CreateWorld from "../pages/createWorld";
import SelectWorld from "../pages/selectWorld";
import GameRender from "../pages/gameRender";

export default class Router {
  routes = {
    mainScreen: new MainScreen(this),
    createWorld: new CreateWorld(this),
    selectWorld: new SelectWorld(this),
    gameRender: new GameRender(this),
  };

  navigate(path: keyof typeof this.routes) {
    this.routes[path].render();
  }
}

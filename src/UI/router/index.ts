import MainScreen from "@/UI/pages/mainScreen";
import CreateWorld from "@/UI/pages/createWorld";
import SelectWorld from "@/UI/pages/selectWorld";
import GameRender from "@/UI/pages/gameRender";

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

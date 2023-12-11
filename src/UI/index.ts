import SoundManager from "@/game/classes/soundManager";
import Router from "./router";

export default class UI {
  soundManager = new SoundManager()
  router = new Router(this.soundManager);

  constructor() {
    this.initialize();
  }

  initialize() {
    this.router.navigate("initScreen");
  }
}
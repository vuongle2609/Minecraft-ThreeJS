import Router from "./router";

export default class UI {
  router = new Router();

  constructor() {
    this.initialize();
  }

  initialize() {
    this.router.navigate("mainScreen");
  }
}

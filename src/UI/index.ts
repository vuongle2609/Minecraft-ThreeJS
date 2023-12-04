import { createActor, createMachine } from "xstate";
import MainScreen from "./mainScreen";

export default class UI {
  mainScreen = new MainScreen();

  uiMachine = createMachine({
    context: {
      count: 0,
    },
    on: {
      HOME: {
        actions: () => {
          this.mainScreen.render();
        },
      },
    },
  });

  uiActor = createActor(this.uiMachine).start();

  constructor() {
    this.initialize();
  }

  initialize() {
    this.uiActor.send({ type: "HOME" });
  }
}

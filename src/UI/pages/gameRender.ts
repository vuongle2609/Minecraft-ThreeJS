import { RenderPage } from "@/game/classes/renderPage";
import Router from "../router";
import { $ } from "../utils/selector";
import GameScene from "@/game/classes/gameScene";

export default class GameRender extends RenderPage {
  router: Router;
  gameScene: GameScene;

  constructor(router: Router) {
    super();

    this.router = router;
  }

  element = String.raw` 
      <div id="modal_focus" class="fixed top-0 bottom-0 left-0 right-0 items-center justify-center bg-gray-900/70 flex flex-col">
        <div class="flex flex-col w-full h-full items-center justify-center px-[200px] gap-4">
          <h2 class="text-white text-lg">Game Menu</h2>

          <button class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full max-w-[500px]" id="focus">Back To Game</button>

          <button class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full max-w-[500px]" id="quit">Save and Quit to Title</button>
        </div>
      </div>

      <div id="modal_game" class="fixed top-0 bottom-0 left-0 right-0 items-center justify-center">
        <div class="text-white font-medium fixed top-2 left-2">
          <span id="coordinate"></span>
          <br/>
          <span id="fps"></span>
        </div>

        <div class="relative shadow-md">
          <div class="w-1 h-5 bg-gray-500 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"></div>
          <div class="w-5 h-1 bg-gray-500 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"></div>
        </div>

        <div id="itemLabel" class="fixed opacity-0 text-white bottom-20 text-xl transition-all duration-300 drop-shadow-md"></div>

        <div class="fixed bottom-1 bg-gray-900/60 border-4 border-solid border-black rounded-md">
          <div class="border-4 border-solid border-gray-300 flex" id="inventory_container">
          </div>
        </div>
      </div>

      <canvas
        id="gameScene"
        class="fixed top-0 bottom-0 left-0 right-0 w-full h-full -z-10"
      ></canvas>
    `;

  render() {
    super.render();
  }

  afterRender = () => {
    this.gameScene = new GameScene();

    $("#quit").onclick = () => {
      $("#gameScene").remove();

      this.gameScene.disposeRender()

      this.router.navigate("mainScreen");
    };
  };
}

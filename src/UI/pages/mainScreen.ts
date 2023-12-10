import { RenderPage } from "@/game/classes/renderPage";
import Router from "../router";
import { $ } from "../utils/selector";

export default class MainScreen extends RenderPage {
  router: Router;

  constructor(router: Router) {
    super();

    this.router = router;
  }

  element = String.raw`
      <div
        class="w-full h-full items-center justify-center bg-cover flex flex-col"
        style="background-image: url('/assets/home/bg.jpg')"
      >
        <div
          class="flex flex-col w-full h-full backdrop-blur-md items-center justify-center px-[200px]"
        >
          <img
            src="/assets/home/minecraft_logo_main.png"
            class="max-w-[800px] w-full mb-20"
          />

          <div class="w-full flex flex-col gap-4">
            <button
              class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full"
              id="singleplayer"
            >
              Singleplayer
            </button>

            <button
              class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full"
              id="multiplayer"
            >
              Multiplayer
            </button>
          </div>

          <div class="w-full flex gap-4 mt-10">
            <button
              class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full"
            >
              Options...
            </button>

            <button
              class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full"
            >
              Github
            </button>
          </div>

        </div>
      </div>
    `;

  render() {
    super.render();
  }

  afterRender = () => {
    $("#singleplayer").onclick = () => {
      this.router.navigate("selectWorld");
    };

    this.router.soundManager.changeActiveTheme("mainScreen");
  };
}

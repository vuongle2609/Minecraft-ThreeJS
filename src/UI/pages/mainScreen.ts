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
          <div class="w-screen mb-auto"></div>

          <img
            src="/assets/home/minecraft_logo_main.png"
            class="max-w-[800px] w-full mb-20"
          />

          <div class="w-full flex flex-col gap-4">
            <button
              class="mc-button"
              id="singleplayer"
            >
              <div class="title">Singleplayer</div>
            </button>

            <button
              class="mc-button"
              id="multiplayer"
            >
              <div class="title">Multiplayer</div>
            </button>
          </div>

          <div class="w-full flex gap-4 mt-10">
            <button
              class="mc-button"
            >
              <div class="title">Options...</div>
            </button>

            <button
              class="mc-button"
              id="github"
            >
              <div class="title">Github</div>
            </button>
          </div>

          <div class="w-screen mt-auto flex justify-between px-2 py-1">
            <span class="text-white text-lg">Minecraft threejs</span>
            <span class="text-white text-lg">Copyright Mojang AB</span>
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

    $("#github").onclick = () => {
      window.open('https://github.com/vuongle2609/Minecraft')
    };

    // https://github.com/vuongle2609/Minecraft

    this.router.soundManager.changeActiveTheme("mainScreen");
  };
}

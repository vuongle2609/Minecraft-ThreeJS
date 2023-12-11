import { RenderPage } from "@/game/classes/renderPage";
import Router from "../router";
import { $ } from "../utils/selector";

export default class SelectWorld extends RenderPage {
  router: Router;

  constructor(router: Router) {
    super();

    this.router = router;
  }

  element = String.raw`
      <div
        class="w-full h-full items-center justify-center bg-cover flex flex-col"
        style="background-image: url('/assets/home/dirt_background.webp')"
      >
        <div
          class="flex flex-col w-full h-full items-center justify-center px-[100px] py-[10px] gap-4"
        >
          <h2 class="text-white text-lg">Select world</h2>

          <div class="w-full flex flex-col items-start max-w-[400px]">
            <input id="world_name" class="text-white text-lg bg-black p-3 py-2 outline-none border-2 border-solid border-white w-full"/>
          </div>

          <div class="w-full flex gap-3 text-white">
           asdasdasdasdasd
          </div>

          <div class="w-full flex flex-col gap-2 mt-auto">
            <div class="w-full flex gap-3">
                <button
                    class="mc-button"
                    id="play"
                >
                  <div class="title">Play Selected World</div>
                </button>

                <button
                    class="mc-button"
                    id="create"
                >
                <div class="title">Create New World</div>
                </button>
            </div>

            <div class="w-full flex gap-3">
                <button
                    class="mc-button"
                >
                  <div class="title">Edit</div>
                </button>

                <button
                    class="mc-button"
                >
                  <div class="title">Delete</div>
                </button>

                <button
                    class="mc-button"
                >
                  <div class="title">Re-Create</div>
                </button>

                <button
                    class="mc-button"
                    id="cancel"
                >
                  <div class="title">Cancel</div>
                </button>
            </div>
          </div>
        </div>
      </div>
    `;

  render() {
    super.render();
  }

  afterRender = () => {
    $("#play").onclick = () => {
      this.router.navigate("gameRender");
    };

    $("#cancel").onclick = () => {
      this.router.navigate("mainScreen");
    };

    $("#create").onclick = () => {
      this.router.navigate("createWorld");
    };
  };
}

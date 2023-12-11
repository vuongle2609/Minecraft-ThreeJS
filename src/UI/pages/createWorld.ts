import { RenderPage } from "@/game/classes/renderPage";
import Router from "../router";
import { $ } from "../utils/selector";

export default class CreateWorld extends RenderPage {
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
          class="flex flex-col w-full h-full items-center justify-center px-[200px] py-[100px] gap-8"
        >
          <h2 class="text-white text-lg">Create New World</h2>

          <div class="w-full flex flex-col items-start max-w-[400px]">
            <label for="world_name" class="text-left text-gameGray">World Name</label>
            <input id="world_name" class="text-white text-lg bg-black p-3 py-2 outline-none border-2 border-solid border-white w-full"/>
          </div>

          <div class="w-full flex gap-3">
            <button
              class="mc-button"
            >
              <div class="title">
                Game Mode: Creative?
              </div>
            </button>

            <button
              class="mc-button"
            >
              <div class="title">
                World Type: Superflat
              </div>
            </button>
          </div>

          <div class="w-full flex gap-3 mt-auto">
            <button
              class="mc-button"
            >
              <div class="title">
                Create New World
              </div>
            </button>

            <button
              class="mc-button"
              id="cancel"
            >
              <div class="title">
                Cancel
              </div>
            </button>
          </div>
        </div>
      </div>
    `;

  render() {
    super.render();
  }

  afterRender = () => {
    $("#cancel").onclick = () => {
      this.router.navigate("selectWorld");
    };
  };
}
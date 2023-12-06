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
              class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full"
            >
              Game Mode: Creative
            </button>

            <button
              class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full"
            >
              World Type: Superflat
            </button>
          </div>

          <div class="w-full flex gap-3 mt-auto">
            <button
              class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full"
            >
              Create New World
            </button>

            <button
              class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full"
              id="cancel"
            >
              Cancel
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

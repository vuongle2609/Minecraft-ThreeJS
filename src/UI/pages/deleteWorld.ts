import { RenderPage } from "@/game/classes/renderPage";
import { WorldsType } from "@/type";

import Router from "../router";
import { $ } from "../utils/selector";

export default class DeleteWorld extends RenderPage {
  router: Router;
  id: string;

  constructor(router: Router) {
    super();

    this.router = router;
  }

  element = String.raw`
      <div class="w-full h-full items-center justify-center bg-cover flex flex-col"
        style="background-image: url('/assets/home/dirt_background.webp')">
        <div class="flex flex-col w-full h-full items-center justify-center px-[200px] py-[100px] gap-8 max-h-[60%]">
          <h2 class="text-white text-lg">Are you sure you want to delete this world? <br> 'New World' will be lost
            forever! (A long time!)</h2>

          <div class="w-full flex gap-3 mt-auto">
            <button class="mc-button" id="delete">
              <div class="title">
                Delete
              </div>
            </button>

            <button class="mc-button" id="cancel">
              <div class="title">
                Cancel
              </div>
            </button>
          </div>
        </div>
      </div>
    `;

  render<T>(state?: T) {
    this.id = state as string;
    super.render();
  }

  deleteWorld() {
    const worlds: Record<string, WorldsType> = JSON.parse(
      localStorage.getItem("worlds") || "{}"
    );

    delete worlds[this.id];

    localStorage.setItem("worlds", JSON.stringify(worlds));
  }

  afterRender = () => {
    $("#cancel").onclick = () => {
      this.router.navigate("selectWorld");
    };

    $("#delete").onclick = () => {
      this.deleteWorld();

      this.router.navigate("selectWorld");
    };
  };
}

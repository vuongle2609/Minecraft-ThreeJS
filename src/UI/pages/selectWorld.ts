import { RenderPage } from "@/game/classes/renderPage";
import Router from "../router";
import { $, $$ } from "../utils/selector";
import { WorldsType } from "@/type";
import { WORLD_TYPE_MAPPING } from "@/constants";
import moment from "moment";

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
          class="flex flex-col w-full h-full items-center justify-center py-[10px] gap-4"
        >
          <h2 class="text-white text-lg px-[100px]">Select world</h2>

          <div class="w-full grow flex flex-col gap-3 text-white overflow-auto bg-black/50 py-2 px-[200px]" id="world_list">
          </div>

          <div class="w-full flex flex-col gap-2 mt-auto px-[100px]">
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

    const worlds: Record<string, WorldsType> = JSON.parse(
      localStorage.getItem("worlds") || "{}"
    );

    const worldsElement = Object.keys(worlds)
      .map((key) => {
        const { blocksMapping, createdDate, name, worldType } =
          worlds[key as keyof typeof worlds];

        return `
        <div class="world">
          <h4 class="text-xl leading-[22px]">${name}</h4>
          <span class="text-textGray text-xl leading-[22px]">${key} (${moment(
          createdDate
        ).format("MM/DD/YY HH:mm A")})</span>
          <span class="text-textGray text-xl leading-[22px]">${
            WORLD_TYPE_MAPPING[worldType as keyof typeof WORLD_TYPE_MAPPING]
          }</span>
        </div>
        `;
      })
      .join(" ");

    $("#world_list").innerHTML = worldsElement;

    $$(".world").forEach((item) => {
      item.addEventListener("click", (e) => {
        $$(".world").forEach((item) => {
          item.classList.remove("active");
        });

        item.classList.add("active");
      });
    });
  };
}

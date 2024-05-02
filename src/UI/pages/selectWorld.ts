import { WORLD_TYPE_MAPPING } from "@/constants";
import { RenderPage } from "@/game/classes/renderPage";
import { WorldsType } from "@/type";
import { format } from "date-fns";
import { v4 } from "uuid";
import Router from "../router";
import { $, $$ } from "../utils/selector";
export default class SelectWorld extends RenderPage {
  router: Router;
  selectedWorld: string | null = null;

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

          <div class="w-full flex flex-col gap-2 mt-auto px-[100px] max-w-[1040px]">
            <div class="w-full flex gap-3">
                <button
                    class="mc-button interactSelected disabled"
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
                    class="mc-button interactSelected disabled"
                    id="edit"
                >
                  <div class="title">Edit</div>
                </button>

                <button
                    class="mc-button interactSelected disabled"
                    id="delete"
                >
                  <div class="title">Delete</div>
                </button>

                <button
                    class="mc-button interactSelected disabled"
                    id="reCreate"
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

  handleRenderWorld(id: string) {
    this.router.navigate("gameRender", id);
  }

  deleteWorld() {
    const worlds: Record<string, WorldsType> = JSON.parse(
      localStorage.getItem("worlds") || "{}"
    );

    delete worlds[this.selectedWorld as keyof typeof worlds];

    localStorage.setItem("worlds", JSON.stringify(worlds));

    this.selectedWorld = null;
    this.disableInteractButton();
    this.renderWorlds();
  }

  reCreateWorld() {
    if (!this.selectedWorld) return;

    const worlds: Record<string, WorldsType> = JSON.parse(
      localStorage.getItem("worlds") || "{}"
    );

    const currentWorld = worlds[this.selectedWorld];

    const worldState = currentWorld;

    let worldId = v4();

    const worldsFormat: WorldsType = {
      ...worldState,
      createdDate: new Date(),
      blocksWorldChunk: {},
      initPos: undefined,
      rotation: undefined,
    };

    localStorage.setItem(
      "worlds",
      JSON.stringify({ ...worlds, [worldId]: worldsFormat })
    );

    this.handleRenderWorld(worldId);
  }

  editWorld(id: string) {
    this.router.navigate("editWorld", id);
  }

  disableInteractButton() {
    $$<HTMLButtonElement>(".interactSelected").forEach((item) => {
      item.classList.add("disabled");

      item.setAttribute("onclick", "");
    });
  }

  initSelectedWorld() {
    $$<HTMLButtonElement>(".interactSelected").forEach((item) => {
      item.classList.remove("disabled");
    });

    $("#play").onclick = () => {
      if (!this.selectedWorld) return;

      this.handleRenderWorld(this.selectedWorld);
    };

    $("#delete").onclick = () => {
      this.deleteWorld();
    };

    $("#reCreate").onclick = () => {
      this.reCreateWorld();
    };

    $("#edit").onclick = () => {
      if (!this.selectedWorld) return;

      this.editWorld(this.selectedWorld);
    };
  }

  renderWorlds() {
    this.disableInteractButton();

    const worlds: Record<string, WorldsType> = JSON.parse(
      localStorage.getItem("worlds") || "{}"
    );

    const worldIds = Object.keys(worlds);

    const worldsElement = worldIds
      .map((key) => {
        const { createdDate, name, worldType } =
          worlds[key as keyof typeof worlds];

        return `
        <div class="world">
          <h4 class="text-xl leading-[22px] w-full overflow-hidden text-ellipsis">${name}</h4>
          
          <span class="text-textGray text-xl leading-[22px] flex items-center">
            (${format(createdDate, "MM/dd/yy HH:mm a")})
          </span>

          <span class="text-textGray text-xl leading-[22px]">${
            WORLD_TYPE_MAPPING[worldType as keyof typeof WORLD_TYPE_MAPPING]
          }</span>
        </div>
        `;
      })
      .join(" ");

    $("#world_list").innerHTML = worldsElement;

    $$(".world").forEach((item, index) => {
      item.addEventListener("click", () => {
        $$(".world").forEach((item) => {
          item.classList.remove("active");
        });

        item.classList.add("active");

        this.selectedWorld = worldIds[index];

        this.initSelectedWorld();
      });
    });
  }

  afterRender = () => {
    $("#cancel").onclick = () => {
      this.router.navigate("mainScreen");
    };

    $("#create").onclick = () => {
      this.router.navigate("createWorld");
    };

    this.renderWorlds();
  };
}

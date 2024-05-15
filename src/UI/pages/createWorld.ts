import { v4 } from "uuid";

import {
  DEFAULT_WORLD_NAME,
  DEFAULT_WORLD_TYPE,
  FLAT_WORLD_TYPE,
  NORMAL_WORLD_TYPE,
  WORLD_TYPE_MAPPING,
} from "@/constants";
import { RenderPage } from "@/game/classes/renderPage";
import { WorldsType } from "@/type";
import MersenneTwister from "../utils/random";

import Router from "../router";
import { $ } from "../utils/selector";

export default class CreateWorld extends RenderPage {
  router: Router;

  state = {
    seed: null,
    name: DEFAULT_WORLD_NAME,
    worldType: DEFAULT_WORLD_TYPE,
  };

  constructor(router: Router) {
    super();

    this.router = router;
  }

  handleRenderWorld(id: string) {
    this.router.navigate("gameRender", id);
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
            <input id="world_name" class="text-white text-lg bg-black p-3 py-2 outline-none border-2 border-solid border-white w-full" value="${DEFAULT_WORLD_NAME}"/>
          </div>

          <div class="w-full flex gap-3">
            <button
              class="mc-button disabled"
            >
              <div class="title">
                Game Mode: Creative?
              </div>
            </button>

            <button
              class="mc-button"
              id="world_type"
            >
              <div class="title">
                World Type:&nbsp;<span id="world_type_id">${
                  WORLD_TYPE_MAPPING[
                    this.state.worldType as keyof typeof WORLD_TYPE_MAPPING
                  ]
                }</span>
              </div>
            </button>
          </div>

          <div class="w-full flex flex-col items-start max-w-[400px]" id="seed_container">
            <label for="seed" class="text-left text-gameGray">Seed (Numbers only)</label>
            <input id="seed" class="text-white text-lg bg-black p-3 py-2 outline-none border-2 border-solid border-white w-full"  type="number" />
          </div>

          <div class="w-full flex gap-3 mt-auto">
            <button
              class="mc-button"
              id="create"
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
    this.setState({
      seed: (() => {
        //@ts-ignore
        const m = new MersenneTwister();
        const randomNumber = m.random();
        return Math.round(randomNumber * 1000000);
      })(),
      name: DEFAULT_WORLD_NAME,
      worldType: DEFAULT_WORLD_TYPE,
    });
    super.render();
  }

  afterRender = () => {
    $<HTMLInputElement>("#seed").value = String(this.state.seed);

    $("#cancel").onclick = () => {
      const worlds: Record<string, WorldsType> = JSON.parse(
        localStorage.getItem("worlds") || "{}"
      );

      if (!Object.keys(worlds).length) {
        this.router.navigate("mainScreen");

        return;
      }

      this.router.navigate("selectWorld");
    };

    $("#create").onclick = () => {
      if (this.state.name === "") return;

      const worlds: Record<string, WorldsType> = JSON.parse(
        localStorage.getItem("worlds") || "{}"
      );

      const worldState = this.state;

      let worldId = v4();

      const worldsFormat: WorldsType = {
        ...worldState,
        createdDate: new Date(),
        blocksWorldChunk: {},
        seed: Number(worldState.seed),
      };

      localStorage.setItem(
        "worlds",
        JSON.stringify({ ...worlds, [worldId]: worldsFormat })
      );

      this.handleRenderWorld(worldId);
    };

    $("#world_name").onchange = (e) => {
      const nameValue = $<HTMLInputElement>("#world_name").value;
      const seedValue = $<HTMLInputElement>("#seed").value;

      if (nameValue === "" || seedValue === "") {
        $("#create").classList.add("disabled");
      } else if (nameValue && seedValue) {
        $("#create").classList.remove("disabled");
      }

      this.setState({
        name: nameValue,
      });
    };

    $<HTMLInputElement>("#seed").onchange = (e) => {
      const nameValue = $<HTMLInputElement>("#world_name").value;
      const seedValue = $<HTMLInputElement>("#seed").value;

      if (nameValue === "" || seedValue === "") {
        $("#create").classList.add("disabled");
      } else if (nameValue && seedValue) {
        $("#create").classList.remove("disabled");
      }

      this.setState({
        seed: seedValue,
      });
    };

    $("#world_type").onclick = () => {
      this.setState({
        worldType:
          this.state.worldType === FLAT_WORLD_TYPE
            ? NORMAL_WORLD_TYPE
            : FLAT_WORLD_TYPE,
      });

      if (this.state.worldType === FLAT_WORLD_TYPE) {
        $("#seed_container").classList.add("hidden");
      } else if (this.state.worldType === DEFAULT_WORLD_TYPE) {
        $("#seed_container").classList.remove("hidden");
      }

      $("#world_type_id").innerText =
        WORLD_TYPE_MAPPING[
          this.state.worldType as unknown as keyof typeof WORLD_TYPE_MAPPING
        ];
    };
  };
}

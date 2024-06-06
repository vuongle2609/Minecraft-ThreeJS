import { RenderPage } from "@/game/classes/renderPage";
import { WorldsType } from "@/type";

import Router from "../router";
import { $ } from "../utils/selector";

export default class EditWorld extends RenderPage {
  router: Router;
  id: string;
  state = {
    name: "",
  };

  constructor(router: Router) {
    super();

    this.router = router;
  }

  element = String.raw`
      <div class="w-full h-full items-center justify-center bg-cover flex flex-col"
        style="background-image: url('/assets/home/dirt_background.webp')">
        <div class="flex flex-col w-full h-full items-center justify-center px-[200px] py-[100px] gap-8">
          <h2 class="text-white text-lg">Edit name</h2>

          <div class="w-full flex flex-col items-start max-w-[400px]">
            <label for="world_name" class="text-left text-gameGray">World Name</label>
            <input id="world_name"
              class="text-white text-lg bg-black p-3 py-2 outline-none border-2 border-solid border-white w-full" />
          </div>

          <div class="w-full flex gap-3 mt-auto">
            <button class="mc-button" id="edit">
              <div class="title">
                Rename
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

  afterRender = () => {
    const worlds: Record<string, WorldsType> = JSON.parse(
      localStorage.getItem("worlds") || "{}"
    );

    const currentWorld = worlds[this.id];

    this.state.name = currentWorld.name;

    $<HTMLInputElement>("#world_name").value = String(this.state.name);

    $("#cancel").onclick = () => {
      this.router.navigate("selectWorld");
    };

    $("#edit").onclick = () => {
      if (this.state.name === "") return;

      const worlds: Record<string, WorldsType> = JSON.parse(
        localStorage.getItem("worlds") || "{}"
      );

      const worldState = currentWorld;

      const worldsFormat: WorldsType = {
        ...worldState,
        name: this.state.name,
      };

      localStorage.setItem(
        "worlds",
        JSON.stringify({ ...worlds, [this.id]: worldsFormat })
      );

      this.router.navigate("selectWorld");
    };

    $("#world_name").onchange = (e) => {
      const nameValue = $<HTMLInputElement>("#world_name").value;

      if (nameValue === "") {
        $("#edit").classList.add("disabled");
      } else if (nameValue) {
        $("#edit").classList.remove("disabled");
      }

      this.setState({
        name: nameValue,
      });
    };
  };
}

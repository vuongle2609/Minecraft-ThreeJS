import { RenderPage } from "@/game/classes/renderPage";
import Router from "../router";
import { $ } from "../utils/selector";

export default class InitScreen extends RenderPage {
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
          class="flex flex-col w-full h-full items-center justify-center px-[200px]"
        >
          <div class="w-full flex flex-col gap-4">
            <button
              class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full"
              id="confirm"
            >
              Enable sound?
            </button>
          </div>
          </div>
      </div>
    `;

  render() {
    super.render();
  }

  afterRender = () => {
    $("#confirm").onclick = () => {
      this.router.navigate("mainScreen");
    };
  };
}

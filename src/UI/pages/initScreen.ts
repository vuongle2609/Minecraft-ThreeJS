import { RenderPage } from "@/game/classes/renderPage";
import Router from "../router";
import { $ } from "../utils/selector";

export default class InitScreen extends RenderPage {
  router: Router;

  constructor(router: Router) {
    super();

    this.router = router;

    if (!localStorage.getItem("worlds"))
      localStorage.setItem("worlds", JSON.stringify({}));
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
              class="mc-button"
              id="confirm"
            >
              <div class="title">
                Enable sound?
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
    $("#confirm").onclick = () => {
      this.router.navigate("mainScreen");
    };
  };
}

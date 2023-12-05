import { RenderPage } from "@/classes/renderPage";

export default class MainScreen extends RenderPage {
  constructor() {
    super();
  }

  element = String.raw`
      <div
        id="modal_focus"
        class="w-full h-full items-center justify-center bg-cover flex flex-col"
        style="background-image: url('/assets/home/bg.jpg')"
      >
        <div
          class="flex flex-col w-full h-full backdrop-blur-md items-center justify-center px-[200px]"
        >
          <img
            src="/assets/home/minecraft-logo-8.png"
            class="max-w-[800px] w-full mb-20"
          />

          <button
            class="bg-[#717173] text-white border-[3px] border-solid border-black text-lg py-2 w-full max-w-[500px]"
            id="focus"
          >
            Focus
          </button>
        </div>
      </div>
    `;
}

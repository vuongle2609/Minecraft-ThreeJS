import { gameScene } from "@/main";
import { $ } from "@/utils/selector";

export default class MouseControl {
  public mousePercentScreenX = 0;
  public mousePercentScreenY = 0;
  public paused = true;
  public x = 0;
  public y = 0;

  constructor() {
    this.initialControl();
  }

  private initialControl() {
    const btnFocus = $("#focus");

    const canvas = document.querySelector("canvas");

    btnFocus?.addEventListener("click", () => {
      gameScene.control.lock();
    });

    const updatePosition = (e: any) => {
      const canvasWidth = canvas?.width || 0;
      const canvasHeight = canvas?.height || 0;
      this.x += e.movementX;
      this.y += e.movementY;

      if (this.x > canvasWidth) {
        this.x = 0;
      } else if (this.x < 0) {
        this.x = canvasWidth;
      }

      if (this.y > canvasHeight) {
        this.y = canvasHeight;
      } else if (this.y < 0) {
        this.y = 0;
      }

      this.mousePercentScreenX = this.x / canvasWidth;
      this.mousePercentScreenY = this.y / canvasHeight;
    };

    gameScene.control.addEventListener("lock", () => {
      const modalFocus = $("#modal_focus");
      this.paused = false;
      document.addEventListener("mousemove", updatePosition, false);
      if (modalFocus) modalFocus.style.display = "none";
    });

    gameScene.control.addEventListener("unlock", () => {
      const modalFocus = $("#modal_focus");
      this.paused = true;
      document.removeEventListener("mousemove", updatePosition, false);
      if (modalFocus) modalFocus.style.display = "flex";
    });
  }
}

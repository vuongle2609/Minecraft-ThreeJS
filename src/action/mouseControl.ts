import BaseEntity, { BasePropsType } from "@/classes/baseEntity";
import { $ } from "@/utils/selector";
import { Raycaster, Vector2 } from "three";

export default class MouseControl extends BaseEntity {
  public mousePercentScreenX = 0;
  public mousePercentScreenY = 0;
  public paused = true;
  public x = 0;
  public y = 0;
  raycaster = new Raycaster();
  pointer = new Vector2();

  constructor(props: BasePropsType) {
    super(props);
    this.initialControl();
  }

  private initialControl() {
    const btnFocus = $("#focus");

    const canvas = document.querySelector("canvas");

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

    window.addEventListener("pointermove", (e) => {
      this.onPointerMove(e);
    });

    btnFocus?.addEventListener("click", () => {
      this.control?.lock();
    });

    this.control?.addEventListener("lock", () => {
      const modalFocus = $("#modal_focus");
      const modalGame = $("#modal_game");

      this.paused = false;

      document.addEventListener("mousemove", updatePosition, false);

      modalFocus.style.display = "none";
      modalGame.style.display = "flex";
    });

    this.control?.addEventListener("unlock", () => {
      const modalFocus = $("#modal_focus");
      const modalGame = $("#modal_game");

      this.paused = true;

      document.removeEventListener("mousemove", updatePosition, false);

      modalFocus.style.display = "flex";
      modalGame.style.display = "none";
    });
  }

  onPointerMove(event: PointerEvent) {
    // this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    // this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
}

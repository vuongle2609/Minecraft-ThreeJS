import blocks from "@/constants/blocks";
import { $ } from "@/UI/utils/selector";
import BaseEntity, { BasePropsType } from "./baseEntity";

export default class InventoryManager extends BaseEntity {
  inventory: (keyof typeof blocks | null)[] = [
    "grass",
    "oak_planks",
    "block_of_diamond",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];

  currentFocusIndex = 0;
  currentFocus = this.inventory[this.currentFocusIndex];

  timeoutHideLabel: NodeJS.Timeout | null = null;

  isOpenInventory = false;

  constructor(props: BasePropsType) {
    super(props);
    this.initialize();
  }

  initialize() {
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "e") {
          this.renderInventory();
        }

        // if (e.key === "Escape") {
        //   this.renderInventory(true);
        // }

        if (!!Number(e.key)) {
          this.handleChangeFocusItem(Number(e.key));
        }
      },
      false
    );

    document.addEventListener("wheel", (e) => {
      this.handleChangeFocusItem(
        this.currentFocusIndex - (e.deltaY < 0 ? -2 : 0)
      );
      e.stopImmediatePropagation();
    });
  }

  handleChangeFocusItem(indexFocus: number) {
    this.currentFocusIndex = indexFocus - 1;

    if (this.currentFocusIndex > 9) {
      this.currentFocusIndex = 0;
    }

    if (this.currentFocusIndex < 0) {
      this.currentFocusIndex = 9;
    }

    this.currentFocus = this.inventory[this.currentFocusIndex];

    if (this.currentFocus)
      this.renderLabelFocusItem(blocks[this.currentFocus].name || "");
    else this.renderLabelFocusItem("");

    this.renderHotbar();
  }

  renderLabelFocusItem(label: string) {
    const labelFocus = $("#itemLabel");

    if (!labelFocus) return;

    if (this.timeoutHideLabel) {
      clearTimeout(this.timeoutHideLabel);
    }

    labelFocus.style.opacity = "1";

    labelFocus.innerHTML = `<span>${label || ""}</span>`;

    this.timeoutHideLabel = setTimeout(() => {
      labelFocus.style.opacity = "0";
    }, 1500);
  }

  renderInventory(closeOnly?: boolean) {
    if (this.isOpenInventory || closeOnly) {
      $("#modal-inventory")?.remove();
      this.control?.lock();
      this.isOpenInventory = false;
      return;
    }

    if (this.mouseControl?.paused) return;

    this.isOpenInventory = true;
    $("#app").insertAdjacentHTML(
      "afterend",
      `
    <div class="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center" id="modal-inventory">
      <div class="pixel-corners--wrapper">
        <div class="w-[500px] pixel-corners">
          <div class="w-full h-full border-[5px] border-solid border-t-white border-l-white border-b-[#555555] border-r-[#555555]">
            <div class="w-full h-full bg-[#c6c6c6] p-3 pt-1">
              <div class="w-full">
                <div class="flex items-center gap-4">
                  <span class="text-2xl text-[#404040]">Search Items</span>

                  <div class="grow box-with-shadow h-9">
                    <input class="outline-none border-none bg-transparent w-full h-full px-1 text-white text-xl"/>
                  </div>
                </div>
              </div>

              <div class="w-full mt-2 flex">
                <div class="flex flex-col gap-4 w-full">
                  <div class="w-full flex flex-wrap">
                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>
                  </div>
                  <div class="w-full flex">
                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>

                    <div class="w-[11.11%] aspect-square box-with-shadow bold">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
    );

    this.control?.unlock();
  }

  renderHotbar() {
    const inventoryContainer = $("#inventory_container");

    if (!inventoryContainer) return;

    inventoryContainer.innerHTML = this.inventory
      .map((itemKey, index) => {
        const currentBlock = itemKey ? blocks[itemKey] : null;

        const iconPath = `/assets/${itemKey}/icon.jpg`;
        const name = currentBlock?.name;
        const isItemActive = this.currentFocusIndex === index;

        const borderColor = isItemActive ? "border-white" : "border-gray-600";

        return `
        <div class="h-12 w-12 border-4 border-solid ${borderColor}">
          ${
            currentBlock
              ? `
                <img src="${iconPath}" alt="${name}" />
              `
              : ""
          }
        </div>
      `;
      })
      .join("");
  }
}

import blocks from "@/constants/blocks";
import { $ } from "@/UI/utils/selector";

export default class InventoryManager {
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

  constructor() {
    this.initialize();
  }

  initialize() {
    const keyMap: Record<string, number> = {
      Digit1: 1,
      Digit2: 2,
      Digit3: 3,
      Digit4: 4,
      Digit5: 5,
      Digit6: 6,
      Digit7: 7,
      Digit8: 8,
      Digit9: 9,
    };

    document.addEventListener(
      "keydown",
      (e) => {
        if (!!Number(e.key)) {
          this.handleChangeFocusItem(Number(e.key));
        }
      },
      false
    );
  }

  handleChangeFocusItem(indexFocus: number) {
    this.currentFocusIndex = indexFocus - 1;
    this.currentFocus = this.inventory[this.currentFocusIndex];

    if (this.currentFocus)
      this.renderLabelFocusItem(blocks[this.currentFocus].name || "");

    this.renderInventory();
  }

  renderLabelFocusItem(label: string) {
    const labelFocus = $("#itemLabel");

    if (!labelFocus || !label) return;

    if (this.timeoutHideLabel) {
      clearTimeout(this.timeoutHideLabel);
    }

    labelFocus.style.opacity = "1";

    labelFocus.innerHTML = `<span>${label}</span>`;

    this.timeoutHideLabel = setTimeout(() => {
      labelFocus.style.opacity = "0";
    }, 1500);
  }

  renderInventory() {
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

import blocks from "@/constants/blocks";
import { $ } from "@/utils/selector";

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

  currentFocusIndex = 0
  currentFocus = this.inventory[this.currentFocusIndex];

  constructor() {
    this.initialize();
  }

  initialize() {
    const keyMap: Record<string, number> = {
      "Digit1": 1,
      "Digit2": 2,
      "Digit3": 3,
      "Digit4": 4,
      "Digit5": 5,
      "Digit6": 6,
      "Digit7": 7,
      "Digit8": 8,
      "Digit9": 9,
    };

    document.addEventListener(
      "keydown",
      (e) => {
        if (keyMap[e.code]) {
          this.handleChangeFocusItem(keyMap[e.code]);
        }
      },
      false
    );
  }

  handleChangeFocusItem(indexFocus: number) {
    this.currentFocusIndex = indexFocus - 1
    this.currentFocus = this.inventory[this.currentFocusIndex];

    this.renderInventory();
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

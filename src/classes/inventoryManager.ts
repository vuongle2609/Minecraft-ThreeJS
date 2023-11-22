import blocks from "@/constants/blocks";
import { $ } from "@/utils/selector";

export default class InventoryManager {
  inventory: (keyof typeof blocks | null)[] = [
    "grass",
    "oak_planks",
    "block_of_diamond",
  ];

  currentFocus = this.inventory[2];

  constructor() {
    this.initialize();
  }

  initialize() {
    this.renderInventory();
  }

  renderInventory() {
    const inventoryContainer = $("#inventory_container");

    if (!inventoryContainer) return;

    // inventoryContainer.innerHTML = inventory
  }
}

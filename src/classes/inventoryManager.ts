import blocks from "@/constants/blocks";

export default class InventoryManager {
  inventory: (keyof typeof blocks)[] = [
    "grass",
    "oak_planks",
    "block_of_diamond",
  ];

  currentFocus = this.inventory[2];

  constructor() {}

  initialize() {}
}

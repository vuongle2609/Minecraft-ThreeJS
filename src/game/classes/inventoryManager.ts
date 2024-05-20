import blocks from "@/constants/blocks";
import { HOTBAR_LENGTH } from "@/constants/player";
import { BlockKeys } from "@/type";
import { $, $$ } from "@/UI/utils/selector";

import BaseEntity, { BasePropsType } from "./baseEntity";
export default class InventoryManager extends BaseEntity {
  blocksList = [
    ...Object.keys(blocks).filter((key) => {
      return blocks[key as unknown as BlockKeys].renderInInventory;
    }),
    ...Array(
      45 - Object.values(blocks).filter((item) => item.renderInInventory).length
    ).fill(null),
  ] as (BlockKeys | null)[];

  inventory: (BlockKeys | null)[] = Array(HOTBAR_LENGTH)
    .fill(null)
    .map((_, index) => Object.keys(blocks)[index] as unknown as BlockKeys);

  tooltipElement: HTMLDivElement | undefined;
  currentDragElement: HTMLImageElement | undefined;
  inventoryContainerElement: HTMLDivElement | undefined;

  currentDragItem: null | BlockKeys;

  currentFocusIndex = 0;
  currentFocus = this.inventory[this.currentFocusIndex];

  timeoutHideLabel: NodeJS.Timeout | null = null;

  isOpenInventory = false;

  eventList: {
    element: HTMLElement | Document;
    event: string;
    handle: Function;
  }[] = [];

  constructor(props: BasePropsType) {
    super(props);
    this.initialize();
  }

  initialize() {
    console.log(Object.keys(blocks));

    const keyDownHandle = (e: KeyboardEvent) => {
      if (e.key === "e") {
        this.renderInventory();
      }

      if (e.key === "Escape") {
        this.renderInventory(true);
      }

      if (!!Number(e.key)) {
        this.handleChangeFocusItem(Number(e.key));
      }
    };

    const wheelHandle = (e: WheelEvent) => {
      this.handleChangeFocusItem(
        this.currentFocusIndex - (e.deltaY < 0 ? 0 : -2)
      );
      e.stopImmediatePropagation();
    };

    const mouseMoveHandle = this.handleMouseMove.bind(this);

    document.addEventListener("keydown", keyDownHandle, false);

    document.addEventListener("wheel", wheelHandle, false);

    document.addEventListener("mousemove", mouseMoveHandle, false);

    this.eventList.push(
      {
        element: document,
        event: "keydown",
        handle: keyDownHandle,
      },
      {
        element: document,
        event: "wheel",
        handle: wheelHandle,
      },
      {
        element: document,
        event: "mousemove",
        handle: mouseMoveHandle,
      }
    );
  }

  handleMouseMove(e: MouseEvent) {
    this.handleMouseMoveHoverBlock(e);
    this.handleMouseMoveDraggingBlock(e);
  }

  handleMouseMoveDraggingBlock(e: MouseEvent) {
    if (!this.currentDragElement || !this.inventoryContainerElement) return;

    if (!this.currentDragItem) {
      this.currentDragElement.style.display = "none";
      return;
    }

    const blockDragging = blocks[this.currentDragItem];

    const translateX = e.clientX - 20;

    const translateY = e.clientY - 20;

    this.currentDragElement.style.display = "block";
    if (blockDragging.icon) this.currentDragElement.src = blockDragging.icon;
    this.currentDragElement.style.transform = `translate(${translateX}px,${translateY}px)`;
    this.currentDragElement.innerText =
      (this.currentDragItem as unknown as string) || "";
  }

  handleMouseMoveHoverBlock(e: MouseEvent) {
    if (!this.tooltipElement || !this.inventoryContainerElement) return;

    const hoverId = (e.target as HTMLImageElement).id as unknown as BlockKeys;
    const blockHover = blocks[hoverId];

    if (!blockHover || this.currentDragItem) {
      this.tooltipElement.style.display = "none";
      return;
    }

    const translateX = e.clientX + 12;

    const translateY = e.clientY - 32;

    this.tooltipElement.style.display = "block";
    this.tooltipElement.style.transform = `translate(${translateX}px,${translateY}px)`;
    this.tooltipElement.innerText = blockHover.name;
  }

  handleChangeFocusItem(indexFocus: number) {
    this.currentFocusIndex = indexFocus - 1;

    if (this.currentFocusIndex > HOTBAR_LENGTH - 1) {
      this.currentFocusIndex = 0;
    }

    if (this.currentFocusIndex < 0) {
      this.currentFocusIndex = HOTBAR_LENGTH - 1;
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

  renderBlockList = (
    listKey: (BlockKeys | null)[],
    elementSelector: string,
    customClickClass: string,
    customClickClassNull: string
  ) => {
    $(elementSelector).innerHTML = listKey
      .map((itemKey) => {
        const currentBlock = itemKey ? blocks[itemKey] : null;

        const iconPath = currentBlock?.icon;
        const name = currentBlock?.name;
        const shouldRender = currentBlock?.renderInInventory;

        return currentBlock && iconPath && shouldRender
          ? `
        <div class="w-[11.11%] aspect-square box-with-shadow bold hover:brightness-150 ${customClickClass}" block_data="${itemKey}" draggable="false">
          <img src="${iconPath}" alt="${name}" id="${itemKey}" draggable="false"/>
        </div>
        `
          : `
        <div class="w-[11.11%] aspect-square box-with-shadow bold hover:brightness-125 ${customClickClassNull}"></div>
        `;
      })
      .join("");
  };

  renderBlockListInventoryHotBar() {
    this.renderBlockList(
      this.inventory,
      "#inventoryHotbar",
      "hotbarInventory",
      "hotbarInventory"
    );

    $$<HTMLDivElement>(".hotbarInventory").forEach((item, index) => {
      const handle = () => this.handleMouseDownHotbar.bind(this)(index);

      item.addEventListener("mousedown", handle, false);

      this.eventList.push({
        event: "mousedown",
        handle,
        element: item,
      });
    });
  }

  renderInventory(closeOnly?: boolean) {
    if (this.isOpenInventory || closeOnly) {
      $("#modal-inventory")?.remove();
      this.control?.lock();
      this.isOpenInventory = false;
      this.tooltipElement = undefined;
      this.currentDragElement = undefined;
      this.inventoryContainerElement = undefined;
      return;
    }

    if (this.mouseControl?.paused) return;

    this.isOpenInventory = true;

    $("#app").insertAdjacentHTML(
      "afterend",
      `
      <div class="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center z-20" id="modal-inventory">
        <div id="tooltipName" class="border-2 border-solid border-[#25015b] absolute top-0 left-0 w-fit bg-[#170817] p-[2px] px-2 text-white z-30 hidden">
        </div>

        <img id="itemDragging" class="absolute top-0 left-0 z-30 hidden w-10 pointer-events-none" />

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
                  <div class="flex flex-col gap-4 w-full relative" id="inventoryContainer">
                    <div class="w-full flex flex-wrap" id="inventoryBlocks">
                    </div>

                    <div class="w-full flex" id="inventoryHotbar">
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

    this.tooltipElement = $("#tooltipName") as HTMLDivElement;
    this.currentDragElement = $("#itemDragging") as HTMLImageElement;
    this.inventoryContainerElement = $("#inventoryContainer") as HTMLDivElement;

    this.renderBlockList(
      this.blocksList,
      "#inventoryBlocks",
      "blockInventory",
      "emptyInventory"
    );

    $$<HTMLDivElement>(".blockInventory").forEach((item) => {
      const handle = () =>
        this.handleMouseDownInventory.bind(this)(
          item.getAttribute("block_data") as unknown as BlockKeys
        );

      item.addEventListener("mousedown", handle, false);

      this.eventList.push({
        event: "mousedown",
        handle,
        element: item,
      });
    });

    $$<HTMLDivElement>(".emptyInventory").forEach((item) => {
      const handle = () => {
        this.currentDragItem = null;
      };

      item.addEventListener("mousedown", handle, false);

      this.eventList.push({
        event: "mousedown",
        handle,
        element: item,
      });
    });

    this.renderBlockListInventoryHotBar();

    this.control?.unlock();
  }

  handleMouseDownInventory(itemKey: BlockKeys) {
    if (!this.currentDragItem) {
      this.currentDragItem = itemKey;
    } else {
      this.currentDragItem = null;
    }
  }

  handleMouseDownHotbar(index: number) {
    if (this.currentDragItem) {
      if (this.inventory[index]) {
        const swapItem = this.inventory[index];

        this.inventory[index] = this.currentDragItem;
        this.currentDragItem = swapItem;
      } else {
        this.inventory[index] = this.currentDragItem;
        this.currentDragItem = null;
      }
    } else if (this.inventory[index]) {
      this.currentDragItem = this.inventory[index];
      this.inventory[index] = null;
    }

    this.renderBlockListInventoryHotBar();

    this.renderHotbar();
  }

  renderHotbar() {
    const inventoryContainer = $("#inventory_container");

    if (!inventoryContainer) return;

    inventoryContainer.innerHTML = this.inventory
      .map((itemKey, index) => {
        const currentBlock = itemKey ? blocks[itemKey] : null;

        const iconPath = currentBlock?.icon;
        const name = currentBlock?.name;
        const isItemActive = this.currentFocusIndex === index;

        return `
        <div class="h-10 w-10 box-with-shadow hotbar">
          ${
            currentBlock
              ? `
                <img src="${iconPath}" alt="${name}" />
              `
              : ""
          }

          ${
            isItemActive
              ? `
                <div class="focusHotbar">
                  <div>
                    <div>
                      <div>
                      </div>
                    </div>
                  </div>
                </div>
              `
              : ""
          }
        </div>
      `;
      })
      .join("");

    this.currentFocus = this.inventory[this.currentFocusIndex];
  }

  dispose() {
    this.eventList.forEach(({ handle, element, event }) =>
      element.removeEventListener(event, handle as any, false)
    );
  }
}

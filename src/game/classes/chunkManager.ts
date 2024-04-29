import blocks from "@/constants/blocks";
import {
  nameChunkFromCoordinate,
  nameFromCoordinate,
} from "@/game/helpers/nameFromCoordinate";
import { detailFromName } from "../helpers/detailFromName";
import { BasePropsType } from "./baseEntity";
import BlockManager from "./blockManager";
import InventoryManager from "./inventoryManager";

interface PropsType {
  inventoryManager: InventoryManager;
}

export default class ChunkManager extends BlockManager {
  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.initialize();
  }

  async initialize() {
    super.initialize();
    this.renderSavedWorld();
  }

  handleRequestChunks(currentChunk: { x: number; z: number }) {
    // get neighbors
    const neighborOffset = [
      { x: -1, z: -1 },
      { x: -1, z: 0 },
      { x: -1, z: 1 },
      { x: 0, z: -1 },
      { x: 0, z: 1 },
      { x: 0, z: 0 },
      { x: 1, z: -1 },
      { x: 1, z: 0 },
      { x: 1, z: 1 },
    ];

    const neighborChunksKeys = neighborOffset.map((offset) => {
      const chunk = {
        x: currentChunk.x + offset.x,
        z: currentChunk.z + offset.z,
      };

      const chunkName = nameChunkFromCoordinate(chunk.x, chunk.z);

      this.handleAssignWorkerChunk(chunkName, chunk);

      return chunkName;
    });

    this.handleClearChunks(neighborChunksKeys);

    this.chunksActive = neighborChunksKeys;
  }

  // can optimize worker speed
  handleRenderChunkBlocks = (
    chunkName: string,
    blocksRenderWorker: Record<
      string,
      {
        position: number[];
        type: keyof typeof blocks;
      }
    > = {}
  ) => {
    // if after process blocks in chunk and return data but chunk no
    // longer active then abort
    if (!this.chunksActive.includes(chunkName)) return;

    if (this.blocksWorldChunk[chunkName] && blocksRenderWorker) {
      blocksRenderWorker = {
        ...blocksRenderWorker,
        ...Object.keys(this.blocksWorldChunk[chunkName]).reduce(
          (prev, currKey) => {
            const { x, y, z } = detailFromName(currKey);
            return {
              ...prev,
              [currKey]: {
                position: [x, y, z],
                type: this.blocksWorldChunk[chunkName][currKey],
              },
            };
          },
          {}
        ),
      };
    }

    const blocksRender = Object.values(blocksRenderWorker);
    const blocksInChunk: string[] = [];

    blocksRender.forEach(({ position, type }) => {
      this.updateBlock(position[0], position[1], position[2], type, true);

      blocksInChunk.push(
        nameFromCoordinate(position[0], position[1], position[2])
      );
    });

    this.chunksBlocks[chunkName] = blocksInChunk;

    // clear after done
    this.chunksWorkers[chunkName]?.terminate();
    delete this.chunksWorkers[chunkName];
  };

  handleClearChunks = (neighborChunksKeys: string[]) => {
    const inactiveChunk = this.chunksActive.filter(
      (item) => !neighborChunksKeys.includes(item)
    );

    let blocksDelete: string[] = [];

    inactiveChunk.forEach((item) => {
      blocksDelete = [...blocksDelete, ...(this.chunksBlocks[item] || [])];

      this.chunksWorkers[item]?.terminate();

      delete this.chunksWorkers[item];
      delete this.chunksBlocks[item];
    });

    blocksDelete.forEach((blockKey) => {
      const { y, x, z } = detailFromName(blockKey);

      this.removeBlock(x, y, z, true);
    });
  };

  handleAssignWorkerChunk = (
    chunkName: string,
    chunk: { x: number; z: number }
  ) => {
    if (!this.chunksBlocks[chunkName]) {
      this.chunksWorkers[chunkName] = new Worker(
        new URL("../terrant/worker", import.meta.url),
        {
          type: "module",
        }
      );

      this.chunksWorkers[chunkName].postMessage({
        ...chunk,
        type: this.worldStorage?.worldType,
      });

      this.chunksWorkers[chunkName].onmessage = (e) => {
        this.handleRenderChunkBlocks(chunkName, e.data.blocks);
      };
    }
  };

  renderSavedWorld() {}
}

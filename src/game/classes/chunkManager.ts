import { DEFAULT_CHUNK_VIEW } from "@/constants";
import blocks from "@/constants/blocks";
import {
  nameChunkFromCoordinate,
  nameFromCoordinate,
} from "@/game/helpers/nameFromCoordinate";
import { calNeighborsOffset } from "../helpers/calNeighborsOffset";
import { detailFromName } from "../helpers/detailFromName";
import { BasePropsType } from "./baseEntity";
import BlockManager from "./blockManager";
import InventoryManager from "./inventoryManager";

interface PropsType {
  inventoryManager: InventoryManager;
}

export default class ChunkManager extends BlockManager {
  chunkRenderQueue: Function[] = [];

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
    const neighborOffset = calNeighborsOffset(DEFAULT_CHUNK_VIEW);

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
    > = {},
    blocksToRender: Record<string, 1>
  ) => {
    const blocksRender = Object.keys(blocksRenderWorker);
    const blocksInChunk: string[] = [];

    blocksRender.forEach((key) => {
      const { position, type } = blocksRenderWorker[key];

      this.updateBlock({
        x: position[0],
        y: position[1],
        z: position[2],
        type,
        isRenderChunk: true,
        shouldNotRenderIntoScene: !(key in blocksToRender),
      });

      blocksInChunk.push(
        nameFromCoordinate(position[0], position[1], position[2])
      );
    });

    this.chunksBlocks[chunkName] = blocksInChunk;

    // clear after done
    this.chunksWorkers[chunkName]?.terminate();
    delete this.chunksWorkers[chunkName];
  };

  handleRenderChunkQueue(
    chunkName: string,
    blocksRenderWorker: Record<
      string,
      {
        position: number[];
        type: keyof typeof blocks;
      }
    > = {},
    blocksToRender: Record<string, 1>,
    shouldInitPos?: boolean
  ) {
    // if after process blocks in chunk and return data but chunk no
    // longer active then abort
    if (!this.chunksActive.includes(chunkName)) return;

    // priority add to physics cal first
    this.worker?.postMessage({
      type: "bulkAddBlock",
      data: {
        blocks: Object.keys(blocksRenderWorker).reduce((prev, key) => {
          return { ...prev, [key]: blocksRenderWorker[key].type };
        }, {}),
        shouldInitPos,
      },
    });

    // maybe the queue things is not working :(
    let shouldStart = false;
    if (this.chunkRenderQueue.length === 0) {
      shouldStart = true;
    }

    this.chunkRenderQueue.unshift(() => {
      this.handleRenderChunkBlocks(
        chunkName,
        blocksRenderWorker,
        blocksToRender
      );
      this.chunkRenderQueue.pop();

      this.chunkRenderQueue.at(-1)?.();
    });

    if (shouldStart) {
      this.chunkRenderQueue.at(-1)?.();
    }
  }

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
        chunkBlocksCustom: this.blocksWorldChunk[chunkName],
      });

      this.chunksWorkers[chunkName].onmessage = (e) => {
        this.handleRenderChunkQueue(
          chunkName,
          e.data.blocks,
          e.data.blocksRender
        );
      };
    }
  };

  renderSavedWorld() {}
}

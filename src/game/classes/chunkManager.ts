import { CHUNK_VIEW_WORKER_PHYSICS, DEFAULT_CHUNK_VIEW } from "@/constants";
import { Face } from "@/constants/block";
import { BlockKeys } from "@/constants/blocks";
import {
  nameChunkFromCoordinate,
  nameFromCoordinate,
} from "@/game/helpers/nameFromCoordinate";

import { calNeighborsOffset } from "../helpers/calNeighborsOffset";
import { getChunkNeighborsCoor } from "../helpers/chunkHelpers";
import { detailFromName } from "../helpers/detailFromName";
import { BasePropsType } from "./baseEntity";
import BlockManager from "./blockManager";
import InventoryManager from "./inventoryManager";

interface PropsType {
  inventoryManager: InventoryManager;
}

type ChunkPendingQueueType = {
  type: number | undefined;
  chunkBlocksCustom: Record<string, 0 | BlockKeys>;
  neighborsChunkData: Record<string, Record<string, 0 | BlockKeys>>;
  seed: number | undefined;
  x: number;
  z: number;
  name: string;
};

export default class ChunkManager extends BlockManager {
  chunkRenderQueue: Function[] = [];

  chunkPendingQueue: ChunkPendingQueueType[] = [];

  createWorker = (index: number) => ({
    worker: new Worker(new URL("../terrant/worker", import.meta.url), {
      type: "module",
    }),
    isBusy: false,
    index,
    currentProcessChunk: null,
  });

  chunkWorkers = Array(14)
    .fill(0)
    .reduce((prev, _, index) => {
      return {
        ...prev,
        [index]: this.createWorker(index),
      };
    }, {}) as Record<
    string | number,
    {
      worker: Worker;
      isBusy: boolean;
      index: number;
      currentProcessChunk: string | null;
    }
  >;

  startWorker(
    workerChunk: {
      worker: Worker;
      isBusy: boolean;
      index: number;
      currentProcessChunk: string | null;
    },
    data?: ChunkPendingQueueType
  ) {
    if (data) {
      workerChunk.currentProcessChunk = data.name;
      workerChunk.isBusy = true;
      workerChunk.worker.postMessage({
        type: "getBlocksInChunk",
        data,
      });
    }
  }

  chunkPendingQueueProxy = {
    unshift: (x: number, z: number) => {
      const neighborsChunkData: Record<
        string,
        Record<string, 0 | BlockKeys>
      > = {};

      const neighbors = getChunkNeighborsCoor(x, z);

      Object.keys(neighbors).forEach((key) => {
        neighborsChunkData[key] = this.blocksWorldChunk[key] || {};
      });

      const chunkName = nameChunkFromCoordinate(x, z);

      const workerData = {
        x,
        z,
        type: this.worldStorage?.worldType,
        chunkBlocksCustom: this.blocksWorldChunk[chunkName] || {},
        neighborsChunkData,
        seed: this.worldStorage?.seed,
        name: chunkName,
      };

      this.chunkPendingQueue.unshift(workerData);

      const freeOrInactiveWorker = Object.values(this.chunkWorkers).find(
        (chunk) => {
          const currentProcessKey =
            this.chunkWorkers[chunk.index].currentProcessChunk;

          const isProccessDeadJob =
            currentProcessKey && !this.chunksActive.includes(currentProcessKey);

          if (isProccessDeadJob) {
            this.chunkWorkers[chunk.index].worker.terminate();

            this.chunkWorkers[chunk.index] = this.createWorker(chunk.index);
          }

          return !this.chunkWorkers[chunk.index].isBusy || isProccessDeadJob;
        }
      );

      if (freeOrInactiveWorker) {
        this.startWorker(
          freeOrInactiveWorker,
          this.chunkPendingQueueProxy.pop()
        );
      }
    },
    pop: () => {
      return this.chunkPendingQueue.pop();
    },
    filterInactive: () => {
      this.chunkPendingQueue = this.chunkPendingQueue.filter((item) =>
        this.chunksActive.includes(item.name)
      );
    },
  };

  setUpWorker() {
    Object.keys(this.chunkWorkers).forEach((item) => {
      const currWorker = this.chunkWorkers[item];

      currWorker.worker.onmessage = (e) => {
        currWorker.currentProcessChunk = null;
        currWorker.isBusy = false;

        if (e.data.type === "renderBlocks") {
          const { chunkName, blocks, facesToRender } = e.data.data;

          this.handleRenderChunkBlocks(chunkName, blocks, facesToRender);

          this.startWorker(currWorker, this.chunkPendingQueueProxy.pop());
        }
      };
    });
  }

  constructor(props: BasePropsType & PropsType) {
    super(props);

    this.setUpWorker();
    this.initialize();
  }

  async initialize() {
    super.initialize();
  }

  handleRequestChunks(currentChunk: { x: number; z: number }) {
    const neighborOffset = calNeighborsOffset(DEFAULT_CHUNK_VIEW);
    const neighborOffsetPhysics = calNeighborsOffset(CHUNK_VIEW_WORKER_PHYSICS);

    const chunkDetail: {
      chunk: {
        x: number;
        z: number;
      };
      chunkName: string;
    }[] = [];

    const neighborChunksKeys = neighborOffset.map((offset) => {
      const chunk = {
        x: currentChunk.x + offset.x,
        z: currentChunk.z + offset.z,
      };

      const chunkName = nameChunkFromCoordinate(chunk.x, chunk.z);

      chunkDetail.push({
        chunk,
        chunkName,
      });

      return chunkName;
    });

    this.handleClearChunks(neighborChunksKeys);

    this.chunksActive = neighborChunksKeys;
    this.chunkPendingQueueProxy.filterInactive();

    chunkDetail.forEach(({ chunkName, chunk }) => {
      this.handleAssignWorkerChunk(chunkName, chunk);
    });

    const neighborChunksKeysPhysics = neighborOffsetPhysics.map((offset) => {
      const chunk = {
        x: currentChunk.x + offset.x,
        z: currentChunk.z + offset.z,
      };

      const chunkName = nameChunkFromCoordinate(chunk.x, chunk.z);

      return chunkName;
    });

    this.worker?.postMessage({
      type: "changeChunk",
      data: {
        neighborChunksKeys: neighborChunksKeysPhysics,
      },
    });
  }

  // can optimize worker speed
  handleRenderChunkBlocks = (
    chunkName: string,
    blocksRenderWorker: Record<
      string,
      {
        position: number[];
        type: BlockKeys;
      }
    > = {},
    facesToRender: Record<string, Record<Face, boolean>>
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
        facesToRender: facesToRender[key],
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

  handleClearChunks = (neighborChunksKeys: string[]) => {
    const inactiveChunk = this.chunksActive.filter(
      (item) => !neighborChunksKeys.includes(item)
    );

    let blocksDelete: string[] = [];

    inactiveChunk.forEach((item) => {
      blocksDelete = [...blocksDelete, ...(this.chunksBlocks[item] || [])];

      delete this.chunksBlocks[item];
    });

    blocksDelete.forEach((blockKey) => {
      const { y, x, z } = detailFromName(blockKey);

      this.removeBlock(x, y, z, true);
    });
  };

  handleAssignWorkerChunk(chunkName: string, chunk: { x: number; z: number }) {
    if (!this.chunksBlocks[chunkName]) {
      this.chunkPendingQueueProxy.unshift(chunk.x, chunk.z);
    }
  }

  dispose() {
    Object.values(this.chunkWorkers).forEach(({ worker }) => {
      worker.terminate();
    });
  }
}

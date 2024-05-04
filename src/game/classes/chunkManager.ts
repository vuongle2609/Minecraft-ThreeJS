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
};

export default class ChunkManager extends BlockManager {
  chunkRenderQueue: Function[] = [];

  chunkPendingQueue: ChunkPendingQueueType[] = [];

  chunkWorkers = Array(4)
    .fill(0)
    .reduce((prev, _, index) => {
      return {
        ...prev,
        [index]: {
          worker: new Worker(new URL("../terrant/worker", import.meta.url), {
            type: "module",
          }),
          isBusy: false,
          index,
        },
      };
    }, {}) as Record<
    string | number,
    {
      worker: Worker;
      isBusy: boolean;
      index: number;
    }
  >;

  startWorker(worker: Worker, data?: ChunkPendingQueueType) {
    if (data)
      worker.postMessage({
        type: "getBlocksInChunk",
        data,
      });
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
      };

      this.chunkPendingQueue.unshift(workerData);

      const freeWorker = Object.values(this.chunkWorkers).find(
        (chunk) => !this.chunkWorkers[chunk.index].isBusy
      );

      if (freeWorker) {
        this.startWorker(freeWorker.worker, this.chunkPendingQueueProxy.pop());
      }
    },
    pop: () => {
      return this.chunkPendingQueue.pop();
    },
  };

  setUpWorker() {
    Object.keys(this.chunkWorkers).forEach((item) => {
      const currWorker = this.chunkWorkers[item].worker;

      currWorker.onmessage = (e) => {
        if (e.data.type === "renderBlocks") {
          const { chunkName, blocks, facesToRender } = e.data.data;

          this.handleRenderChunkQueue(chunkName, blocks, facesToRender);

          setTimeout(() => {
            this.startWorker(currWorker, this.chunkPendingQueueProxy.pop());
          }, 200);
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

    const neighborChunksKeys = neighborOffset.map((offset) => {
      const chunk = {
        x: currentChunk.x + offset.x,
        z: currentChunk.z + offset.z,
      };

      const chunkName = nameChunkFromCoordinate(chunk.x, chunk.z);

      this.handleAssignWorkerChunk(chunkName, chunk);

      return chunkName;
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

    Object.values(this.blocksIntanced).forEach((block: any) => {
      Object.values(block).forEach((item: any) => {
        item.mesh.instanceMatrix.needsUpdate = true;
        item.mesh.computeBoundingSphere();
      });
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
        type: BlockKeys;
      }
    > = {},
    facesToRender: Record<string, Record<Face, boolean>> = {}
  ) {
    // if after process blocks in chunk and return data but chunk no
    // longer active then abort
    if (!this.chunksActive.includes(chunkName)) return;

    // maybe the queue things is not working :(
    let shouldStart = false;
    if (this.chunkRenderQueue.length === 0) {
      shouldStart = true;
    }

    this.chunkRenderQueue.unshift(() => {
      this.handleRenderChunkBlocks(
        chunkName,
        blocksRenderWorker,
        facesToRender
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
      // this.chunksWorkers[chunkName] = new Worker(
      //   new URL("../terrant/worker", import.meta.url),
      //   {
      //     type: "module",
      //   }
      // );

      this.chunkPendingQueueProxy.unshift(chunk.x, chunk.z);

      // this.chunksWorkers[chunkName].postMessage(workerData);

      // this.chunksWorkers[chunkName].onmessage = (e) => {
      //   this.handleRenderChunkQueue(
      //     chunkName,
      //     e.data.blocks,
      //     e.data.facesToRender
      //   );
      // };
    }
  };
}

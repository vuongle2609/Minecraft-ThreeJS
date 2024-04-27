import { getBlocksInChunk } from "../helpers/chunkHelpers";

self.onmessage = (e) => {
  const blocks = getBlocksInChunk(e.data.x, e.data.z);

  self.postMessage({ blocks });
};

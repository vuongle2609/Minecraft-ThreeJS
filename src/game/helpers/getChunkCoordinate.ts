const getChunkCoordinate = (x: number, y: number) => {
  const chunkSize = 10
  const chunkCal = chunkSize * 2;

  const chunkX = Math.floor(x / chunkCal);
  const chunkY = Math.floor(y / chunkCal);

  return {
    x: chunkX,
    y: chunkY,
  };
};

export default getChunkCoordinate;

const detailFromName = (name: string) => {
  const d = name.split("_");

  return {
    x: Number(d[0]),
    y: Number(d[1]),
    z: Number(d[2]),
    type: d[3],
    face: d[4],
  };
};

export { detailFromName };

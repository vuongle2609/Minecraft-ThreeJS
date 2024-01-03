const detailFromName = (name: string) => {
  const d = name.split("_");

  return {
    x: Number(d[0]),
    y: Number(d[1]),
    z: Number(d[2]),
    face: d[3],
  };
};

export default detailFromName;

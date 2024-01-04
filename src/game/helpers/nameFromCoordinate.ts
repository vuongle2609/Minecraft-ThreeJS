const nameFromCoordinate = (
  x: number,
  y: number,
  z: number,
  type?: string,
  face?: number
) => {
  return (
    x + "_" + y + "_" + z + (type ? "_" + type : "") + (face ? "_" + face : "")
  );
};

export default nameFromCoordinate;

import {
  BufferAttribute,
  BufferGeometry,
  MeshStandardMaterial,
  MeshToonMaterial,
  NearestFilter,
  TextureLoader,
} from "three";

// textures image
import cobblestoneSide from "@/assets/block/cobblestone.png";
import diamondBlockSide from "@/assets/block/diamond_block.png";
import dirt from "@/assets/block/dirt.png";
import emeraldBlockSide from "@/assets/block/emerald_block.png";
import furnaceFront from "@/assets/block/furnace_front_on.png";
import furnaceSide from "@/assets/block/furnace_side.png";
import furnaceTop from "@/assets/block/furnace_top.png";
import goldBlockSide from "@/assets/block/gold_block.png";
import grassTopGreen from "@/assets/block/grassBlockTop.png";
import grassSide from "@/assets/block/grass_side.png";
import ironBlockSide from "@/assets/block/iron_block.png";
import lapisBlockSide from "@/assets/block/lapis_block.png";
import oakPlanksSide from "@/assets/block/planks_oak.png";

//icon
import blockOfEmeraldIcon from "@/assets/blockIcon/Block_of_Emerald_JE4_BE3.webp";
import blockOfGoldIcon from "@/assets/blockIcon/Block_of_Gold_JE6_BE3.webp";
import blockOfIronIcon from "@/assets/blockIcon/Block_of_Iron_JE4_BE3.webp";
import blockOfLapisIcon from "@/assets/blockIcon/Block_of_Lapis_Lazuli_JE3_BE3.webp";
import cobblestoneIcon from "@/assets/blockIcon/Cobblestone.webp";
import dirtIcon from "@/assets/blockIcon/Dirt.webp";
import furnanceIcon from "@/assets/blockIcon/Furnace_29_JE4.webp";
import grassIcon from "@/assets/blockIcon/Grass_Block.webp";
import oakPlanksIcon from "@/assets/blockIcon/Oak_Planks.webp";
import blockOfDiamondIcon from "@/assets/blockIcon/block_of_diamond.webp";

// soundStep
import stepGrass from "@/assets/sound/step/grass3.ogg";
import stepStone from "@/assets/sound/step/stone3.ogg";

// sound place
import placeBlock from "@/assets/sound/place/block.mp3";
import placeGrass from "@/assets/sound/place/grass.mp3";
import placeWood from "@/assets/sound/place/wood.mp3";

// sound break
import breakBlock from "@/assets/sound/break/block.mp3";
import breakGrass from "@/assets/sound/break/grass.mp3";
import breakWood from "@/assets/sound/break/wood.mp3";

// texture load
const textureLoader = new TextureLoader();

const textures = {
  grassTopGreenTexture: textureLoader.load(grassTopGreen),
  grassSideTexture: textureLoader.load(grassSide),
  dirtTexture: textureLoader.load(dirt),
  oakPlanksSideTexture: textureLoader.load(oakPlanksSide),
  diamondBlockSideTexture: textureLoader.load(diamondBlockSide),
  furnaceFrontTexture: textureLoader.load(furnaceFront),
  furnaceSideTexture: textureLoader.load(furnaceSide),
  furnaceTopTexture: textureLoader.load(furnaceTop),
  cobblestoneSideTexture: textureLoader.load(cobblestoneSide),
  ironBlockSideTexture: textureLoader.load(ironBlockSide),
  goldBlockSideTexture: textureLoader.load(goldBlockSide),
  lapisBlockSideTexture: textureLoader.load(lapisBlockSide),
  emeraldBlockSideTexture: textureLoader.load(emeraldBlockSide),
};

// is it good to set both to nearest?

Object.values(textures).forEach((item) => {
  item.magFilter = NearestFilter;
});

// texture format: side side top bottom side side

// const worldMaterial = MeshStandardMaterial;
// const worldMaterial = MeshPhongMaterial;
// const worldMaterial = MeshBasicMaterial;
const worldMaterial = MeshToonMaterial;

const blocks = {
  grass: {
    name: "Grass",
    icon: grassIcon,
    step: new Audio(stepGrass),
    place: new Audio(placeGrass),
    break: new Audio(breakGrass),
    volume: 0.1,
    texture: [
      new worldMaterial({
        map: textures.grassSideTexture,
      }),
      new worldMaterial({
        map: textures.grassSideTexture,
      }),
      new worldMaterial({
        map: textures.grassSideTexture,
      }),
      new worldMaterial({
        map: textures.grassSideTexture,
      }),
      new worldMaterial({
        map: textures.grassTopGreenTexture,
      }),
      new worldMaterial({
        map: textures.dirtTexture,
      }),
    ],
  },
  dirt: {
    name: "Dirt",
    icon: dirtIcon,
    step: new Audio(stepGrass),
    place: new Audio(placeGrass),
    break: new Audio(breakGrass),
    volume: 0.1,
    texture: [
      new worldMaterial({
        map: textures.dirtTexture,
      }),
      new worldMaterial({
        map: textures.dirtTexture,
      }),
      new worldMaterial({
        map: textures.dirtTexture,
      }),
      new worldMaterial({
        map: textures.dirtTexture,
      }),
      new worldMaterial({
        map: textures.dirtTexture,
      }),
      new worldMaterial({
        map: textures.dirtTexture,
      }),
    ],
  },
  cobblestone: {
    name: "Cobblestone",
    icon: cobblestoneIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.1,
    texture: [
      new worldMaterial({
        map: textures.cobblestoneSideTexture,
      }),
      new worldMaterial({
        map: textures.cobblestoneSideTexture,
      }),
      new worldMaterial({
        map: textures.cobblestoneSideTexture,
      }),
      new worldMaterial({
        map: textures.cobblestoneSideTexture,
      }),
      new worldMaterial({
        map: textures.cobblestoneSideTexture,
      }),
      new worldMaterial({
        map: textures.cobblestoneSideTexture,
      }),
    ],
  },
  furnace: {
    name: "Furnace",
    icon: furnanceIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.1,
    texture: [
      new worldMaterial({
        map: textures.furnaceSideTexture,
      }),
      new worldMaterial({
        map: textures.furnaceFrontTexture,
      }),

      new worldMaterial({
        map: textures.furnaceSideTexture,
      }),
      new worldMaterial({
        map: textures.furnaceSideTexture,
      }),
      new worldMaterial({
        map: textures.furnaceTopTexture,
      }),
      new worldMaterial({
        map: textures.furnaceTopTexture,
      }),
    ],
  },
  oakPlanks: {
    name: "Oak Wood Planks",
    icon: oakPlanksIcon,
    step: new Audio(stepStone),
    place: new Audio(placeWood),
    break: new Audio(breakWood),
    volume: 0.5,
    texture: [
      new worldMaterial({
        map: textures.oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: textures.oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: textures.oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: textures.oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: textures.oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: textures.oakPlanksSideTexture,
      }),
    ],
  },
  blockOfDiamond: {
    name: "Block of Diamond",
    icon: blockOfDiamondIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: [
      new worldMaterial({
        map: textures.diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.diamondBlockSideTexture,
      }),
    ],
  },
  blockOfIron: {
    name: "Block of Iron",
    icon: blockOfIronIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: [
      new worldMaterial({
        map: textures.ironBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.ironBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.ironBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.ironBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.ironBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.ironBlockSideTexture,
      }),
    ],
  },
  blockOfGold: {
    name: "Block of Gold",
    icon: blockOfGoldIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: [
      new worldMaterial({
        map: textures.goldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.goldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.goldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.goldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.goldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.goldBlockSideTexture,
      }),
    ],
  },
  blockOfLapis: {
    name: "Block of Lapis",
    icon: blockOfLapisIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: [
      new worldMaterial({
        map: textures.lapisBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.lapisBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.lapisBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.lapisBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.lapisBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.lapisBlockSideTexture,
      }),
    ],
  },
  blockOfEmerald: {
    name: "Block of Emerald",
    icon: blockOfEmeraldIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: [
      new worldMaterial({
        map: textures.emeraldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.emeraldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.emeraldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.emeraldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.emeraldBlockSideTexture,
      }),
      new worldMaterial({
        map: textures.emeraldBlockSideTexture,
      }),
    ],
  },
};
export type BlockAttributeType = (typeof blocks)[keyof typeof blocks];

Object.values(blocks).forEach((block) => {
  block.step.loop = true;
  block.step.volume = block.volume;
  block.step.playbackRate = 1.3;

  block.place.volume = 0.6;
  block.break.volume = 0.6;
});

export const renderGeometry = (() => {
  const geometry = new BufferGeometry();
  const vertices = new Float32Array([
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,

    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
  ]);

  const uvs = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,

    1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
  ]);

  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));

  geometry.computeVertexNormals();

  return geometry;
})();

export default blocks;

import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  MeshLambertMaterial,
  NearestFilter,
  TextureLoader,
} from "three";

// textures image
import bedrock from "@/assets/block/bedrock.png";
import cobblestoneSide from "@/assets/block/cobblestone.png";
import diamondBlockSide from "@/assets/block/diamond_block.png";
import dirt from "@/assets/block/dirt.png";
import emeraldBlockSide from "@/assets/block/emerald_block.png";
import furnaceFront from "@/assets/block/furnace_front_on.png";
import furnaceSide from "@/assets/block/furnace_side.png";
import furnaceTop from "@/assets/block/furnace_top.png";
import goldBlockSide from "@/assets/block/gold_block.png";
import grassTop from "@/assets/block/grass.jpg";
import grassSide from "@/assets/block/grass_side.png";
import ironBlockSide from "@/assets/block/iron_block.png";
import lapisBlockSide from "@/assets/block/lapis_block.png";
import leavesOak from "@/assets/block/leaves_oak.png";
import woodSide from "@/assets/block/log_oak.png";
import woodTop from "@/assets/block/log_oak_top.png";
import oakPlanksSide from "@/assets/block/planks_oak.png";
import sand from "@/assets/block/sand.png";
import stone from "@/assets/block/stone.png";
import water from "@/assets/block/water.png";
//icon
import bedRockIcon from "@/assets/blockIcon/Bedrock_JE2_BE2.webp";
import blockOfDiamondIcon from "@/assets/blockIcon/block_of_diamond.webp";
import blockOfEmeraldIcon from "@/assets/blockIcon/Block_of_Emerald_JE4_BE3.webp";
import blockOfGoldIcon from "@/assets/blockIcon/Block_of_Gold_JE6_BE3.webp";
import blockOfIronIcon from "@/assets/blockIcon/Block_of_Iron_JE4_BE3.webp";
import blockOfLapisIcon from "@/assets/blockIcon/Block_of_Lapis_Lazuli_JE3_BE3.webp";
import cobblestoneIcon from "@/assets/blockIcon/Cobblestone.webp";
import dirtIcon from "@/assets/blockIcon/Dirt.webp";
import furnanceIcon from "@/assets/blockIcon/Furnace_29_JE4.webp";
import grassIcon from "@/assets/blockIcon/Grass_Block.webp";
import leavesIcon from "@/assets/blockIcon/Oak_Leaves.webp";
import woodIcon from "@/assets/blockIcon/Oak_Log_29_JE5_BE3.webp";
import oakPlanksIcon from "@/assets/blockIcon/Oak_Planks.webp";
import sandIcon from "@/assets/blockIcon/Sand_JE5_BE3.webp";
import stoneIcon from "@/assets/blockIcon/Stone.webp";
// sound break
import breakBlock from "@/assets/sound/break/block.mp3";
import breakGrass from "@/assets/sound/break/grass.mp3";
import breakWood from "@/assets/sound/break/wood.mp3";
// sound place
import placeBlock from "@/assets/sound/place/block.mp3";
import placeGrass from "@/assets/sound/place/grass.mp3";
import placeWood from "@/assets/sound/place/wood.mp3";
// soundStep
import stepGrass from "@/assets/sound/step/grass3.ogg";
import stepStone from "@/assets/sound/step/stone3.ogg";
import { BlockKeys, BlockTextureType } from "@/type";

// texture load
const textureLoader = new TextureLoader();

const textures = {
  grassTopTexture: textureLoader.load(grassTop),
  grassSideTexture: textureLoader.load(grassSide),
  dirtTexture: textureLoader.load(dirt),
  sandTexture: textureLoader.load(sand),
  leavesTexture: textureLoader.load(leavesOak),
  stoneTexture: textureLoader.load(stone),
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
  woodSideTexture: textureLoader.load(woodSide),
  woodTopTexture: textureLoader.load(woodTop),
  bedRockTexture: textureLoader.load(bedrock),
  waterTexture: textureLoader.load(water),
};

// is it good to set both to nearest?
Object.values(textures).forEach((item) => {
  item.magFilter = NearestFilter;
});

const worldMaterial = MeshLambertMaterial;

// back front side sideleft top bottom
const blocks = {
  [BlockKeys.grass]: {
    name: "Grass",
    renderInInventory: true,
    icon: grassIcon,
    step: new Audio(stepGrass),
    place: new Audio(placeGrass),
    break: new Audio(breakGrass),
    volume: 0.1,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.grassSideTexture,
      }),
      [BlockTextureType.top]: new worldMaterial({
        map: textures.grassTopTexture,
      }),
      [BlockTextureType.bottom]: new worldMaterial({
        map: textures.dirtTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.top,
      BlockTextureType.bottom,
    ],
  },
  [BlockKeys.stone]: {
    name: "Stone",
    renderInInventory: true,
    icon: stoneIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(placeBlock),
    volume: 0.1,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.stoneTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.sand]: {
    name: "Sand",
    renderInInventory: true,
    icon: sandIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(placeBlock),
    volume: 0.1,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.sandTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.dirt]: {
    name: "Dirt",
    renderInInventory: true,
    icon: dirtIcon,
    step: new Audio(stepGrass),
    place: new Audio(placeGrass),
    break: new Audio(breakGrass),
    volume: 0.1,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.dirtTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.cobblestone]: {
    name: "Cobblestone",
    renderInInventory: true,
    icon: cobblestoneIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.1,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.cobblestoneSideTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.leaves]: {
    name: "Leaves",
    renderInInventory: true,
    icon: leavesIcon,
    step: new Audio(stepGrass),
    place: new Audio(placeGrass),
    break: new Audio(breakGrass),
    volume: 0.1,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.leavesTexture,
        color: 0x63a948,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.wood]: {
    name: "Wood",
    renderInInventory: true,
    icon: woodIcon,
    step: new Audio(stepStone),
    place: new Audio(placeWood),
    break: new Audio(breakWood),
    volume: 0.5,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.woodSideTexture,
      }),
      [BlockTextureType.top]: new worldMaterial({
        map: textures.woodTopTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.top,
      BlockTextureType.top,
    ],
  },
  [BlockKeys.furnace]: {
    name: "Furnace",
    renderInInventory: true,
    icon: furnanceIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.1,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.furnaceSideTexture,
      }),
      [BlockTextureType.top]: new worldMaterial({
        map: textures.furnaceTopTexture,
      }),
      [BlockTextureType.front]: new worldMaterial({
        map: textures.furnaceFrontTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.front,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.top,
      BlockTextureType.top,
    ],
  },
  [BlockKeys.oakPlanks]: {
    name: "Oak Wood Planks",
    renderInInventory: true,
    icon: oakPlanksIcon,
    step: new Audio(stepStone),
    place: new Audio(placeWood),
    break: new Audio(breakWood),
    volume: 0.5,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.oakPlanksSideTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.blockOfDiamond]: {
    name: "Block of Diamond",
    renderInInventory: true,
    icon: blockOfDiamondIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.diamondBlockSideTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.blockOfIron]: {
    name: "Block of Iron",
    renderInInventory: true,
    icon: blockOfIronIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.ironBlockSideTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.blockOfGold]: {
    name: "Block of Gold",
    renderInInventory: true,
    icon: blockOfGoldIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.goldBlockSideTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.blockOfLapis]: {
    name: "Block of Lapis",
    renderInInventory: true,
    icon: blockOfLapisIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.lapisBlockSideTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.blockOfEmerald]: {
    name: "Block of Emerald",
    renderInInventory: true,
    icon: blockOfEmeraldIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.emeraldBlockSideTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.water]: {
    name: "Water",
    renderInInventory: false,
    icon: bedRockIcon,
    step: new Audio(stepGrass),
    place: new Audio(placeGrass),
    break: new Audio(breakGrass),
    volume: 0.1,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.waterTexture,
        transparent: true,
        opacity: 0.9,
        // side: DoubleSide,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
  [BlockKeys.bedrock]: {
    name: "Bedrock",
    renderInInventory: false,
    icon: bedRockIcon,
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(placeBlock),
    volume: 0.1,
    texture: {
      [BlockTextureType.side]: new worldMaterial({
        map: textures.bedRockTexture,
      }),
    },
    textureMap: [
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
      BlockTextureType.side,
    ],
  },
};

export type BlockAttributeType = (typeof blocks)[BlockKeys];

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

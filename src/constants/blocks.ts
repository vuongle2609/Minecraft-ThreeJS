import {
  MeshBasicMaterial,
  MeshStandardMaterial,
  NearestFilter,
  TextureLoader,
} from "three";

import grassTopGreen from "@/assets/block/grass_top_green.png";
import grassSide from "@/assets/block/grass_block_side.png";

import dirt from "@/assets/block/dirt.png";

import oakPlanksSide from "@/assets/block/oak_planks.png";

import diamondBlockSide from "@/assets/block/diamond_block.png";

const textureLoader = new TextureLoader();

const grassTopGreenTexture = textureLoader.load(grassTopGreen);
const grassSideTexture = textureLoader.load(grassSide);

const dirtTexture = textureLoader.load(dirt);

const oakPlanksSideTexture = textureLoader.load(oakPlanksSide);

const diamondBlockSideTexture = textureLoader.load(diamondBlockSide);

// is it good to set both to nearest?

grassTopGreenTexture.magFilter = NearestFilter;
grassSideTexture.magFilter = NearestFilter;
dirtTexture.magFilter = NearestFilter;
oakPlanksSideTexture.magFilter = NearestFilter;
diamondBlockSideTexture.magFilter = NearestFilter;

grassTopGreenTexture.minFilter = NearestFilter;
grassSideTexture.minFilter = NearestFilter;
dirtTexture.minFilter = NearestFilter;
oakPlanksSideTexture.minFilter = NearestFilter;
diamondBlockSideTexture.minFilter = NearestFilter;

//texture format: side side top bottom side side

const worldMaterial = MeshStandardMaterial;
// const worldMaterial = MeshBasicMaterial;

const blocks = {
  grass: {
    name: "Grass",
    texture: [
      new worldMaterial({
        map: grassSideTexture,
      }),
      new worldMaterial({
        map: grassSideTexture,
      }),
      new worldMaterial({
        map: grassTopGreenTexture,
      }),
      new worldMaterial({
        map: dirtTexture,
      }),
      new worldMaterial({
        map: grassSideTexture,
      }),
      new worldMaterial({
        map: grassSideTexture,
      }),
    ],
  },
  oak_planks: {
    name: "Oak Wood Planks",
    texture: [
      new worldMaterial({
        map: oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: oakPlanksSideTexture,
      }),
      new worldMaterial({
        map: oakPlanksSideTexture,
      }),
    ],
  },
  block_of_diamond: {
    name: "Block of Diamond",
    texture: [
      new worldMaterial({
        map: diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: diamondBlockSideTexture,
      }),
      new worldMaterial({
        map: diamondBlockSideTexture,
      }),
    ],
  },
};

export default blocks;

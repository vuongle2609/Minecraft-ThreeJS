import { MeshStandardMaterial, NearestFilter, TextureLoader } from "three";

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

// it's good to set both to nearest?

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

const blocks = {
  grass: {
    name: "Grass",
    texture: [
      new MeshStandardMaterial({
        map: grassSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: grassSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: grassTopGreenTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: dirtTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: grassSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: grassSideTexture,
        side: 0,
      }),
    ],
  },
  oak_planks: {
    name: "Oak Wood Planks",
    texture: [
      new MeshStandardMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),

      new MeshStandardMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),

      new MeshStandardMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),
    ],
  },
  block_of_diamond: {
    name: "Block of Diamond",
    texture: [
      new MeshStandardMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshStandardMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
    ],
  },
};

export default blocks;

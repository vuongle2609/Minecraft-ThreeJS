import { MeshBasicMaterial, NearestFilter, TextureLoader } from "three";

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

grassTopGreenTexture.magFilter = NearestFilter;
grassSideTexture.magFilter = NearestFilter;
dirtTexture.magFilter = NearestFilter;
oakPlanksSideTexture.magFilter = NearestFilter;
diamondBlockSideTexture.magFilter = NearestFilter;

//texture format: side side top bottom side side

const blocks = {
  grass: {
    name: "Grass",
    texture: [
      new MeshBasicMaterial({
        map: grassSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: grassSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: grassTopGreenTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: dirtTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: grassSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: grassSideTexture,
        side: 0,
      }),
    ],
  },
  oak_planks: {
    name: "Oak Wood Planks",
    texture: [
      new MeshBasicMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),

      new MeshBasicMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),

      new MeshBasicMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: oakPlanksSideTexture,
        side: 0,
      }),
    ],
  },
  block_of_diamond: {
    name: "Block of Diamond",
    texture: [
      new MeshBasicMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
      new MeshBasicMaterial({
        map: diamondBlockSideTexture,
        side: 0,
      }),
    ],
  },
};

export default blocks;

import { MeshToonMaterial, NearestFilter, TextureLoader } from "three";

// textures image
import grassTopGreen from "@/assets/block/grassBlockTop.png";
import grassSide from "@/assets/block/grass_side.png";
import dirt from "@/assets/block/dirt.png";
import oakPlanksSide from "@/assets/block/planks_oak.png";
import diamondBlockSide from "@/assets/block/diamond_block.png";

// soundStep
import stepGrass from "@/assets/sound/step/grass3.ogg";
import stepStone from "@/assets/sound/step/stone3.ogg";

// sound place
import placeGrass from "@/assets/sound/place/grass.mp3";
import placeWood from "@/assets/sound/place/wood.mp3";
import placeBlock from "@/assets/sound/place/block.mp3";

// sound break
import breakGrass from "@/assets/sound/break/grass.mp3";
import breakWood from "@/assets/sound/break/wood.mp3";
import breakBlock from "@/assets/sound/break/block.mp3";

// texture load
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

// texture format: side side top bottom side side

// const worldMaterial = MeshStandardMaterial;
// const worldMaterial = MeshPhongMaterial;
// const worldMaterial = MeshBasicMaterial;
const worldMaterial = MeshToonMaterial;

const blocks = {
  grass: {
    name: "Grass",
    step: new Audio(stepGrass),
    place: new Audio(placeGrass),
    break: new Audio(breakGrass),
    volume: 0.1,
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
    step: new Audio(stepStone),
    place: new Audio(placeWood),
    break: new Audio(breakWood),
    volume: 0.5,
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
    step: new Audio(stepStone),
    place: new Audio(placeBlock),
    break: new Audio(breakBlock),
    volume: 0.5,
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

Object.values(blocks).forEach((block) => {
  block.step.loop = true;
  block.step.volume = block.volume;
  block.step.playbackRate = 1.3;

  block.place.volume = 0.6;
  block.break.volume = 0.6;
});

export default blocks;

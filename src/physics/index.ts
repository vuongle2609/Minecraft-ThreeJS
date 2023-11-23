import InitBodyType from "@/types/initBodyType";
import { ContactMaterial, Vec3, World, Material, Body, Box } from "cannon-es";

const world = new World({
  gravity: new Vec3(0, -60, 0),
  frictionGravity: new Vec3(),
});

const bodies: Record<string, Body> = {};

export const physicsMaterial = new Material("physics");

export const humanMaterial = new Material("human");

const physics_physics = new ContactMaterial(physicsMaterial, humanMaterial, {
  friction: 0,
  restitution: 0,
});

world.addContactMaterial(physics_physics);

// { optionBody }: { optionBody: InitBodyType }
const handleAddBodyToWorld = () => {
  const newBody = new Body({
    mass: 5,
    shape: new Box(new Vec3(0.5, 2, 0.5)),
    material: humanMaterial,
    fixedRotation: true,
  });

  newBody.position.set(0, 4, 0);
  newBody.linearDamping = 0.9;

  world.addBody(newBody);

  bodies["character"] = newBody;
};

handleAddBodyToWorld();

const timeStep = 1 / 60;

// get all bodies position
const getBodyProperties = ({
  position,
  delta,
}: {
  position: Float32Array;
  delta: number;
}) => {
  if (delta) world.step(timeStep, delta);

  bodies["character"].position.set(position[0], position[1], position[2]);

  const { x, y, z } = bodies["character"].position;

  position[0] = x;
  position[1] = y;
  position[2] = z;

  self.postMessage({ position, delta });
};

const eventMapping = {
  handleAddBodyToWorld,
  getBodyProperties,
};

self.onmessage = (e: MessageEvent) => {
  //   console.log("🚀 ~ file: index.ts:51 ~ type:", e.data.type);
  //   eventMapping[e.data.type](e.data.payload);
  getBodyProperties(e.data);
  //   self.postMessage("Tin nhắn này gửi đến main thread");
};

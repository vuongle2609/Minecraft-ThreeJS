import { Body, Box, ContactMaterial, Material, Vec3, World } from "cannon-es";

const timeStep = 1 / 60;

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

  const contactNormal = new Vec3();
  const upAxis = new Vec3(0, 1, 0);
  
  newBody.addEventListener("collide", (e: any) => {
    const { contact } = e;

    if (contact.bi.id === newBody.id) {
      contact.ni.negate(contactNormal);
    } else {
      contactNormal.copy(contact.ni);
    }

    if (contactNormal.dot(upAxis) > 0.5) {
      self.postMessage('done_jump')
    }
  });

  bodies["character"] = newBody;
};

handleAddBodyToWorld();

const handleJumpBody = () => {
  bodies["character"].velocity.y = 30;
};

const handleAddBlockToWorld = ({ position }: { position: Float32Array }) => {
  const blockPhysicsBody = new Body({
    type: Body.STATIC,
    shape: new Box(new Vec3(1, 1, 1)),
    material: physicsMaterial,
  });

  blockPhysicsBody.position.set(position[0], position[1], position[2]);

  world.addBody(blockPhysicsBody);
};

// get all bodies position
const getBodyProperties = ({
  position,
  delta,
}: {
  position: Float32Array;
  delta: number;
}) => {
  if (delta) world.step(timeStep, delta);

  const vectorMoveConverted = bodies["character"].position.vadd(
    new Vec3(position[0], position[1], position[2])
  );

  bodies["character"].position.set(
    vectorMoveConverted.x,
    vectorMoveConverted.y,
    vectorMoveConverted.z
  );

  const { x, y, z } = bodies["character"].position;

  position[0] = x;
  position[1] = y;
  position[2] = z;

  self.postMessage({ position, delta });
};

const eventMapping = {
  handleAddBlockToWorld,
  getBodyProperties,
  handleJumpBody,
};

self.onmessage = (
  e: MessageEvent<{
    type: keyof typeof eventMapping;
    payload: any;
  }>
) => {
  eventMapping[e.data.type](e.data.payload);
};

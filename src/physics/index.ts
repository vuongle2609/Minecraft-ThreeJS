import { Body, Box, ContactMaterial, Material, Vec3, World } from "cannon-es";

import("@dimforge/rapier3d").then((RAPIER) => {
  // Use the RAPIER module here.
  let gravity = { x: 0.0, y: -9.81, z: 0.0 };
  let world = new RAPIER.World(gravity);

  // Create the ground
  let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.0, 10.0);
  world.createCollider(groundColliderDesc);

  let rigidBodyDesc = new RAPIER.RigidBodyDesc(
    RAPIER.RigidBodyType.KinematicVelocityBased
  )
    .setTranslation(0, 8, 0)
    .setGravityScale(50);
  let rigidBody = world.createRigidBody(rigidBodyDesc);

  let colliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.5);
  let collider = world.createCollider(colliderDesc, rigidBody);

  let offset = 0.01;
  let characterController = world.createCharacterController(offset);

  characterController.setUp({ x: 0, y: 1, z: 0 });

  let vy = -20;
  let ground = false;

  // get all bodies position
  const getBodyProperties = ({
    position,
    delta,
  }: {
    position: Float32Array;
    delta: number;
  }) => {
    world.step();

    if (vy > -20) {
      vy -= 1;
    }

    characterController.computeColliderMovement(collider, {
      x: position[0],
      y: ground ? 0 : vy,
      z: position[2],
    });
    
    const correctMovement = characterController.computedMovement();

    for (let i = 0; i < characterController.numComputedCollisions(); i++) {
      let collision = characterController.computedCollision(i);
      console.log("🚀 ~ file: index.ts:52 ~ import ~ collision:", collision);

      // if (collision?.normal1.y === 1) {
      //   ground = true;
      // }
    }

    rigidBody.setLinvel(correctMovement, true);

    let { x, y, z } = rigidBody.translation();
    // console.log("🚀 ~ file: index.ts:46 ~ import ~ { x, y, z } :", { x, y, z });

    position[0] = x;
    position[1] = y;
    position[2] = z;

    self.postMessage({ position, delta });
  };

  const handleJumpBody = () => {
    if (ground) {
      ground = false;
      vy = 40;
    }
  };

  const eventMapping = {
    // handleAddBlockToWorld,
    getBodyProperties,
    handleJumpBody,
  };

  self.onmessage = (
    e: MessageEvent<{
      type: keyof typeof eventMapping;
      payload: any;
    }>
  ) => {
    eventMapping[e.data.type]?.(e.data.payload);
  };
});

// const timeStep = 1 / 60;

// const world = new World({
//   gravity: new Vec3(0, -60, 0),
//   frictionGravity: new Vec3(),
//   // allowSleep: true,
// });

// const bodies: Record<string, Body> = {};

// export const physicsMaterial = new Material("physics");

// export const humanMaterial = new Material("human");

// const physics_physics = new ContactMaterial(physicsMaterial, humanMaterial, {
//   friction: 0,
//   restitution: 0,
// });

// world.addContactMaterial(physics_physics);

// const handleAddBodyToWorld = () => {
//   const newBody = new Body({
//     mass: 5,
//     shape: new Box(new Vec3(0.5, 2, 0.5)),
//     material: humanMaterial,
//     fixedRotation: true,
//   });

//   newBody.position.set(0, 4, 0);
//   newBody.linearDamping = 0.9;

//   world.addBody(newBody);

//   const contactNormal = new Vec3();
//   const upAxis = new Vec3(0, 1, 0);

//   newBody.addEventListener("collide", (e: any) => {
//     const { contact } = e;

//     if (contact.bi.id === newBody.id) {
//       contact.ni.negate(contactNormal);
//     } else {
//       contactNormal.copy(contact.ni);
//     }

//     if (contactNormal.dot(upAxis) > 0.5) {
//       self.postMessage("done_jump");
//     }
//   });

//   bodies["character"] = newBody;
// };

// handleAddBodyToWorld();

//imp
// const handleJumpBody = () => {
//   bodies["character"].velocity.y = 30;
// };

// const handleAddBlockToWorld = ({ position }: { position: Float32Array }) => {
//   const blockPhysicsBody = new Body({
//     type: Body.STATIC,
//     shape: new Box(new Vec3(1, 1, 1)),
//     material: physicsMaterial,
//   });

//   blockPhysicsBody.position.set(position[0], position[1], position[2]);

//   world.addBody(blockPhysicsBody);
// };

import { lerp } from "three/src/math/MathUtils";

import("@dimforge/rapier3d").then((RAPIER) => {
  // Use the RAPIER module here.
  let gravity = { x: 0.0, y: -9.81, z: 0.0 };
  let world = new RAPIER.World(gravity);

  // let grounddesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0);
  // let groundBody = world.createRigidBody(grounddesc);

  // // Create the ground
  // let groundColliderDesc = RAPIER.ColliderDesc.cuboid(1, 1, 1);
  // world.createCollider(groundColliderDesc, groundBody);

  let rigidBodyDesc = new RAPIER.RigidBodyDesc(
    RAPIER.RigidBodyType.KinematicVelocityBased
  )
    .setTranslation(0, 10, 0)
    .setGravityScale(50);
  let characterBody = world.createRigidBody(rigidBodyDesc);

  let colliderDesc = RAPIER.ColliderDesc.capsule(1, 0.5);
  // colliderDesc.setMass(2);
  let collider = world.createCollider(colliderDesc, characterBody);

  let offset = 0.001;
  let characterController = world.createCharacterController(offset);

  characterController.setUp({ x: 0, y: 1, z: 0 });

  let vy = -20;
  let ground = false;

  const ray = new RAPIER.Ray(
    {
      x: 0,
      y: 0,
      z: 0,
    },
    {
      x: 0,
      y: -1,
      z: 0,
    }
  );

  let storedFall = 0;

  // get all bodies position
  const getBodyProperties = ({
    position,
    delta,
  }: {
    position: Float32Array;
    delta: number;
  }) => {
    world.step();

    ray.origin.x = characterBody.translation().x;
    ray.origin.y = characterBody.translation().y;
    ray.origin.z = characterBody.translation().z;

    let hit = world.castRay(ray, 0.1, false);

    let yDirection = 0;

    // lerp(storedFall, -9.81 * 100, 0.1);
    yDirection += lerp(storedFall, -9.81, 0.1);
    storedFall = yDirection;

    console.log("🚀 ~ file: index.ts:74 ~ import ~ diff:", hit);
    if (hit) {
      const point = ray.pointAt(hit.toi);
      let diff = characterBody.translation().y - (point.y + 1.1);

      if (diff < 0.0) {
        yDirection = lerp(0, Math.abs(diff), 0.5);
      }
    }

    characterController.computeColliderMovement(collider, {
      x: position[0],
      y: yDirection,
      z: position[2],
    });

    const correctMovement = characterController.computedMovement();

    characterBody.setLinvel(correctMovement, true);

    let { x, y, z } = characterBody.translation();

    // console.log("🚀 ~ file: index.ts:46 ~ import ~ { x, y, z } :", { x, y, z });

    position[0] = x;
    position[1] = y;
    position[2] = z;

    let buffers = world.debugRender();

    self.postMessage({
      ge: "a",
      vertices: buffers.vertices,
      colors: buffers.colors,
    });

    self.postMessage({ position, delta });
  };

  const handleJumpBody = () => {
    // storedFall = -40;
  };

  const handleAddBlockToWorld = ({ position }: { position: Float32Array }) => {
    console.log(
      "🚀 ~ file: index.ts:115 ~ handleAddBlockToWorld ~ position:",
      position
    );
    let grounddesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      position[0],
      position[1],
      position[2]
    );
    let groundBody = world.createRigidBody(grounddesc);

    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(1, 1, 1);
    world.createCollider(groundColliderDesc, groundBody);
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
    eventMapping[e.data.type]?.(e.data.payload);
  };
});

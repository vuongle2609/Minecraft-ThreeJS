import { lerp } from "three/src/math/MathUtils";

import("@dimforge/rapier3d").then((RAPIER) => {
  let gravity = { x: 0.0, y: -9.81, z: 0.0 };
  let world = new RAPIER.World(gravity);

  let rigidBodyDesc = new RAPIER.RigidBodyDesc(
    RAPIER.RigidBodyType.KinematicPositionBased
  ).setTranslation(0, 50, 0);

  let characterBody = world.createRigidBody(rigidBodyDesc);

  let colliderDescCharacter = RAPIER.ColliderDesc.capsule(1, 1);
  let colliderCharacter = world.createCollider(
    colliderDescCharacter,
    characterBody
  );

  let offset = 0.01;
  let characterController = world.createCharacterController(offset);
  characterController.disableAutostep();
  characterController.setUp({ x: 0, y: 1, z: 0 });

  const raw = -20;
  let vy = raw;

  let ray = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
  let maxToi = 1;
  let solid = false;

  const getBodyProperties = ({
    position,
    delta,
  }: {
    position: Float32Array;
    delta: number;
  }) => {
    characterController.computeColliderMovement(colliderCharacter, {
      x: position[0],
      y: position[1] + vy * delta,
      z: position[2],
    });

    if (vy > raw) {
      vy -= 1;
    }

    // let hit = world.castRayAndGetNormal(ray, maxToi, solid);
    let hitWithNormal = world.castRayAndGetNormal(ray, maxToi, solid);
    if (hitWithNormal != null) {
      // The first collider hit has the handle `hit.colliderHandle` and it hit after
      // the ray travelled a distance equal to `ray.dir * toi`.
      let hitPoint = ray.pointAt(hitWithNormal.toi);
      console.log(
        "Collider",
        hitWithNormal
      );
    }

    const correctMovement = characterController.computedMovement();

    const newPos = characterBody.translation();

    newPos.x += correctMovement.x;
    newPos.y += correctMovement.y;
    newPos.z += correctMovement.z;

    characterBody.setNextKinematicTranslation(newPos);

    let { x, y, z } = characterBody.translation();

    position[0] = x;
    position[1] = y;
    position[2] = z;

    ray.origin = { x, y, z };
    ray.dir = { x, y: y - 3, z };

    self.postMessage({ position, delta });

    world.step();
  };

  const handleJumpBody = () => {
    vy = 20;
  };

  const handleAddBlockToWorld = ({ position }: { position: Float32Array }) => {
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

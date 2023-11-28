import("@dimforge/rapier3d").then((RAPIER) => {
  let gravity = { x: 0.0, y: -9.81, z: 0.0 };
  let world = new RAPIER.World(gravity);

  let rigidBodyDesc = new RAPIER.RigidBodyDesc(
    RAPIER.RigidBodyType.KinematicPositionBased
  ).setTranslation(0, 10, 0);

  let characterBody = world.createRigidBody(rigidBodyDesc);

  let colliderDescCharacter = RAPIER.ColliderDesc.capsule(1, 0.5);
  let colliderCharacter = world.createCollider(
    colliderDescCharacter,
    characterBody
  );

  let offset = 0.01;
  let characterController = world.createCharacterController(offset);
  characterController.setUp({ x: 0, y: 1, z: 0 });

  // get all bodies position
  const getBodyProperties = ({
    position,
    delta,
  }: {
    position: Float32Array;
    delta: number;
  }) => {
    world.step();

    characterController.computeColliderMovement(colliderCharacter, {
      x: position[0],
      y: position[1],
      z: position[2],
    });

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

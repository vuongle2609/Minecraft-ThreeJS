const dispatchWorkerAction = (key: string, payload: any) => {
  const object = { key, payload };
  //@ts-ignore
  window.worker.postMessage(object);
};

export default dispatchWorkerAction;

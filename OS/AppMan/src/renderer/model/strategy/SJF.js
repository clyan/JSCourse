const SJF = data => {
  const list = data.sort((a, b) => {
    return a.needTime - b.needTime;
  });
  return list;
};

export default SJF;

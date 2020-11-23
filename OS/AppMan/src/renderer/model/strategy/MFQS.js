const MFQS = (data, vm) => {
  let backTwo = vm.$store.getters.feedBackTwoQueue;
  let backThree = vm.$store.getters.feedBackThreeQueue;

  const list = data.sort((a, b) => {
    return a.arriveTime - b.arriveTime;
  });
  return list;
};
export default MFQS;

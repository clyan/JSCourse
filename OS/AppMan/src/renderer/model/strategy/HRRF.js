import PCB from "../PCB";
const HRRF = (data, vm = {}) => {
  if (vm.$store.getters.runQueueIsEmpty && data.length > 1) {
    return data.sort((a, b) => {
      return a.arriveTime - b.arriveTime;
    });
  }
  let startCurr = vm.$store.getters.runQueue[0];
  let list = null;
  if (data.length > 0) {
    list = data.map((item, index) => {
      let R =
        1 +
        (startCurr.arriveTime + startCurr.needTime - item.arriveTime) /
          item.needTime;
      console.log();

      let i = new PCB(item);
      i.setHrrf(R);
      return i;
    });
    if (list.length > 1) {
      const hrrnArr = list.sort((a, b) => {
        return b.hrrf - a.hrrf;
      });
      return hrrnArr;
    }
    return list;
  }
  return data;
};

export default HRRF;

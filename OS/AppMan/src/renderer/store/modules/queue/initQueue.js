import Queue from "@/util/Queue";
const state = {
  initQueue: new Queue() //活动就绪
};

const getters = {
  initQueue: state => state.initQueue.getQueue(),
  initQLength: state => state.initQueue.length()
};
const mutations = {
  ADD_INITQUEUE(state, progress) {
    const initQueue = Object.assign(new Queue(), state.initQueue);
    initQueue.enQueue(progress);
    state.initQueue = initQueue;
  },
  RESET_INITQUEUE(state, progress) {
    const initQueue = new Queue();
    for (let i = 0; i < progress.length; i++) {
      initQueue.enQueue(progress[i]);
    }
    state.initQueue = initQueue;
  },
  DELETE_INITQUEUE(state, progress = null) {
    state.initQueue.deQueue(progress);
    const initQueue = Object.assign(new Queue(), state.initQueue);
    state.initQueue = initQueue;
  }
};

const actions = {
  addInitQueue({ commit }, pro) {
    commit("ADD_INITQUEUE", pro);
  },
  deleteInitQueue({ commit }, pro) {
    commit("DELETE_INITQUEUE", pro);
  },
  resetInitQueue({ commit }, pro) {
    commit("RESET_INITQUEUE", pro);
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};

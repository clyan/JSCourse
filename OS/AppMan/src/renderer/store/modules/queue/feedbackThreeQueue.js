import Queue from "@/util/Queue";
const state = {
  feedBackThreeQueue: new Queue(), //活动就绪
  fdThreeTimeSlice: 15
};

const getters = {
  feedBackThreeQueue: state => state.feedBackThreeQueue.getQueue(),
  feedThreeLength: state => state.feedBackThreeQueue.length(),
  fdThreeTimeSlice: state => state.fdThreeTimeSlice
};
const mutations = {
  REST_FDTHREETIMESLICE(state, progress) {
    state.fdThreeTimeSlice = 15;
  },
  ADD_FEEDBACKTHREEQUEUE(state, progress) {
    const feedBackThreeQueue = Object.assign(
      new Queue(),
      state.feedBackThreeQueue
    );
    feedBackThreeQueue.enQueue(progress);
    state.feedBackThreeQueue = feedBackThreeQueue;
  },
  RESET_FEEDBACKTHREEQUEUE(state, progress) {
    const feedBackThreeQueue = new Queue();
    for (let i = 0; i < progress.length; i++) {
      feedBackThreeQueue.enQueue(progress[i]);
    }

    state.feedBackThreeQueue = feedBackThreeQueue;
  },
  DELETE_FEEDBACKTHREEQUEUE(state, progress = null) {
    state.feedBackThreeQueue.deQueue(progress);
    const feedBackThreeQueue = Object.assign(
      new Queue(),
      state.feedBackThreeQueue
    );
    state.feedBackThreeQueue = feedBackThreeQueue;
  }
};

const actions = {
  addFeedBackThreeQueue({ commit }, pro) {
    commit("ADD_FEEDBACKTHREEQUEUE", pro);
  },
  deleteFeedBackThreeQueue({ commit }, pro) {
    commit("DELETE_FEEDBACKTHREEQUEUE");
  },
  resetFeedBackThreeQueue({ commit }, pro) {
    commit("RESET_FEEDBACKTHREEQUEUE", pro);
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};

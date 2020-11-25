import Queue from "@/util/Queue";
const state = {
  feedBackTwoQueue: new Queue(), //活动就绪
  fdTwoTimeSlice: 10
};

const getters = {
  feedBackTwoQueue: state => state.feedBackTwoQueue.getQueue(),
  feedBackTwoLength: state => state.feedBackTwoQueue.length(),
  fdTwoTimeSlice: state => state.fdTwoTimeSlice
};
const mutations = {
  REST_FDTWOTIMESLICE(state, progress) {
    state.fdTwoTimeSlice = 10;
  },
  ADD_FEEDBACKTWOQUEUE(state, progress) {
    const feedBackTwoQueue = Object.assign(new Queue(), state.feedBackTwoQueue);
    feedBackTwoQueue.enQueue(progress);
    state.feedBackTwoQueue = feedBackTwoQueue;
  },
  RESET_FEEDBACKTWOQUEUE(state, progress) {
    const feedBackTwoQueue = new Queue();
    for (let i = 0; i < progress.length; i++) {
      feedBackTwoQueue.enQueue(progress[i]);
    }

    state.feedBackTwoQueue = feedBackTwoQueue;
  },
  SET_FDTWOTIMESLICE(state, time) {
    state.fdTwoTimeSlice = time;
  },
  DELETE_FEEDBACKTWOQUEUE(state, progress = null) {
    state.feedBackTwoQueue.deQueue(progress);
    const feedBackTwoQueue = Object.assign(new Queue(), state.feedBackTwoQueue);
    state.feedBackTwoQueue = feedBackTwoQueue;
  }
};

const actions = {
  addFeedBackTwoQueue({ commit }, pro) {
    commit("ADD_FEEDBACKTWOQUEUE", pro);
  },
  deleteFeedBackTwoQueue({ commit }, pro) {
    commit("DELETE_FEEDBACKTWOQUEUE");
  },
  resetFeedBackTwoQueue({ commit }, pro) {
    commit("RESET_FEEDBACKTWOQUEUE", pro);
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};

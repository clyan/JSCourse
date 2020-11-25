import Queue from "@/util/Queue";
import System from "@/model/System";
import PCB from "@/model/PCB";
import activityBlock from "./queue/activityBlockQueue";
import initQueue from "./queue/initQueue";
import activityReady from "./queue/activityReadyQueue";
import feedBackTwo from "./queue/feedbacktwoQueue";
import feedBackThree from "./queue/feedbackThreeQueue";
import pending from "./queue/pendingQueue";
import finish from "./queue/finishQueue";
import run from "./queue/runQueue";
import Status from "../../model/ProgressStatus";
import initData from "../../model/initData";
import Policy from "../../model/Policy";
const state = {
  systemer: null, //全局系统控制
  isStart: false, //判断系统是否开始调度
  timer: null, //全局定时器
  globalTime: 0, //全局定时时间
  pid: initData.length + 1, //全局pid，初始化设置为,初始值的长度（注意initData的）
  timeSlice: 5, //时间片，用于时间轮转算法
  finishMusic: null,
  unwatch: function() {},
  ...activityBlock.state,
  ...activityReady.state,
  ...pending.state,
  ...finish.state,
  ...run.state,
  ...feedBackTwo.state,
  ...feedBackThree.state,
  ...initQueue.state
};

const getters = {
  systemer: state => state.systemer,
  isStart: state => state.isStart,
  globalTime: state => state.globalTime,
  pid: state => state.pid,
  timeSlice: state => state.timeSlice,
  ...activityBlock.getters,
  ...activityReady.getters,
  ...pending.getters,
  ...finish.getters,
  ...run.getters,
  ...feedBackTwo.getters,
  ...feedBackThree.getters,
  ...initQueue.getters
};

const mutations = {
  PLAY_MUSIC(state) {
    state.finishMusic.play();
  },
  SET_FINISHMUSIC(state, vm) {
    state.finishMusic = vm;
  },
  SET_SYSTEMER(state, vm) {
    this.commit("CLEAR_ALL_QUEUE");
    state.systemer = new System(vm);
  },
  SET_UNWATCHER(state, vm) {
    state.unwatch = vm;
  },
  CLOSE_UNWATCHER(state, vm) {
    state.unwatch();
  },
  SET_TRUE_ISSTART(state, vm) {
    state.isStart = true;
  },
  Add_TIME(state) {
    state.globalTime += 1;
  },
  SET_TIMER(state, timer) {
    state.timer = window.setInterval(() => {
      this.commit("Add_TIME");
    }, 1000);
  },
  DEL_TIMER(state) {
    state.timer = null;
    state.globalTime = 0;
    state.isStart = false;
  },
  SET_TIMESLICE(state, time) {
    this.commit("SET_FDTWOTIMESLICE", 2 * time);
    this.commit("SET_FDTHREETIMESLICE", 3 * time);
    state.timeSlice = time;
  },
  SET_FALSE_ISSTART(state, vm) {
    state.isStart = false;
    this.commit("CLOSE_UNWATCHER");
    window.clearInterval(state.timer);
    state.timer = null;
  },
  SET_PCB_TOPENDING(state, vm) {
    const pcb = new PCB(vm);
    const status = pcb.toPending();
    switch (status) {
      case Status.ACTIVITY_READY:
        this.commit("DELETE_ACTIVITYREADYQUEUE", pcb);
        this.commit("ADD_STATICREADYQUEUE", pcb);
        break;
      case Status.ACTIVITY_BLOCK:
        this.commit("DELETE_ACTIVITYBLOCKQUEUE", pcb);
        this.commit("ADD_STATICBLOCKQUEUE", pcb);
        break;
      case Status.RUN:
        this.commit("DELETE_RUNQUEUE", pcb);
        this.commit("ADD_STATICREADYQUEUE", pcb);
        break;
    }
  },
  SET_PCB_TOREADY(state, vm) {
    const pcb = new PCB(vm);
    const status = pcb.toReady();
    switch (status) {
      case Status.STATIC_READY:
        this.commit("DELETE_STATICREADYQUEUE", pcb);
        this.commit("ADD_ACTIVITYREADYQUEUE", pcb);
        break;
      case Status.STATIC_BLOCK:
        this.commit("DELETE_STATICBLOCKQUEUE", pcb);
        this.commit("ADD_ACTIVITYBLOCKQUEUE", pcb);
        break;
      case Status.ACTIVITY_BLOCK:
        this.commit("DELETE_ACTIVITYBLOCKQUEUE", pcb);
        this.commit("ADD_ACTIVITYREADYQUEUE", pcb);
        break;
    }
  },
  SET_PCB_TOACTIVEBLOCK(state, vm) {
    const pcb = new PCB(vm.pcb);
    pcb.toActivityBlock(vm.time, state.globalTime);
    this.commit("DELETE_RUNQUEUE", pcb);
    this.commit("ADD_ACTIVITYBLOCKQUEUE", pcb);
  },
  CLEAR_ALL_QUEUE(state, vm) {
    state.runQueue = new Queue(1);
    state.activityBlockQueue = new Queue();
    state.initQueue = new Queue();
    state.activityReadyQueue = new Queue();
    state.pendingQueue = new Queue();
    state.finishQueue = new Queue();
  },
  ADD_NEWPCB(state, pro) {
    this.commit("ADD_ACTIVITYREADYQUEUE", pro);
  },
  ADD_PID(state) {
    state.pid++;
  },
  ...activityBlock.mutations,
  ...activityReady.mutations,
  ...pending.mutations,
  ...finish.mutations,
  ...run.mutations,
  ...feedBackTwo.mutations,
  ...feedBackThree.mutations,
  ...initQueue.mutations
};

const actions = {
  setSystemer({ commit }, pro) {
    commit("SET_SYSTEMER", pro);
  },
  setTrueIsStart({ commit }, pro) {
    commit("SET_TRUE_ISSTART");
  },
  setFalseIsStart({ commit }, pro) {
    commit("SET_FALSE_ISSTART");
  },
  addTime({ commit }) {
    commit("Add_TIME");
  },
  setTimer({ commit }) {
    commit("SET_TIMER");
  },
  delTimer({ commit }) {
    commit("DEL_TIMER");
  },
  setTimeSlice({ commit }, time) {
    commit("SET_TIMESLICE", time);
  },
  setPcbToPending({ commit }, pro) {
    commit("SET_PCB_TOPENDING", pro);
  },
  setPcbToReady({ commit }, pro) {
    commit("SET_PCB_TOREADY", pro);
  },
  clearAllQueue({ commit }, pro) {
    commit("CLEAR_ALL_QUEUE", pro);
  },
  setFinishMusic({ commit }, pro) {
    commit("SET_FINISHMUSIC", pro);
  },
  playMusic({ commit }) {
    commit("PLAY_MUSIC");
  },
  ...activityBlock.actions,
  ...activityReady.actions,
  ...pending.actions,
  ...finish.actions,
  ...run.actions,
  ...feedBackTwo.actions,
  ...feedBackThree.actions,
  ...initQueue.actions
};

export default {
  state,
  mutations,
  getters,
  actions
};

import dataList from "./initData";
import Status from "./ProgressStatus";
import Policy from "./Policy";
import PCB from "./PCB";
import { HRRF, HRRN, RR, MFQS, SJF, HPF, FCFS } from "./strategy";

const swithPolicy = (vm, sourceData) => {
  let data = null;
  switch (vm.$store.state.PolicyControl.SchedulingPolicy) {
    case Policy.FCFS:
      data = FCFS(sourceData);
      break;
    case Policy.SJF:
      data = SJF(sourceData);
      break;
    case Policy.RR:
      data = RR(sourceData);
      break;
    case Policy.HPF:
      data = HPF(sourceData);
      break;
    case Policy.HRRF:
      data = HRRF(sourceData, vm);
      break;
    case Policy.HRRN:
      data = HRRN(sourceData);
      break;
    case Policy.MFQS:
      data = MFQS(sourceData, vm);
      break;
    default:
      throw new Error("类型错误，请检查");
      break;
  }
  return data;
};

class System {
  constructor(vm) {
    this._init(vm);
  }
  _init(vm) {
    const Pcbs = dataList.map(item => new PCB(item));
    const data = swithPolicy(vm, Pcbs);
    let cacheList = [];
    const $Store = vm.$store;
    data.forEach((item, index) => {
      switch (item.status) {
        case Status.INITREADY:
          if ($Store.state.System.globalTime >= item.arriveTime) {
            let ite = new PCB(item);
            ite.setStatus(Status.ACTIVITY_READY);
            $Store.commit("ADD_ACTIVITYREADYQUEUE", ite);
          } else {
            cacheList.push(item);
          }
          break;
        case Status.ACTIVITY_READY:
          $Store.commit("ADD_ACTIVITYREADYQUEUE", item);
          break;
        case Status.ACTIVITY_BLOCK:
          $Store.commit("ADD_ACTIVITYBLOCKQUEUE", item);
          break;
        case Status.STATIC_BLOCK:
          $Store.commit("ADD_STATICBLOCKQUEUE", item);
          break;
        case Status.STATIC_READY:
          $Store.commit("ADD_STATICREADYQUEUE", item);
          break;
        case Status.FINISH:
          $Store.commit("ADD_FINISHQUEUE", item);
          break;
        case Status.RUN:
          $Store.commit("ADD_RUNQUEUE", item);
          break;
        default:
          throw new Error("类型错误，请检查");
          break;
      }
    });
    cacheList.sort((a, b) => {
      return a.arriveTime > b.arriveTime;
    });
    $Store.commit("RESET_INITQUEUE", cacheList);
  }
  changePolicy() {}
  createGlobalTimer(vm, State, cb) {
    let timer = null;
    const $Store = vm.$store;
    timer = window.setInterval(() => {
      $Store.commit("RESET_INITQUEUE");
    }, 1000);

    if (State.timer == null) {
      $Store.commit("SET_TIMER", timer);
    }
    cb();
  }
  StartScheduling(vm) {
    switch (vm.$store.state.PolicyControl.SchedulingPolicy) {
      case Policy.FCFS:
      case Policy.SJF:
      case Policy.RR:
      case Policy.HPF:
      case Policy.HRRF:
      case Policy.HRRN:
        this.rrExec(vm);
        break;
      case Policy.MFQS:
        this.mfqsExec(vm);
        break;
      default:
        throw new Error("类型错误，请检查");
        break;
    }
  }
  execToReady(vm, val) {
    const State = vm.$store.state.System;
    const $Store = vm.$store;
    for (let i = 0; i < $Store.getters.initQueue.length; i++) {
      if (val > $Store.getters.initQueue[i].arriveTime) {
        let ite = new PCB($Store.getters.initQueue[i]);
        ite.setStatus(Status.ACTIVITY_READY);
        $Store.commit("DELETE_INITQUEUE", ite);
        $Store.commit("ADD_ACTIVITYREADYQUEUE", ite);
      }
    }
  }
  execIo(vm, val) {
    const State = vm.$store.state.System;
    const $Store = vm.$store;
    for (let i = 0; i < $Store.getters.activityBlockQueue.length; i++) {
      let activityBlockQueue = $Store.getters.activityBlockQueue[i];

      if (val > activityBlockQueue.startIoTime + activityBlockQueue.ioTime) {
        let ite = new PCB($Store.getters.activityBlockQueue[i]);
        ite.setStatus(Status.ACTIVITY_READY);
        $Store.commit("DELETE_ACTIVITYBLOCKQUEUE", ite);
        $Store.commit("ADD_ACTIVITYREADYQUEUE", ite);
      }
    }
  }
  mfqsExec(vm) {
    const State = vm.$store.state.System;
    const $Store = vm.$store;
    let first = true;
    let HRRFFirst = true;
    let timer = null;
    let timeCache = 0;
    if (State.isStart) {
      const f = () => {
        if (
          !State.activityReadyQueue.isEmpty() ||
          !State.feedBackTwoQueue.isEmpty() ||
          !State.feedBackThreeQueue.isEmpty()
        ) {
          if (first) {
            timer = window.setInterval(() => {
              $Store.commit("Add_TIME");
            }, 1000);

            if (State.timer == null) {
              $Store.commit("SET_TIMER", timer);
            }
            first = false;
          }
          let out = false;
          let unwatch = vm.$watch("$store.state.System.globalTime", val => {
            //将未到达队列中的已到达，放入就绪队列中
            this.execToReady(vm, val);
            //执行IO进程
            this.execIo(vm, val);
            //如果当前没有运行中的进程，则添加进程
            if (!out) {
              let obj = null;
              //多级队列按情况添加与删除
              if (!State.activityReadyQueue.isEmpty()) {
                obj = new PCB(State.activityReadyQueue.Front());
                if (val > obj.arriveTime) {
                  $Store.commit("DELETE_ACTIVITYREADYQUEUE");
                  obj.setStatus(Status.RUN);
                  $Store.commit("ADD_RUNQUEUE", obj);
                  out = true;
                }
              } else if (!State.feedBackTwoQueue.isEmpty()) {
                obj = new PCB(State.feedBackTwoQueue.Front());
                if (val > obj.arriveTime) {
                  $Store.commit("DELETE_FEEDBACKTWOQUEUE");
                  obj.setStatus(Status.RUN);
                  $Store.commit("ADD_RUNQUEUE", obj);
                  out = true;
                }
              } else if (!State.feedBackThreeQueue.isEmpty()) {
                obj = new PCB(State.feedBackThreeQueue.Front());
                if (val > obj.arriveTime) {
                  $Store.commit("DELETE_FEEDBACKTHREEQUEUE");
                  obj.setStatus(Status.RUN);
                  $Store.commit("ADD_RUNQUEUE", obj);
                  out = true;
                }
              }
            } else {
              let runObj = State.runQueue.Front();
              // 停止调度
              if (runObj.status !== Status.RUN) {
                unwatch();
                $Store.commit("DELETE_RUNQUEUE");
                f();
              } else if (!runObj.isFinish()) {
                let runObj1 = new PCB(runObj);
                if (runObj1.level == 1) {
                  if (timeCache >= vm.$store.state.System.timeSlice) {
                    $Store.commit("DELETE_RUNQUEUE");
                    runObj1.setStatus(Status.ACTIVITY_READY);
                    runObj1.setLevel(2);
                    $Store.commit("ADD_FEEDBACKTWOQUEUE", runObj1);
                    timeCache = 0;
                  } else {
                    runObj1.setElapsedCpuTime(1);
                    ++timeCache;
                    $Store.commit("DELETE_RUNQUEUE");
                    $Store.commit("ADD_RUNQUEUE", runObj1);
                  }
                } else if (runObj1.level == 2) {
                  console.log("bbb");
                  if (timeCache >= vm.$store.state.System.fdTwoTimeSlice) {
                    $Store.commit("DELETE_RUNQUEUE");
                    runObj1.setStatus(Status.DELETE_FEEDBACKTWOQUEUE);
                    runObj1.setLevel(3);
                    $Store.commit("ADD_FEEDBACKTHREEQUEUE", runObj1);
                    timeCache = 0;
                  } else {
                    runObj1.setElapsedCpuTime(1);
                    ++timeCache;
                    $Store.commit("DELETE_RUNQUEUE");
                    $Store.commit("ADD_RUNQUEUE", runObj1);
                  }
                } else if (runObj1.level == 3) {
                  if (
                    !State.feedBackThreeQueue.isEmpty() &&
                    timeCache >= vm.$store.state.System.fdThreeTimeSlice
                  ) {
                    $Store.commit("DELETE_FEEDBACKTHREEQUEUE");
                    runObj1.setStatus(Status.ACTIVITY_READY);
                    $Store.commit("ADD_RUNQUEUE", runObj1);
                    timeCache = 0;
                  } else {
                    runObj1.setElapsedCpuTime(1);
                    ++timeCache;
                    $Store.commit("DELETE_RUNQUEUE");
                    $Store.commit("ADD_RUNQUEUE", runObj1);
                  }
                }
              } else {
                timeCache = 0;
                unwatch();
                let runObj = new PCB(State.runQueue.Front());
                runObj.setStatus(Status.FINISH);

                $Store.commit("ADD_FINISHQUEUE", runObj);
                $Store.commit("DELETE_RUNQUEUE");
                $Store.commit("PLAY_MUSIC");
                f();
              }
            }
          });
        } else {
          $Store.commit("SET_FALSE_ISSTART");
          clearInterval(timer);
          return;
        }
      };
      f();
    }
  }
  rrExec(vm) {
    const State = vm.$store.state.System;
    const $Store = vm.$store;
    let first = true;
    let HRRFFirst = true;
    let timer = null;
    let timeCache = 0;
    if (State.isStart) {
      const f = () => {
        if (!State.activityReadyQueue.isEmpty()) {
          if (first) {
            timer = window.setInterval(() => {
              $Store.commit("Add_TIME");
            }, 1000);

            if (State.timer == null) {
              $Store.commit("SET_TIMER", timer);
            }
            first = false;
          }
          let out = false;
          let unwatch = vm.$watch("$store.state.System.globalTime", val => {
            //将未到达队列中的已到达，放入就绪队列中
            this.execToReady(vm, val);
            //执行IO进程
            this.execIo(vm, val);
            //如果当前没有运行中的进程，则添加进程
            if (!out) {
              const obj = new PCB(State.activityReadyQueue.Front());
              if (val > obj.arriveTime) {
                $Store.commit("DELETE_ACTIVITYREADYQUEUE");
                obj.setStatus(Status.RUN);
                $Store.commit("ADD_RUNQUEUE", obj);
                out = true;
                //如果当前是HRRF算法，则在
                if (
                  vm.$store.state.PolicyControl.SchedulingPolicy == Policy.HRRF
                ) {
                  const data = HRRF(vm.$store.getters.activityReadyQueue, vm);
                  $Store.commit("DELETE_ACTIVITYREADYQUEUE");
                  $Store.commit("RESET_ACTIVITYREADYQUEUE", data);
                }
              }
            } else {
              let runObj = State.runQueue.Front();
              // 停止调度
              if (runObj.status !== Status.RUN) {
                unwatch();
                $Store.commit("DELETE_RUNQUEUE");
                f();
              } else if (!runObj.isFinish()) {
                let runObj1 = new PCB(runObj);
                //当前是否是时间轮转
                if (
                  vm.$store.state.PolicyControl.SchedulingPolicy == Policy.RR
                ) {
                  if (
                    !State.activityReadyQueue.isEmpty() &&
                    timeCache >= vm.$store.state.System.timeSlice
                  ) {
                    timeCache = 0;
                    runObj1.setStatus(Status.ACTIVITY_READY);
                    $Store.commit("DELETE_RUNQUEUE");
                    $Store.commit("ADD_ACTIVITYREADYQUEUE", runObj1);
                  } else {
                    timeCache++;
                    runObj1.setElapsedCpuTime(1);
                    $Store.commit("DELETE_RUNQUEUE");
                    $Store.commit("ADD_RUNQUEUE", runObj1);
                  }
                } else {
                  runObj1.setElapsedCpuTime(1);
                  $Store.commit("DELETE_RUNQUEUE");
                  $Store.commit("ADD_RUNQUEUE", runObj1);
                }
              } else {
                if (
                  vm.$store.state.PolicyControl.SchedulingPolicy == Policy.RR
                ) {
                  timeCache = 0;
                }
                unwatch();
                let runObj = new PCB(State.runQueue.Front());
                runObj.setStatus(Status.FINISH);
                $Store.commit("ADD_FINISHQUEUE", runObj);
                $Store.commit("DELETE_RUNQUEUE");
                $Store.commit("PLAY_MUSIC");
                if ($Store.state.PolicyControl.SchedulingPolicy == Policy.HPF) {
                  let data = HPF($Store.getters.activityReadyQueue);
                  $Store.commit("RESET_ACTIVITYREADYQUEUE", data);
                }
                f();
              }
            }
          });
        } else {
          $Store.commit("SET_FALSE_ISSTART");
          clearInterval(timer);
          return;
        }
      };
      f();
    }
  }
  create() {}
}
export default System;

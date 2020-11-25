<template>
  <div>
    <a-table
            rowKey="pid"
            :columns="ColumnsData"
            :pagination="false"
            :data-source="dataList"
            :scroll="{ x: 0, y: 390  }"
    >
    <span slot="status" slot-scope="elapsedCpuTime, record">
      <span style="padding: 4px;background: gold;color: #fff;">{{ elapsedCpuTime }} </span>
    </span>
    <span slot="status" slot-scope="status,record">
        <span v-if="status == progressStatus.RUN">
          运行中
        </span>
    </span>
  <span slot="action" slot-scope="text, record">
    <a-button type="primary" @click="showModal(record)">
      I/O
    </a-button>
    <a-button type="danger" @click="pending(record)">
      挂起
    </a-button>
    </span>
    </a-table>

  <io-modal :visible="visible" :PCB="PCB" @execIo="execIo" @cancelModal="cancelModal"></io-modal>
  </div>
</template>
<script>
  import Policy from "../../model/Policy";

  let  currStatus = '';
import columns from "@/model/Column"
  import {mapGetters, mapActions, mapMutations, mapState} from 'vuex';
import progressStatus from "@/mixin/progressStatus"
  import IoModal from "../ioModal";
export default {
  name: "ProgressList",
  mixins:[progressStatus],
  components:{
    IoModal
  },
  data() {
    return {
      Policy,
      visible: false,
      PCB: {}
    };
  },
  methods:{
    showModal(record) {
      this.PCB = record;
      this.visible = true;
      this.startRun()
    },
    cancelModal() {
      this.visible = false;
      this.startRun()
    },
    execIo(da) {
      this.cancelModal();
      this.startRun()
    },
    startRun() {
      if (!this.isStart) {
        this.setTrueIsStart();
        this.systemer.StartScheduling(this);
      } else {
        this.setFalseIsStart();
      }
    },
    pending(PCB) {
      this.setPcbToPending(PCB)
    },
    execIo(time,pcb) {
      this.SET_PCB_TOACTIVEBLOCK({pcb , time})
      this.cancelModal()
    },
    ...mapMutations(["SET_PCB_TOACTIVEBLOCK"]),
    ...mapActions(["setPcbToPending","setTrueIsStart", "setFalseIsStart",])
  },
  computed:{
    ColumnsData(){
      if(this.getSchedulingPolicy === Policy.HRRF ) {
        return columns;
      } else {
        return columns.filter((item, index)=> {
          return item.dataIndex !== 'hrrf' && item.dataIndex !== 'ioTime'
        })
      }
    },
    ...mapGetters({
        dataList: 'runQueue',
      getSchedulingPolicy:"getSchedulingPolicy",
      isStart: "isStart"
    }),
    ...mapState({
      systemer: state => state.System.systemer
    }),
  }
};
</script>

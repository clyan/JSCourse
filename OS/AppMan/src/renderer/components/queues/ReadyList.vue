<template>
  <div>
    <h2 v-if="isMFQS">一级队列 <b>时间片：</b> <span>{{timeSlice}}</span></h2>
    <a-table
            rowKey="pid"
            :columns="ColumnsData"
            :pagination="false"
            :data-source="dataList"
            :scroll="{ x: 0, y: 390  }"
    >
    <span slot="status" slot-scope="status, record">
      <span v-if="status == progressStatus.ACTIVITY_READY">
        活动就绪
      </span>
    </span>
    <span slot="action" slot-scope="text, record">
      <a-button type="danger"  @click="pending(record)">
        挂起
      </a-button>
      </span>
    </a-table>
    <template v-if="isMFQS">
      <h2>二级队列 <b>时间片：</b> <span>{{fdTwoTimeSlice}}</span></h2>
      <a-table
              rowKey="pid"
              :columns="ColumnsData"
              :pagination="false"
              :data-source="fbTwoList"
              :scroll="{ x: 0, y: 390  }"
      >
    <span slot="status" slot-scope="elapsedCpuTime, record">
      <span style="padding: 4px;background: gold;color: #fff;">{{ elapsedCpuTime }} </span>
    </span>
        <span slot="status" slot-scope="status,record">
        <span v-if="status == progressStatus.ACTIVITY_READY">
          活动就绪
        </span>
    </span>
        <span slot="action" slot-scope="text, record">
    <a-button type="danger" @click="pending(record)">
      挂起
    </a-button>
    </span>
      </a-table>
      <h2>三级队列   <b>时间片：</b> <span>{{fdThreeTimeSlice}}</span> </h2>
      <a-table
              rowKey="pid"
              :columns="ColumnsData"
              :pagination="false"
              :data-source="fbThreeList"
              :scroll="{ x: 0, y: 390  }"
      >
    <span slot="status" slot-scope="elapsedCpuTime, record">
      <span style="padding: 4px;background: gold;color: #fff;">{{ elapsedCpuTime }} </span>
    </span>
    <span slot="status" slot-scope="status,record">
        <span v-if="status == progressStatus.ACTIVITY_READY">
          活动就绪
        </span>
    </span>
    <span slot="action" slot-scope="text, record">
      <a-button type="danger" @click="pending(record)">
        挂起
      </a-button>
    </span>
      </a-table>
    </template>
  </div>
</template>
<script>
  import Policy from "../../model/Policy";
  import progressStatus from "@/mixin/progressStatus"
  import columns from "@/model/Column"
  import {mapActions, mapGetters} from 'vuex';
  export default {
    name: "ReadyList",
    mixins:[progressStatus],
    data() {
      return {
        Policy
      };
    },
    methods:{
      pending(PCB) {
        this.setPcbToPending(PCB)
      },
      ...mapActions(["setPcbToPending"])
    },
    computed:{
      ColumnsData(){
        if(this.getSchedulingPolicy === Policy.HRRF ) {
          return columns;
        } else {
          return columns.filter((item, index)=> {
            return item.dataIndex !== 'hrrf'
          })
        }
      },
      isMFQS(){
        return this.getSchedulingPolicy === Policy.MFQS
      },
      ...mapGetters({
        dataList: 'activityReadyQueue',
        fbTwoList: 'feedBackTwoQueue',
        fbThreeList: 'feedBackThreeQueue',
        getSchedulingPolicy: 'getSchedulingPolicy',
        fdTwoTimeSlice: 'fdTwoTimeSlice',
        fdThreeTimeSlice: 'fdThreeTimeSlice',
        timeSlice:'timeSlice'
      })
    },
    mounted() {

    }
  };
</script>

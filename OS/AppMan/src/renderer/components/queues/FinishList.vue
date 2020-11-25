<template>
  <div>
    <a-table rowKey="pid"
      :columns="ColumnsData"
      :pagination="false"
      :data-source="dataList"
      :scroll="{ x: 0, y: 390  }"
    >
    <span slot="status" slot-scope="status,record">
    <span style="color:green" v-if="status == progressStatus.FINISH">
      已完成
    </span>
    </span>
    </a-table>
  </div>
</template>
<script>
import progressStatus from "@/mixin/progressStatus";
import columns from "../../model/Column";
import { mapGetters } from "vuex";

export default {
  name: "FinishList",
  mixins: [progressStatus],
  data() {
    return {
      columns
    };
  },
  computed: {
    ColumnsData(){
      return columns.filter((item, index)=> {
        return item.dataIndex !== 'hrrf' && item.dataIndex !== 'ioTime'
      })
    },
    ...mapGetters({
      dataList: "finishQueue"
    })
  },
  mounted() {
  }
};
</script>

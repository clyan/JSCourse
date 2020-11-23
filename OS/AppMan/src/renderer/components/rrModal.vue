<template>
  <a-modal
    title="设置时间片"
    :visible="visibleRr"
    :confirm-loading="confirmLoading"
    :centered="true"
    okText="确定"
    cancelText="取消"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      class="ant-advanced-search-form"
      :labelCol="{ span: 6, offset: 0 }"
      :wrapperCol="{ span: 18, offset: 0 }"
    >
      <a-row>
        <a-col :span="24">
          <a-form-item label="时间片时间">
            <a-input-number
              v-model="rrTime"
              :min="0"
              v-decorator="[
                'name',
                {
                  rules: [
                    {
                      required: true,
                      message: '时间片不能为空'
                    }
                  ]
                }
              ]"
              placeholder="例2"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
export default {
  name: "rrModal",
  props: ["visibleRr"],
  data() {
    return {
      confirmLoading: false,
      rrTime: 5
    };
  },
  methods: {
    handleOk(e) {
      this.confirmLoading = true;
      this.$emit("okRr", this.rrTime);
    },
    handleCancel(e) {
      this.rrTime = 5;
      this.$emit("cancelRrModal");
    }
  }
};
</script>

<style scoped></style>

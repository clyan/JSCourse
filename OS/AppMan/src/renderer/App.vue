<template>
  <div id="app">
    <audio :src="au" id="au" ref="au"></audio>
    <router-view></router-view>
  </div>
</template>

<script>
import au from "@/assets/1.mp3";
import System from "./model/System";
import { mapActions } from "vuex";
export default {
  name: "appman",
  data() {
    return {
      au
    };
  },
  methods: {
    ...mapActions(["setFinishMusic"]),
    initMusic() {
      this.$refs.au.addEventListener("canplay", () => {
        this.setFinishMusic(this.$refs.au);
      });
    }
  },
  mounted() {
    this.initMusic();
  }
};
</script>

<style>
/* CSS */
</style>

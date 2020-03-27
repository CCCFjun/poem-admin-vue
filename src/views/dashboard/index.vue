<template>
  <div :class="['dashboard-container',{'dashboard-padding' : device !=='mobile'}]">
    <div class="admin_info">
      <el-col :span="6">
        <box-card />
      </el-col>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PanThumb from '@/components/PanThumb'
import BoxCard from './components/BoxCard'

export default {
  name: 'Dashboard',
  components: {
    PanThumb,
    BoxCard
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'device'
    ])
  }
}
</script>

<style type="text/scss" rel="stylesheet/scss" lang="scss" scoped>
  .dashboard {
    &-container {
      background-image: url(../../assets/images/bashbg.png);
      // background-color: rgb(190,216,210);
      min-height: 93vh;
    }
    &-padding {
      padding: 50px 60px 0px;
    }
  }
</style>

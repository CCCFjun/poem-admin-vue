<template>
  <div class="app-container">
    <div style="display: flex;justify-content: center;margin-bottom: 20px">
      <el-button v-waves :loading="downloadLoading" style="background-color: #4ab7bd;border-color: #4ab7bd" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        请先下载单选题上传模板
      </el-button>
    </div>
    <div  style="display: flex;justify-content: center;margin-bottom: 10px">
      <span>注意:百里挑一题选项请以字母开头，眼花缭乱题选项仅单字</span>
    </div>
    <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
    <el-table :data="tableData" border highlight-current-row style="width: 100%;margin-top:20px;">
      <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
    </el-table>
  </div>
</template>

<script>
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import waves from '@/directive/waves' // Waves directive
import { reqInsertSingleList } from '@/api/bankManage'
export default {
  name: 'SingleUpload',
  components: { UploadExcelComponent },
  directives: { waves },
  data() {
    return {
      downloadLoading: false,
      tableData: [],
      tableHeader: []
    }
  },
  methods: {
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '(必填)题目内容',
          '(必填)选项A',
          '(必填)选项B',
          '选项C',
          '选项D',
          '选项E',
          '选项F',
          '选项G',
          '(必填)题目答案(填写对应答案字符)',
          '答案解析',
          '(必填)所属题型(百里挑一填12,眼花缭乱填14,抽丝剥茧15)'
        ]
        excel.export_json_to_excel({
          header: tHeader,
          data: [],
          filename: '单选题上传模板'
        })
        this.downloadLoading = false
      })
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1

      if (isLt1M) {
        return true
      }

      this.$message({
        message: '请上传小于1M的文件',
        type: 'warning'
      })
      return false
    },
    handleSuccess({ results, header }) {
      const singleList = []
      results.forEach((item, index) => {
        const single = {}
        Object.keys(item).forEach((key) => {
          if (key === '(必填)题目内容') {
            single.singleContent = item[key]
          }
          if (key === '(必填)选项A') {
            single.choiceA = item[key]
          }
          if (key === '(必填)选项B') {
            single.choiceB = item[key]
          }
          if (key === '选项C') {
            single.choiceC = item[key]
          }
          if (key === '选项D') {
            single.choiceD = item[key]
          }
          if (key === '选项E') {
            single.choiceE = item[key]
          }
          if (key === '选项F') {
            single.choiceF = item[key]
          }
          if (key === '选项G') {
            single.choiceG = item[key]
          }
          if (key === '(必填)题目答案(填写对应答案字符)') {
            single.singleAnswer = item[key]
          }
          if (key === '答案解析') {
            single.answerExplain = item[key]
          }
          if (key === '(必填)所属题型(百里挑一填12,眼花缭乱填14,抽丝剥茧15)') {
            single.langId = item[key]
          }
        })
        singleList.push(single)
      })
      this.insertSingleList(singleList)
      this.tableData = results
      this.tableHeader = header
    },
    // 插入数据库单选题表
    async insertSingleList(singleList) {
      const result = await reqInsertSingleList(singleList)
      if (result.statu === 0) {
        this.$message({
          message: result.msg,
          type: 'success'
        })
      } else {
        this.$message({
          message: result.msg,
          type: 'error'
        })
      }
    }
  }
}
</script>

<style lang="stylus" type="text/stylus" rel="stylesheet/stylus" scoped>

</style>

<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.langName" placeholder="搜索题型名称" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-right: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :default-sort = "{prop: 'tno', order: 'ascending'}"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="序号" prop="tno" align="center" width="50">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="题型名称" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.langName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="题型描述" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.langDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="imgCreateTime" sortable label="题型最后更新时间" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.langChangeTime">{{ scope.row.langChangeTime | date-format }}</span>
          <span v-else>暂无更新记录</span>
        </template>
      </el-table-column>
      <el-table-column prop="queCount" sortable label="题目数" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.queCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" width="160">
        <template slot-scope="{row}">
          <el-button type="primary" icon="el-icon-edit" circle @click="handleUpdate(row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogFormVisible" :title="dialogStatus">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="题型名称" prop="langName">
          <el-input v-model="temp.langName" />
        </el-form-item>
        <el-form-item label="题型描述" prop="langDesc">
          <el-input v-model="temp.langDesc" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateData">
          确认编辑
        </el-button>
      </div>
    </el-dialog>

    <!--可自定义按钮的样式、show/hide临界点、返回的位置  -->
    <!--如需文字提示，可在外部添加element的<el-tooltip></el-tooltip>元素  -->
    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :custom-style="myBackToTopStyle" :visibility-height="300" :back-position="50" transition-name="fade" />
    </el-tooltip>
  </div>
</template>

<script>
import { reqGetTypesList, reqSearchTypesList, reqDeleteType, reqInsertTypeInfo, reqUpdateTypeInfo } from '@/api/Type'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import BackToTop from '@/components/BackToTop'
export default {
  name: 'TypeTable',
  components: { Pagination, BackToTop },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      previewList: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        langName: undefined,
        langDesc: undefined,
        langCreatedBy: undefined
      },
      temp: {
        langName: '',
        langDesc: '',
        langImgSrc: '',
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogRotationImgVisible: false,
      rules: {
        langName: [{ required: true, message: '题型名称为必填项', trigger: 'change' }],
        langDesc: [{ required: true, message: '题型描述为必填项', trigger: 'change' }]
      },
      myBackToTopStyle: {
        right: '50px',
        bottom: '50px',
        width: '40px',
        height: '40px',
        'border-radius': '4px',
        'line-height': '45px', // 请保持与高度一致以垂直居中 Please keep consistent with height to center vertically
        background: '#e7eaf1'// 按钮的背景颜色 The background color of the button
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      const result = await reqGetTypesList()
      if (result.statu === 0) {
        this.total = result.data.length
        this.list = result.data.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
      }
      // 延迟0.5秒等待请求数据
      setTimeout(() => {
        this.listLoading = false
      }, 500)
    },
    async handleFilter() {
      this.listQuery.page = 1
      this.listLoading = true
      const result = await reqSearchTypesList(this.listQuery.langName)
      if (result.statu === 0) {
        this.total = result.data.length
        this.list = result.data.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
      }
      // 延迟一秒等待请求数据
      setTimeout(() => {
        this.listLoading = false
      }, 500)
    },
    resetTemp() {
      this.temp = {
        langName: '',
        langDesc: '',
        langImgSrc: '',
      }
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // 复制对象
      this.dialogStatus = '编辑'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.handleUpdateType()
        }
      })
    },
    async handleUpdateType() {
      const temp = this.temp
    //   const admin = this.$store.state.admin.userInfo
    //   temp.langLastChanger = admin.admName
      const result = await reqUpdateTypeInfo(temp)
      if (result.statu === 0) {
        this.dialogFormVisible = false
        this.$message({
          message: result.msg,
          type: 'success'
        })
        this.getList()
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
<style rel="stylesheet/scss" lang="scss" type="text/scss" scoped>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 80px;
    height: 80px;
    line-height: 80px;
    text-align: center;
  }
  .avatar {
    width: 80px;
    height: 80px;
    display: block;
  }
</style>

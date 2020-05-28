<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.userPhone" placeholder="搜索手机号" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.userName" placeholder="搜索用户名" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.userSex" placeholder="搜索性别" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in userSexOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" style="margin-right: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <!-- <el-button v-waves class="filter-item" style="margin-left: 0;margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="handleCreate">
        添加
      </el-button> -->
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :default-sort = "{prop: 'userPhone', order: 'ascending'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="手机号" prop="userPhone" sortable align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.userPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" align="center" width="140">
        <template slot-scope="scope">
          <viewer>
            <img :src="scope.row.userImgSrc || require('@/assets/images/profile.jpg')" style="width: 40px;height: 40px;border-radius: 5px">
          </viewer>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.userSex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="签名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userIntroduction }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" width="140">
        <template slot-scope="{row}">
          <el-button v-waves type="primary" icon="el-icon-setting" size="mini" @click="confirmUpdatePsw(row)">
            重置密码
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogFormVisible" title="添加">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="手机号" prop="userPhone">
          <el-input v-model="temp.userPhone" />
        </el-form-item>
        <el-form-item label="密码" prop="userPsw">
          <el-input v-model="temp.userPsw" />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="temp.userName" />
        </el-form-item>
        <el-form-item label="性别" prop="userSex">
          <el-select v-model="temp.userSex" class="filter-item">
            <el-option v-for="item in userSexOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createData">
          确认添加
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
/* eslint-disable */
import { reqGetUserList, reqUpdateUserInfo, reqSearchUserList, reqInsertUserInfo } from '@/api/user'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import BackToTop from '@/components/BackToTop'

export default {
  name: 'InfoTable',
  components: { Pagination, BackToTop },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userPhone: undefined,
        userName: undefined,
        userSex: undefined
      },
      userSexOptions: [{ label: '男', key: '男' }, { label: '女', key: '女' }],
      temp: {
        userPhone: '',
        userPsw: '123456',
        userName: '',
        userSex:'男'
      },
      dialogFormVisible: false,
      rules: {
        userPhone: [{ required: true, message: '手机号为必填项', trigger: 'blur' },{ min: 11, max: 11, message: '手机号必须为11位数字', trigger: 'blur' }],
        userPsw: [{ required: true, message: '密码为必填项，默认设置密码为123456', trigger: 'blur' }],
        userName: [{ required: true, message: '用户名为必填项', trigger: 'blur' }],
        userSex: [{ required: true, message: '性别为必填项，默认选择男', trigger: 'blur' }]
      },
      downloadLoading: false,
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
      let result = await reqGetUserList()
      if (result.statu === 0){
        this.total = result.data.length
        this.list = result.data.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
      }
      // 延迟0.5秒等待请求数据
      setTimeout(() => {
        this.listLoading = false
      }, 500)
    },
    confirmUpdatePsw(row) {
      this.$confirm('确定重置密码吗?重置后默认密码为123456', '提示', {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleUpdatePsw(row)
      }).catch(() => {
      })
    },
    async handleUpdatePsw(row) {
      row.userPsw = 'e10adc3949ba59abbe56e057f20f883e' //md5加密的123456
      let result = await reqUpdateUserInfo(row)
      if (result.statu === 0){
        this.$message({
          message: '重置密码成功，默认密码为123456',
          type: 'success'
        })
      } else {
        this.$message({
          message: result.msg,
          type: 'error'
        })
      }
    },
    async handleFilter(){
      this.listQuery.page = 1
      this.listLoading = true
      if(this.listQuery.userSex == ""){
        this.listQuery.userSex = undefined
      }
      let result = await reqSearchUserList(this.listQuery.userPhone, this.listQuery.userName, this.listQuery.userSex)
      if (result.statu === 0){
        this.total = result.data.length
        this.list = result.data.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
      }
      // 延迟一秒等待请求数据
      setTimeout(() => {
        this.listLoading = false
      }, 500)
    },
    resetTemp(){
      this.temp = {
        userPhone: '',
        userPsw: '123456',
        userName: '',
        userSex:'男'
      }
    },
    handleCreate(){
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData(){
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.insertUserInfo()
        }
      })
    },
    async insertUserInfo(){
      let result = await reqInsertUserInfo(this.temp)
      if (result.statu === 0){
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '添加成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      } else {
        this.$notify({
          title: '失败',
          message: result.msg,
          type: 'error',
          duration: 2000
        })
      }
    }
  }
}
</script>

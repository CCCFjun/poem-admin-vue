<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.content"
        placeholder="搜索帖子内容"
        clearable
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.labelFlag"
        placeholder="搜索帖子分类"
        clearable
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in labelOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        style="margin-right: 10px;"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
      <!-- <el-button
        v-waves
        class="filter-item"
        style="margin-left: 0;margin-right: 10px;"
        type="primary"
        icon="el-icon-circle-plus-outline"
        @click="handleCreate"
      >添加帖子类型</el-button> -->
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :default-sort="{prop: 'pid', order: 'ascending'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
    <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label>
              <span>{{ scope.row.title }}</span>
            </el-form-item>
            <el-form-item label>
              <span>{{ scope.row.content }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{scope.$index + 1}} </span>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center" show-overflow-tooltip="">
        <template slot-scope="scope">
          <span>{{ scope.row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者账号" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.userPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="initTime" sortable label="发布时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.initTime | date-format }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="replayCount" sortable label="回复数" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.replayCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" width="160">
        <template slot-scope="{row}">
          <el-button
            v-waves
            type="danger"
            icon="el-icon-delete"
            circle
            @click="confirmDeletePost(row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :visible.sync="dialogFormVisible" :title="dialogStatus">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="类型名" prop="labelName">
          <el-input v-model="temp.labelName" :rows="2" type="textarea" />
        </el-form-item>
        <el-form-item label="类型描述" prop="labelDetail">
          <el-input v-model="temp.labelDetail" :rows="3" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="createData()"
        >确认添加</el-button>
      </div>
    </el-dialog>

    <!--可自定义按钮的样式、show/hide临界点、返回的位置  -->
    <!--如需文字提示，可在外部添加element的<el-tooltip></el-tooltip>元素  -->
    <el-tooltip placement="top" content="返回顶部">
      <back-to-top
        :custom-style="myBackToTopStyle"
        :visibility-height="300"
        :back-position="50"
        transition-name="fade"
      />
    </el-tooltip>
  </div>
</template>

<script>
import { reqGetPostList, reqSearchPostList, reqDeletePost } from "@/api/forum";
import waves from "@/directive/waves"; // Waves directive
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination
import BackToTop from "@/components/BackToTop";

export default {
  name: "FillInfo",
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
        limit: 10,
        content: undefined,
        labelFlag: undefined,
      },
      labelOptions: [
        { label: "题目贴", key: "1" },
        { label: "闲话贴", key: "2" }
      ],
      temp: {
        labelName: "",
        labelDetail: ""
      },
      dialogFormVisible: false,
      dialogStatus: "",
      rules: {
        labelName: [
          { required: true, message: "类型名称为必填项", trigger: "change" }
        ]
      },
      downloadLoading: false,
      myBackToTopStyle: {
        right: "50px",
        bottom: "50px",
        width: "40px",
        height: "40px",
        "border-radius": "4px",
        "line-height": "45px", // 请保持与高度一致以垂直居中 Please keep consistent with height to center vertically
        background: "#e7eaf1" // 按钮的背景颜色 The background color of the button
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    async getList() {
      this.listLoading = true;
      const result = await reqGetPostList();
      if (result.statu === 0) {
        this.total = result.data.length;
        this.list = result.data.filter(
          (item, index) =>
            index < this.listQuery.limit * this.listQuery.page &&
            index >= this.listQuery.limit * (this.listQuery.page - 1)
        );
      }
      this.listLoading = false;
    },
    async handleFilter() {
      this.listQuery.page = 1;
      this.listLoading = true;
      let labelFlag = this.listQuery.labelFlag;
      if (
        this.listQuery.labelFlag === null ||
        this.listQuery.labelFlag === undefined ||
        this.listQuery.labelFlag === ""
      ) {
        labelFlag = 0;
      }
      const result = await reqSearchPostList(
        this.listQuery.content,
        labelFlag
      );
      if (result.statu === 0) {
        this.total = result.data.length;
        this.list = result.data.filter(
          (item, index) =>
            index < this.listQuery.limit * this.listQuery.page &&
            index >= this.listQuery.limit * (this.listQuery.page - 1)
        );
      }
      this.listLoading = false;
    },
    resetTemp() {
      this.temp = {
        labelName: "",
        labelDetail: ""
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "添加题目";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.insertFillInfo();
        }
      });
    },
    confirmDeletePost(row) {
      this.$confirm("确定删除该贴吗?", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
            this.handleDeletePost(row);
        })
        .catch(() => {});
    },
    async handleDeletePost(row) {
      const pid = row.pid;
      console.log(pid)
      const result = await reqDeletePost(pid);
      if (result.statu === 0) {
        this.$message({
          message: result.msg,
          type: "success"
        });
        this.getList();
      } else {
        this.$message({
          message: result.msg,
          type: "error"
        });
      }
    }
  }
};
</script>
<style rel="stylesheet/scss" lang="scss" type="text/scss" scoped>
.demo-table-expand {
  font-size: 0;
  label {
    width: 90px;
    color: #99a9bf;
  }
  .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 100%;
  }
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 280px;
  height: 80px;
  line-height: 80px;
  text-align: center;
}
.avatar {
  width: 280px;
  height: 80px;
  display: block;
}
</style>

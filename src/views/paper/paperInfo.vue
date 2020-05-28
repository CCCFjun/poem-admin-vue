<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.paperName"
        placeholder="搜索试卷名称"
        clearable
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <!-- <el-select v-model="listQuery.langId" placeholder="搜索题型" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in langOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>-->
      <el-select
        v-model="listQuery.paperType"
        placeholder="搜索试卷类型"
        clearable
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in paperTypeOptions"
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
      <el-button
        v-waves
        class="filter-item"
        style="margin-left: 0;margin-right: 10px;"
        type="primary"
        icon="el-icon-edit-outline"
        @click="handleFixedCreate"
      >固定组卷</el-button>
      <el-button
        v-waves
        class="filter-item"
        style="margin-left: 0;margin-right: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >随机组卷</el-button>
      <div>
        <span style="color: #FF0000">
          <i class="el-icon-warning" style="margin-right: 10px" />鼠标右键单击选中行可查看试卷详情
        </span>
      </div>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :default-sort="{prop: 'id', order: 'ascending'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @row-contextmenu="seePaperDetail"
    >
      <el-table-column label="序号" prop="id" align="center" width="60">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="试卷名称" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.paperName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="试卷图像" align="center">
        <template slot-scope="scope">
          <viewer>
            <img :src="scope.row.paperImgSrc" style="width: 100px;height: 50px">
          </viewer>
        </template>
      </el-table-column>
      <el-table-column prop="paperDuration" sortable label="考试时长" align="center" width="110">
        <template slot-scope="scope">
          <span>{{ scope.row.paperDuration/60 }}分钟</span>
        </template>
      </el-table-column>
      <el-table-column label="注意事项" width="120" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.paperAttention || '暂无注意事项' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="paperType" label="试卷类型" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.paperType===1?'随机组卷':'固定组卷' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalNum" sortable label="题数" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.totalNum }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="participateNum" sortable label="参加人数" align="center" width="110">
        <template slot-scope="scope">
          <span>{{ scope.row.participateNum }}人</span>
        </template>
      </el-table-column>
      <el-table-column prop="paperCreateTime" sortable label="试卷创建时间" align="center" width="155">
        <template slot-scope="scope">
          <span>{{ scope.row.paperCreateTime | date-format }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" width="100">
        <template slot-scope="{row}">
          <el-button
            v-waves
            type="danger"
            icon="el-icon-delete"
            circle
            @click="confirmDeletePaper(row)"
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

    <!--查看试卷详情弹出框-->
    <el-dialog
      :visible.sync="paperDetailDialogFormVisible"
      :title="clickPaperTitle"
      style="margin-bottom: 20px"
    >
      <div
        style="height: 50px;line-height: 50px;margin-top: -35px;color: #ff9e8c"
      >{{ subPaperTitle }}</div>
      <div
        style="height: 50px;line-height: 50px;margin-top: -20px;color: #00d2c9"
      >{{ minSubPaperTitle }}</div>
      <el-input v-model="filterText" placeholder="查找试卷问题关键字" style="margin-bottom:30px;" />
      <el-tree
        ref="paperDataTree"
        :data="paperData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        class="filter-tree"
      />
    </el-dialog>

    <!--固定组卷弹出框-->
    <el-dialog :visible.sync="fixedDialogFormVisible" title="固定组卷" style="margin-bottom: 20px">
      <el-form
        ref="fixedDataForm"
        :rules="fixRules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="试卷名称" prop="paperName">
          <el-input v-model="temp.paperName" />
        </el-form-item>
        <el-form-item label="考试时长" prop="paperDuration">
          <el-time-select
            v-model="temp.paperDuration"
            :picker-options="{
              start: '00:10',
              step: '00:10',
              end: '01:00'
            }"
            placeholder="选择时间(时:分)"
          />
        </el-form-item>
        <el-form-item label="试卷封面" prop="paperImgSrc">
          <el-upload
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            class="avatar-uploader"
            action="http://localhost:8085/api/admin/uploadPicture"
          >
            <img v-if="temp.paperImgSrc" :src="temp.paperImgSrc" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
          <el-button
            v-waves
            :disabled="!temp.paperImgSrc"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deletePictureSrc"
          >删除</el-button>
        </el-form-item>
        <el-form-item label="注意事项" prop="paperAttention">
          <el-input v-model="temp.paperAttention" type="textarea" />
        </el-form-item>
        <div style="width: 600px">
          <el-input v-model="fixedFilterText" placeholder="查找试卷问题关键字" style="margin-bottom:30px;" />
          <el-tree
            ref="fixedPaperDataTree"
            :data="fixedPaperData"
            :props="defaultProps"
            :filter-node-method="filterNode"
            show-checkbox
            class="filter-tree"
          />
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fixedDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="fixedCreateData">确认发布</el-button>
      </div>
    </el-dialog>

    <!--随机组卷弹出框-->
    <el-dialog :visible.sync="dialogFormVisible" title="随机组卷" style="margin-bottom: 20px">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="试卷名称" prop="paperName">
          <el-input v-model="temp.paperName" />
        </el-form-item>
        <el-form-item label="考试时长" prop="paperDuration">
          <el-time-select
            v-model="temp.paperDuration"
            :picker-options="{
              start: '00:10',
              step: '00:10',
              end: '01:00'
            }"
            placeholder="选择时间(时:分)"
          />
        </el-form-item>
        <el-form-item label="试卷封面" prop="paperImgSrc">
          <el-upload
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            class="avatar-uploader"
            action="http://localhost:8085/api/admin/uploadPicture"
          >
            <img v-if="temp.paperImgSrc" :src="temp.paperImgSrc" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
          <el-button
            v-waves
            :disabled="!temp.paperImgSrc"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deletePictureSrc"
          >删除</el-button>
        </el-form-item>
        <el-form-item label="注意事项" prop="paperAttention">
          <el-input v-model="temp.paperAttention" type="textarea" />
        </el-form-item>
        <el-form-item label="百里挑一数量" prop="singleNum">
          <el-input-number v-model="temp.singleNum" :max="30" />
        </el-form-item>
        <el-form-item label="分秒必争数量" prop="judgeNum">
          <el-input-number v-model="temp.judgeNum" :max="20" />
        </el-form-item>
        <el-form-item label="承上启下数量" prop="fillNum">
          <el-input-number v-model="temp.fillNum" :max="30" />
        </el-form-item>
        <el-form-item label="画中有话数量" prop="fillTwoNum">
          <el-input-number v-model="temp.fillTwoNum" :max="30" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="createData">确认发布</el-button>
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
/* eslint-disable */
import {
  reqGetPapersList,
  reqSearchPapersList,
  reqDeletePaper,
  reqPaperQueDetailByPaperId,
  reqRandomInsertPaperInfo,
  reqFixedInsertPaperInfo,
  reqPaperQueDetailByLangId,
  reqUpload
} from "@/api/paper";
import { reqGetFillList } from "@/api/bankManage";
import waves from "@/directive/waves"; // Waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination
import BackToTop from "@/components/BackToTop";

export default {
  name: "PaperInfo",
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
        paperName: undefined,
        paperType: undefined
      },
      langOptions: [],
      paperTypeOptions: [
        { label: "随机组卷", key: "1" },
        { label: "固定组卷", key: "2" }
      ],
      temp: {
        paperName: "",
        paperDuration: "",
        paperAttention: "",
        singleScore: 1,
        singleNum: undefined,
        // multipleScore: undefined,
        // multipleNum: undefined,
        judgeScore: 1,
        judgeNum: undefined,
        fillScore: 1,
        fillNum: undefined,
        fillTwoNum: undefined,
        paperImgSrc: undefined
      },
      fixedDialogFormVisible: false,
      dialogFormVisible: false,
      paperDetailDialogFormVisible: false,
      clickPaperTitle: "",
      subPaperTitle: "",
      minSubPaperTitle: "",
      filterText: "",
      fixedFilterText: "",
      paperData: [],
      fixedPaperData: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      fixRules: {
        paperName: [
          { required: true, message: "试卷名称为必填项", trigger: "change" }
        ],
        paperDuration: [
          { required: true, message: "考试时长为必填项", trigger: "change" }
        ],
        paperImgSrc: [
          { required: true, message: '请上传试卷图像', trigger: 'change' }
        ]
      },
      rules: {
        paperName: [
          { required: true, message: "试卷名称为必填项", trigger: "change" }
        ],
        paperDuration: [
          { required: true, message: "考试时长为必填项", trigger: "change" }
        ],
        paperImgSrc: [
          { required: true, message: '请上传试卷图像', trigger: 'change' }
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
  watch: {
    filterText(val) {
      this.$refs.paperDataTree.filter(val);
    },
    fixedFilterText(val) {
      this.$refs.fixedPaperDataTree.filter(val);
    }
  },
  created() {
    this.getList();
  },
  methods: {
    async getList() {
      this.listLoading = true;
      let result = await reqGetPapersList();
      if (result.statu === 0) {
        this.langOptions = result.data.langOptions;
        this.total = result.data.papersList.length;
        this.list = result.data.papersList.filter(
          (item, index) =>
            index < this.listQuery.limit * this.listQuery.page &&
            index >= this.listQuery.limit * (this.listQuery.page - 1)
        );
      }
      // 延迟0.5秒等待请求数据
      setTimeout(() => {
        this.listLoading = false;
      }, 500);
    },
    async seePaperDetail(row, column, event) {
      // 阻止鼠标右键默认事件
      event.preventDefault();
      let result = await reqPaperQueDetailByPaperId(row.paperId, row.totalNum);
      let singleOneData = result.data.singleOneData;
      let judgeOneData = result.data.judgeOneData;
      let fillOneData = result.data.fillOneData;
      let fillTwoData = result.data.fillTwoData;
      //初始化数据
      this.filterText = "";
      this.clickPaperTitle = `试卷详情：${row.paperName}`;
      this.subPaperTitle = `试卷总题数：${row.totalNum}道。`;
      // this.minSubPaperTitle = `单选题${row.singleNum}道（每道${row.singleScore}分），多选题${row.multipleNum}道（每道${row.multipleScore}分），判断题${row.judgeNum}道（每道${row.judgeScore}分），填空题${row.fillNum}道（每道${row.fillScore}分）。`
      this.minSubPaperTitle = `百里挑一${row.singleNum}道，分秒必争${row.judgeNum}道，承上启下${row.fillNum}道，画中有话${fillTwoData.length}道。`;
      this.paperData = [
        {
          id: 1,
          label: "百里挑一",
          children: singleOneData
        },
        {
          id: 2,
          label: "分秒必争",
          children: judgeOneData
        },
        {
          id: 3,
          label: "承上启下",
          children: fillOneData
        },
        {
          id: 4,
          label: "画中有话",
          children: fillTwoData
        }
      ];
      // 显示弹出对话框
      this.paperDetailDialogFormVisible = true;
    },
    confirmDeletePaper(row) {
      this.$confirm("若试卷已有学生考试则无法删除，确定删除该试卷吗?", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.deletePaper(row);
        })
        .catch(() => {});
    },
    async deletePaper(row) {
      let result = await reqDeletePaper(row.paperId);
      if (result.statu === 0) {
        this.$message({
          message: "删除成功",
          type: "success"
        });
        this.getList();
      } else {
        this.$message({
          message: result.msg,
          type: "error"
        });
      }
    },
    async handleFilter() {
      this.listQuery.page = 1;
      this.listLoading = true;
      // let langId = this.listQuery.langId;
      // if (
      //   this.listQuery.langId === null ||
      //   this.listQuery.langId === undefined
      // ) {
      //   langId = 0;
      // }
      let paperType = this.listQuery.paperType;
      if (
        this.listQuery.paperType === null ||
        this.listQuery.paperType === undefined ||
        this.listQuery.paperType === ""
      ) {
        paperType = 0;
      }
      let result = await reqSearchPapersList(
        this.listQuery.paperName,
        paperType
      );
      if (result.statu === 0) {
        this.total = result.data.length;
        this.list = result.data.filter(
          (item, index) =>
            index < this.listQuery.limit * this.listQuery.page &&
            index >= this.listQuery.limit * (this.listQuery.page - 1)
        );
      }
      // 延迟一秒等待请求数据
      setTimeout(() => {
        this.listLoading = false;
      }, 500);
    },
    resetTemp() {
      this.temp = {
        paperName: "",
        paperDuration: "",
        paperAttention: "",
        singleScore: 1,
        singleNum: undefined,
        // multipleScore: undefined,
        // multipleNum: undefined,
        judgeScore: 1,
        judgeNum: undefined,
        fillScore: 1,
        fillNum: undefined,
        paperImgSrc: undefined
      };
    },
    handleFixedCreate() {
      this.fixedFilterText = "";
      this.fixedPaperData = [];
      this.resetTemp();
      this.fixedDialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["fixedDataForm"].clearValidate();
      });
      this.getAllQueDetail();
    },
    async getAllQueDetail() {
      let result = await reqPaperQueDetailByLangId();
      let singleData = result.data.singleData;
      // let multipleData = singleResult.data.multipleData
      let judgeData = result.data.judgeData;
      let fillData = result.data.fillData;
      let fillTwoData = result.data.fillTwoData;
      //初始化数据
      this.fixedFilterText = "";
      this.fixedPaperData = [
        {
          id: 1,
          label: "百里挑一",
          children: singleData
        },
        {
          id: 2,
          label: "分秒必争",
          children: judgeData
        },
        {
          id: 3,
          label: "承上启下",
          children: fillData
        },
        {
          id: 4,
          label: "画中有话",
          children: fillTwoData
        }
      ];
    },
    fixedCreateData() {
      this.$refs["fixedDataForm"].validate(valid => {
        if (valid) {
          let checkedData = this.$refs.fixedPaperDataTree.getCheckedNodes();
          // 过滤掉题型名称列表四个id值
          let filtercheckedData = checkedData.filter(item => {
            return item.id > 4;
          });
          if (filtercheckedData.length > 0) {
            let singleNum = [];
            // let multipleNum = []
            let judgeNum = [];
            let fillNum = [];
            let fillTwoNum = [];
            filtercheckedData.forEach((item, index) => {
              let firstStr = String(item.id).substring(0, 1);
              let restStr = String(item.id).substring(1);
              if (firstStr === "1") {
                singleNum.push(Number(restStr));
              }
              // if (firstStr === '2') {
              //   multipleNum.push((Number)(restStr))
              // }
              else if (firstStr === "2") {
                judgeNum.push(Number(restStr));
              } else if (firstStr === "3") {
                fillNum.push(Number(restStr));
              } else if (firstStr === "4") {
                fillTwoNum.push(Number(restStr));
              }
            });
            this.temp.singleNum = singleNum;
            // this.temp.multipleNum = multipleNum
            this.temp.judgeNum = judgeNum;
            this.temp.fillNum = fillNum;
            this.temp.fillTwoNum = fillTwoNum;
            this.fixedInsertPaperInfo();
          } else {
            this.$message({
              message: "请勾选题目，如果该题型题目紧缺请选择其他题型组卷",
              type: "error"
            });
          }
        }
      });
    },
    async fixedInsertPaperInfo() {
      let arr = this.temp.paperDuration.split(":");
      this.temp.paperDuration =
        parseInt(arr[0]) * 60 * 60 + parseInt(arr[1]) * 60;
      let result = await reqFixedInsertPaperInfo(this.temp);
      if (result.statu === 0) {
        this.fixedDialogFormVisible = false;
        this.$notify({
          title: "成功",
          message: "试卷发布成功",
          type: "success",
          duration: 2000
        });
        this.getList();
      } else {
        this.$notify({
          title: "失败",
          message: result.msg,
          type: "error",
          duration: 2000
        });
      }
    },
    handleCreate() {
      this.resetTemp();
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.randomInsertPaperInfo();
        }
      });
    },
    async randomInsertPaperInfo() {
      let arr = this.temp.paperDuration.split(":");
      this.temp.paperDuration =
        parseInt(arr[0]) * 60 * 60 + parseInt(arr[1]) * 60;
      let result = await reqRandomInsertPaperInfo(this.temp);
      if (result.statu === 0) {
        this.dialogFormVisible = false;
        this.$notify({
          title: "成功",
          message: "试卷发布成功",
          type: "success",
          duration: 2000
        });
        this.getList();
      } else {
        this.$notify({
          title: "失败",
          message: result.msg,
          type: "error",
          duration: 2000
        });
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleAvatarSuccess(res, file) {
      
      // this.temp.pictureSrc = URL.createObjectURL(file.raw)
      this.temp.paperImgSrc = res.data;
    },
    beforeAvatarUpload(file) {
      const isType =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/gif";
      const isLt4M = file.size / 1024 / 1024 < 4;

      if (!isType) {
        this.$message.error("上传头像图片只能是 JPG/PNG/GIF 格式!");
      }
      if (!isLt4M) {
        this.$message.error("上传头像图片大小不能超过 4MB!");
      }
      // let reader = new FileReader();
      // reader.readAsDataURL(file)
      // let imgUrlBase64;
      // let t;
      // reader.onload = function(){
      //   reqUpload(this.result);
      // }
      // console.log(t)
      // await reqUpload({file: imgUrlBase64});
      return isType && isLt4M;
    },
    deletePictureSrc() {
      this.temp.paperImgSrc = "";
    }
  }
};
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
  border-color: #409eff;
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
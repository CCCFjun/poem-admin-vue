<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.feedbackContent"
        placeholder="搜索留言内容"
        clearable
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <!-- <el-input v-model="listQuery.userName" placeholder="搜索留言人" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.admAnswer" placeholder="搜索回复内容" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.admName" placeholder="搜索回复人" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.feedbackStatus" placeholder="搜索留言回复状态" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in recommendOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>-->
      <el-button
        v-waves
        class="filter-item"
        style="margin-right: 10px;"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :default-sort="{prop: 'tno', order: 'ascending'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" prop="tno" sortable align="center" width="80">
        <template slot-scope="scope">
          <el-badge :is-dot="scope.row.feedbackStatus === '0'" style="margin-top: 10px">
            <span>{{ scope.row.id }}</span>
          </el-badge>
        </template>
      </el-table-column>
      <el-table-column label="留言内容" align="center">
        <template slot-scope="scope">
          <span v-html="scope.row.feedbackContent.replace(/\#[\u4E00-\u9FA5]{1,3}\;/gi, emotion)" />
        </template>
      </el-table-column>
      <el-table-column prop="feedbackCreateTime" sortable label="留言时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.feedbackCreateTime | date-format }}</span>
        </template>
      </el-table-column>
      <el-table-column label="留言人" align="center" width="100">
        <template slot-scope="scope">
          <div>{{ scope.row.userName }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" width="180">
        <template slot-scope="{row}">
          <div style="margin-top: 10px">
            <el-button size="small" v-if="row.feedbackStatus === '0'" @click="handleRead(row)">未读</el-button>
            <el-button v-waves v-else size="mini" disabled>已读</el-button>
            <el-button
              v-waves
              type="danger"
              icon="el-icon-delete"
              circle
              @click="confirmDeleteFeedback(row)"
            ></el-button>
          </div>
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
import {
  reqGetFeedbacksList,
  reqSearchFeedbacksList,
  reqDeleteFeedback,
  reqReadFeedbacks
} from "@/api/feedback";
import waves from "@/directive/waves"; // Waves directive
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination
import BackToTop from "@/components/BackToTop";
import Emotion from "@/components/Emotion";
export default {
  name: "FeedbackTable",
  components: { Pagination, BackToTop, Emotion },
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
        feedbackContent: undefined,
        feedbackStatus: undefined
      },

      myBackToTopStyle: {
        right: "50px",
        bottom: "50px",
        width: "40px",
        height: "40px",
        "border-radius": "4px",
        "line-height": "45px", // 请保持与高度一致以垂直居中 Please keep consistent with height to center vertically
        background: "#e7eaf1" // 按钮的背景颜色 The background color of the button
      },
      showEmotion: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    async getList() {
      this.listLoading = true;
      const result = await reqGetFeedbacksList();
      if (result.statu === 0) {
        this.total = result.data.length;
        this.list = result.data.filter(
          (item, index) =>
            index < this.listQuery.limit * this.listQuery.page &&
            index >= this.listQuery.limit * (this.listQuery.page - 1)
        );
      }
      // 延迟0.5秒等待请求数据
      setTimeout(() => {
        this.listLoading = false;
      }, 0);
    },
    confirmDeleteFeedback(row) {
      this.$confirm("确定删除该留言吗?", "提示", {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.handleDeleteFeedback(row);
        })
        .catch(() => {});
    },
    async handleDeleteFeedback(row) {
      const result = await reqDeleteFeedback(row.feedbackId);
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
      const result = await reqSearchFeedbacksList(
        this.listQuery.feedbackContent
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
    async handleRead(row) {
      const result = await reqReadFeedbacks(row.feedbackId);
      if (result.statu === 0) {
        this.getList();
      }
    },
    // 将匹配结果替换表情图片
    emotion(res) {
      const word = res.replace(/\#|\;/gi, "");
      const list = [
        "微笑",
        "撇嘴",
        "色",
        "发呆",
        "得意",
        "流泪",
        "害羞",
        "闭嘴",
        "睡",
        "大哭",
        "尴尬",
        "发怒",
        "调皮",
        "呲牙",
        "惊讶",
        "难过",
        "酷",
        "冷汗",
        "抓狂",
        "吐",
        "偷笑",
        "可爱",
        "白眼",
        "傲慢",
        "饥饿",
        "困",
        "惊恐",
        "流汗",
        "憨笑",
        "大兵",
        "奋斗",
        "咒骂",
        "疑问",
        "嘘",
        "晕",
        "折磨",
        "衰",
        "骷髅",
        "敲打",
        "再见",
        "擦汗",
        "抠鼻",
        "鼓掌",
        "糗大了",
        "坏笑",
        "左哼哼",
        "右哼哼",
        "哈欠",
        "鄙视",
        "委屈",
        "快哭了",
        "阴险",
        "亲亲",
        "吓",
        "可怜",
        "菜刀",
        "西瓜",
        "啤酒",
        "篮球",
        "乒乓",
        "咖啡",
        "饭",
        "猪头",
        "玫瑰",
        "凋谢",
        "示爱",
        "爱心",
        "心碎",
        "蛋糕",
        "闪电",
        "炸弹",
        "刀",
        "足球",
        "瓢虫",
        "便便",
        "月亮",
        "太阳",
        "礼物",
        "拥抱",
        "强",
        "弱",
        "握手",
        "胜利",
        "抱拳",
        "勾引",
        "拳头",
        "差劲",
        "爱你",
        "NO",
        "OK",
        "爱情",
        "飞吻",
        "跳跳",
        "发抖",
        "怄火",
        "转圈",
        "磕头",
        "回头",
        "跳绳",
        "挥手",
        "激动",
        "街舞",
        "献吻",
        "左太极",
        "右太极"
      ];
      const index = list.indexOf(word);
      return `<img src="https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${index}.gif" style="position: relative;top: 4px">`;
    },
    clickEmotion() {
      this.showEmotion = !this.showEmotion;
    },
    handleEmotion(i) {
      if (this.temp.admAnswer === null) {
        this.temp.admAnswer = "";
      }
      this.temp.admAnswer += i;
    }
  }
};
</script>
<style rel="stylesheet/scss" lang="scss" type="text/scss" scoped>
</style>

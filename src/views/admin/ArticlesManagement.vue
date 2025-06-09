<template>
  <div class="articles-management">
    <div class="header">
      <h2>文章管理</h2>
    </div>

    <el-table :data="articles" v-loading="loading" border>
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column prop="state" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStateType(row.state)">
            {{ getStateText(row.state) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button type="success" link @click="handleApprove(row)" v-if="row.state === 'PENDING'">通过</el-button>
          <el-button type="danger" link @click="handleReject(row)" v-if="row.state === 'PENDING'">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 文章详情对话框 -->
    <el-dialog
      title="文章详情"
      v-model="dialogVisible"
      width="800px"
    >
      <div v-if="currentArticle">
        <h3>{{ currentArticle.title }}</h3>
        <div class="article-info">
          <span>作者：{{ currentArticle.author }}</span>
          <span>创建时间：{{ currentArticle.createTime }}</span>
          <el-tag :type="getStateType(currentArticle.state)">
            {{ getStateText(currentArticle.state) }}
          </el-tag>
        </div>
        <div class="article-content" v-html="currentArticle.content"></div>
      </div>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      title="拒绝原因"
      v-model="rejectDialogVisible"
      width="500px"
    >
      <el-form :model="rejectForm" ref="rejectFormRef" :rules="rejectRules">
        <el-form-item label="拒绝原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Article } from '../../types';
import { getPendingArticles, approveArticle, rejectArticle } from '../../api/article';

const loading = ref(false);
const articles = ref<Article[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const dialogVisible = ref(false);
const currentArticle = ref<Article | null>(null);

const rejectDialogVisible = ref(false);
const rejectFormRef = ref();
const rejectForm = ref({
  articleID: 0,
  reason: ''
});

const rejectRules = {
  reason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
};

const fetchArticles = async () => {
  loading.value = true;
  try {
    const response = await getPendingArticles();
    if (response.data.success) {
      articles.value = response.data.data;
      total.value = response.data.data.length;
    } else {
      ElMessage.error(response.data.message || '获取文章列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    ElMessage.error('获取文章列表失败');
  } finally {
    loading.value = false;
  }
};

const handleView = (row: Article) => {
  currentArticle.value = row;
  dialogVisible.value = true;
};

const handleApprove = async (row: Article) => {
  try {
    await ElMessageBox.confirm('确定要通过该文章吗？', '提示', {
      type: 'warning'
    });

    const response = await approveArticle(row.articleID);
    if (response.data.success) {
      ElMessage.success('审核通过成功');
      fetchArticles();
    } else {
      ElMessage.error(response.data.message || '操作失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to approve article:', error);
      ElMessage.error('操作失败');
    }
  }
};

const handleReject = (row: Article) => {
  rejectForm.value = {
    articleID: row.articleID,
    reason: ''
  };
  rejectDialogVisible.value = true;
};

const confirmReject = async () => {
  if (!rejectFormRef.value) return;

  try {
    await rejectFormRef.value.validate();
    
    const response = await rejectArticle(rejectForm.value.articleID, rejectForm.value.reason);
    if (response.data.success) {
      ElMessage.success('已拒绝该文章');
      rejectDialogVisible.value = false;
      fetchArticles();
    } else {
      ElMessage.error(response.data.message || '操作失败');
    }
  } catch (error) {
    console.error('Failed to reject article:', error);
    ElMessage.error('操作失败');
  }
};

const getStateType = (state: string) => {
  switch (state) {
    case 'DRAFT':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'PUBLISHED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'info';
  }
};

const getStateText = (state: string) => {
  switch (state) {
    case 'DRAFT':
      return '草稿';
    case 'PENDING':
      return '待审核';
    case 'PUBLISHED':
      return '已发布';
    case 'REJECTED':
      return '已拒绝';
    default:
      return '未知';
  }
};

onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.articles-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.article-info {
  margin: 20px 0;
  color: #666;
}

.article-info span {
  margin-right: 20px;
}

.article-content {
  margin-top: 20px;
  line-height: 1.6;
}
</style> 
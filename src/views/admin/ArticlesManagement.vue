<template>
  <div class="articles-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文章管理</span>
        </div>
      </template>

      <el-table :data="articles" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="state" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStateType(row.state)">{{ getStateText(row.state) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button 
              v-if="row.state === 'PENDING'"
              type="success" 
              size="small" 
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button 
              v-if="row.state === 'PENDING'"
              type="danger" 
              size="small" 
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 文章详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="文章详情"
      width="800px"
    >
      <div v-if="currentArticle" class="article-detail">
        <h2>{{ currentArticle.title }}</h2>
        <div class="article-meta">
          <span>作者：{{ currentArticle.author }}</span>
          <span>创建时间：{{ currentArticle.createTime }}</span>
        </div>
        <div class="article-content" v-html="currentArticle.content"></div>
      </div>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝原因"
      width="500px"
    >
      <el-form
        ref="rejectFormRef"
        :model="rejectForm"
        :rules="rejectRules"
        label-width="80px"
      >
        <el-form-item label="原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { getPendingArticles, approveArticle, rejectArticle } from '../../api/article';

const loading = ref(false);
const articles = ref([]);
const viewDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const currentArticle = ref(null);
const rejectFormRef = ref<FormInstance>();
const rejectForm = ref({
  reason: ''
});

const rejectRules = {
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' }
  ]
};

// 获取待审核文章列表
const fetchArticles = async () => {
  loading.value = true;
  try {
    const response = await getPendingArticles();
    if (response.data.success) {
      articles.value = response.data.data;
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

// 查看文章详情
const handleView = (article: any) => {
  currentArticle.value = article;
  viewDialogVisible.value = true;
};

// 通过文章
const handleApprove = async (article: any) => {
  try {
    await ElMessageBox.confirm('确定要通过这篇文章吗？', '提示', {
      type: 'warning'
    });
    
    const response = await approveArticle(article.articleID);
    if (response.data.success) {
      ElMessage.success('审核通过');
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

// 拒绝文章
const handleReject = (article: any) => {
  currentArticle.value = article;
  rejectForm.value.reason = '';
  rejectDialogVisible.value = true;
};

// 确认拒绝
const confirmReject = async () => {
  if (!rejectFormRef.value || !currentArticle.value) return;
  
  await rejectFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await rejectArticle({
          articleID: currentArticle.value.articleID,
          reason: rejectForm.value.reason
        });

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
    }
  });
};

// 获取文章状态类型
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

// 获取文章状态文本
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-detail {
  padding: 20px;
}

.article-detail h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.article-meta {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.article-meta span {
  margin-right: 20px;
}

.article-content {
  line-height: 1.6;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 
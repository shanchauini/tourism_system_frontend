<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="article" class="article-content">
      <!-- 文章头部信息 -->
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="article-author">作者：{{ article.author?.nickName || '未知' }}</span>
          <span class="article-date">发布时间：{{ formatDate(article.createTime) }}</span>
          <span class="article-state" :class="getStateClass(article.state.state)">
            {{ getStateName(article.state.state) }}
          </span>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="article-body">
        <p class="article-text">{{ article.content }}</p>
      </div>

      <!-- 作者操作区 -->
      <div v-if="isAuthor" class="article-actions">
        <button 
          v-if="article.state.canEdit"
          @click="handleEdit"
          class="edit-btn"
        >
          编辑文章
        </button>
        <button 
          v-if="article.state.canSubmit"
          @click="handleSubmit"
          class="submit-btn"
        >
          提交审核
        </button>
        <button 
          v-if="article.state.canDelete"
          @click="handleDelete"
          class="delete-btn"
        >
          删除文章
        </button>
      </div>

      <!-- 管理员操作区 -->
      <div v-if="isAdmin" class="admin-actions">
        <button 
          v-if="article.state.state === 'PENDING'"
          @click="handleApprove"
          class="approve-btn"
        >
          通过审核
        </button>
        <button 
          v-if="article.state.state === 'PENDING'"
          @click="handleReject"
          class="reject-btn"
        >
          拒绝文章
        </button>
      </div>
    </div>

    <div v-else class="error-message">
      <p>文章不存在或已被删除</p>
      <router-link to="/articles" class="back-link">返回文章列表</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Article } from '../types';
import { getArticleDetail, deleteArticle, submitForReview, approveArticle, rejectArticle } from '../api/article';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const article = ref<Article | null>(null);
const loading = ref(true);

// 判断是否为作者
const isAuthor = computed(() => {
  return userStore.user?.userID === article.value?.userID;
});

// 判断是否为管理员
const isAdmin = computed(() => {
  return userStore.user?.userType === 'ADMIN';
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStateName = (state: string) => {
  const stateMap: Record<string, string> = {
    DRAFT: '草稿',
    PENDING: '待审核',
    PUBLISHED: '已发布',
    REJECTED: '已拒绝'
  };
  return stateMap[state] || state;
};

const getStateClass = (state: string) => {
  const classMap: Record<string, string> = {
    DRAFT: 'state-draft',
    PENDING: 'state-pending',
    PUBLISHED: 'state-published',
    REJECTED: 'state-rejected'
  };
  return classMap[state] || '';
};

const handleEdit = () => {
  if (!article.value) return;
  router.push(`/articles/edit/${article.value.articleID}`);
};

const handleSubmit = async () => {
  if (!article.value) return;
  
  try {
    const response = await submitForReview(article.value.articleID);
    if (response.data.success) {
      alert('文章已提交审核');
      fetchArticle();
    } else {
      alert('提交失败：' + response.data.message);
    }
  } catch (error) {
    console.error('Failed to submit article:', error);
    alert('提交失败，请稍后重试');
  }
};

const handleDelete = async () => {
  if (!article.value) return;
  
  if (!confirm('确定要删除这篇文章吗？')) return;
  
  try {
    const response = await deleteArticle(article.value.articleID);
    if (response.data.success) {
      alert('文章已删除');
      router.push('/articles');
    } else {
      alert('删除失败：' + response.data.message);
    }
  } catch (error) {
    console.error('Failed to delete article:', error);
    alert('删除失败，请稍后重试');
  }
};

const handleApprove = async () => {
  if (!article.value) return;
  
  try {
    const response = await approveArticle(article.value.articleID);
    if (response.data.success) {
      alert('文章已通过审核');
      fetchArticle();
    } else {
      alert('操作失败：' + response.data.message);
    }
  } catch (error) {
    console.error('Failed to approve article:', error);
    alert('操作失败，请稍后重试');
  }
};

const handleReject = async () => {
  if (!article.value) return;
  
  try {
    const response = await rejectArticle(article.value.articleID);
    if (response.data.success) {
      alert('文章已拒绝');
      fetchArticle();
    } else {
      alert('操作失败：' + response.data.message);
    }
  } catch (error) {
    console.error('Failed to reject article:', error);
    alert('操作失败，请稍后重试');
  }
};

const fetchArticle = async () => {
  const articleId = Number(route.params.id);
  if (isNaN(articleId)) {
    router.push('/articles');
    return;
  }

  loading.value = true;
  try {
    const response = await getArticleDetail(articleId);
    if (response.data.success) {
      article.value = response.data.data;
    } else {
      article.value = null;
    }
  } catch (error) {
    console.error('Failed to fetch article:', error);
    article.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchArticle);
</script>

<style scoped>
.article-detail {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.article-header {
  margin-bottom: 2rem;
}

.article-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.article-state {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.state-draft {
  background-color: #f5f5f5;
  color: #666;
}

.state-pending {
  background-color: #e6f7ff;
  color: #1890ff;
}

.state-published {
  background-color: #f6ffed;
  color: #52c41a;
}

.state-rejected {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.article-body {
  margin-bottom: 2rem;
}

.article-text {
  color: #333;
  line-height: 1.8;
  font-size: 1.1rem;
  white-space: pre-wrap;
}

.article-actions,
.admin-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.edit-btn,
.submit-btn,
.delete-btn,
.approve-btn,
.reject-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #1890ff;
  color: #fff;
}

.submit-btn {
  background-color: #52c41a;
  color: #fff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.approve-btn {
  background-color: #52c41a;
  color: #fff;
}

.reject-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.error-message {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.back-link {
  display: inline-block;
  margin-top: 1rem;
  color: #1890ff;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .article-detail {
    padding: 1rem;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .article-actions,
  .admin-actions {
    flex-direction: column;
  }

  .edit-btn,
  .submit-btn,
  .delete-btn,
  .approve-btn,
  .reject-btn {
    width: 100%;
  }
}
</style> 
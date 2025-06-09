<template>
  <div class="articles-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input">
        <input
          type="text"
          v-model="searchParams.title"
          placeholder="搜索文章标题"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="articles-list" v-if="!loading">
      <div v-if="articles.length > 0">
        <div v-for="article in articles" :key="article.articleID" class="article-card">
          <div class="article-content">
            <h2 class="article-title">{{ article.title }}</h2>
            <div class="article-meta">
              <span class="article-author">作者：{{ article.author?.nickName || '未知' }}</span>
              <span class="article-date">发布时间：{{ formatDate(article.createTime) }}</span>
              <span class="article-state" :class="getStateClass(article.state.state)">
                {{ getStateName(article.state.state) }}
              </span>
            </div>
            <p class="article-content-preview">{{ article.content.substring(0, 200) }}...</p>
            <div class="article-footer">
              <router-link :to="'/articles/' + article.articleID" class="read-more">
                阅读全文
              </router-link>
              <div class="article-actions" v-if="isAuthor(article)">
                <button 
                  v-if="article.state.canEdit"
                  @click="handleEdit(article)"
                  class="edit-btn"
                >
                  编辑
                </button>
                <button 
                  v-if="article.state.canSubmit"
                  @click="handleSubmit(article)"
                  class="submit-btn"
                >
                  提交审核
                </button>
                <button 
                  v-if="article.state.canDelete"
                  @click="handleDelete(article)"
                  class="delete-btn"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>暂无文章</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Article } from '../types';
import { getPublishedArticles, deleteArticle, submitForReview } from '../api/article';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const articles = ref<Article[]>([]);
const loading = ref(false);

const searchParams = ref({
  title: ''
});

const handleSearch = async () => {
  loading.value = true;
  try {
    const response = await getPublishedArticles();
    if (response.data.success) {
      articles.value = response.data.data.filter((article: Article) => 
        article.title.toLowerCase().includes(searchParams.value.title.toLowerCase())
      );
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
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

const isAuthor = (article: Article) => {
  return userStore.user?.userID === article.userID;
};

const handleEdit = (article: Article) => {
  router.push(`/articles/edit/${article.articleID}`);
};

const handleSubmit = async (article: Article) => {
  try {
    const response = await submitForReview(article.articleID);
    if (response.data.success) {
      alert('文章已提交审核');
      handleSearch();
    } else {
      alert('提交失败：' + response.data.message);
    }
  } catch (error) {
    console.error('Failed to submit article:', error);
    alert('提交失败，请稍后重试');
  }
};

const handleDelete = async (article: Article) => {
  if (!confirm('确定要删除这篇文章吗？')) return;
  
  try {
    const response = await deleteArticle(article.articleID);
    if (response.data.success) {
      alert('文章已删除');
      handleSearch();
    } else {
      alert('删除失败：' + response.data.message);
    }
  } catch (error) {
    console.error('Failed to delete article:', error);
    alert('删除失败，请稍后重试');
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const response = await getPublishedArticles();
    if (response.data.success) {
      articles.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.articles-page {
  padding: 2rem;
}

.search-bar {
  margin-bottom: 2rem;
}

.search-input input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.article-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.article-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
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

.article-content-preview {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.read-more {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
}

.read-more:hover {
  text-decoration: underline;
}

.article-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.submit-btn,
.delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
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

.no-data {
  text-align: center;
  padding: 3rem;
  color: #666;
}

@media (max-width: 768px) {
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .article-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .article-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style> 
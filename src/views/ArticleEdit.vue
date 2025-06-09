<template>
  <div class="article-edit">
    <div class="edit-header">
      <h1>{{ isEdit ? '编辑文章' : '创建文章' }}</h1>
    </div>

    <div class="edit-form">
      <div class="form-group">
        <label for="title">标题</label>
        <input
          type="text"
          id="title"
          v-model="articleForm.title"
          placeholder="请输入文章标题"
          required
        />
      </div>

      <div class="form-group">
        <label for="content">内容</label>
        <textarea
          id="content"
          v-model="articleForm.content"
          placeholder="请输入文章内容"
          rows="15"
          required
        ></textarea>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          class="cancel-btn"
          @click="handleCancel"
        >
          取消
        </button>
        <button 
          type="button" 
          class="save-btn"
          @click="handleSave"
          :disabled="loading"
        >
          {{ loading ? '保存中...' : '保存' }}
        </button>
        <button 
          v-if="isEdit && article?.state.canSubmit"
          type="button" 
          class="submit-btn"
          @click="handleSubmit"
          :disabled="loading"
        >
          提交审核
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Article } from '../types';
import { getArticleDetail, createArticle, updateArticle, submitForReview } from '../api/article';

const route = useRoute();
const router = useRouter();

const article = ref<Article | null>(null);
const loading = ref(false);

const isEdit = computed(() => {
  return route.params.id !== undefined;
});

const articleForm = ref({
  title: '',
  content: ''
});

const handleCancel = () => {
  if (confirm('确定要放弃编辑吗？')) {
    router.back();
  }
};

const handleSave = async () => {
  if (!articleForm.value.title || !articleForm.value.content) {
    alert('请填写完整的文章信息');
    return;
  }

  loading.value = true;
  try {
    let response;
    if (isEdit.value && article.value) {
      response = await updateArticle({
        ...article.value,
        ...articleForm.value
      });
    } else {
      response = await createArticle({
        title: articleForm.value.title,
        content: articleForm.value.content,
        userID: 1 // TODO: 从用户状态获取
      });
    }

    if (response.data.success) {
      alert(isEdit.value ? '文章更新成功' : '文章创建成功');
      router.push('/articles');
    } else {
      alert(response.data.message || '操作失败');
    }
  } catch (error) {
    console.error('Failed to save article:', error);
    alert('保存失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!article.value) return;

  loading.value = true;
  try {
    const response = await submitForReview(article.value.articleID);
    if (response.data.success) {
      alert('文章已提交审核');
      router.push('/articles');
    } else {
      alert('提交失败：' + response.data.message);
    }
  } catch (error) {
    console.error('Failed to submit article:', error);
    alert('提交失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const fetchArticle = async () => {
  if (!isEdit.value) return;

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
      articleForm.value = {
        title: article.value.title,
        content: article.value.content
      };
    } else {
      router.push('/articles');
    }
  } catch (error) {
    console.error('Failed to fetch article:', error);
    router.push('/articles');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchArticle);
</script>

<style scoped>
.article-edit {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.edit-header {
  margin-bottom: 2rem;
}

.edit-header h1 {
  font-size: 1.8rem;
  color: #333;
}

.edit-form {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
}

.form-group textarea {
  min-height: 300px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.save-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.cancel-btn {
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.save-btn {
  background-color: #1890ff;
  color: #fff;
}

.submit-btn {
  background-color: #52c41a;
  color: #fff;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}

.save-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.submit-btn:hover:not(:disabled) {
  background-color: #73d13d;
}

button:disabled {
  background-color: #bfbfbf;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .article-edit {
    padding: 1rem;
  }

  .edit-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn,
  .submit-btn {
    width: 100%;
  }
}
</style> 
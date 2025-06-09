<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>管理后台</h1>
    </div>

    <div class="dashboard-content">
      <div class="dashboard-sidebar">
        <div class="menu-item" :class="{ active: activeTab === 'articles' }" @click="activeTab = 'articles'">
          文章管理
        </div>
        <div class="menu-item" :class="{ active: activeTab === 'attractions' }" @click="activeTab = 'attractions'">
          景点管理
        </div>
        <div class="menu-item" :class="{ active: activeTab === 'tickets' }" @click="activeTab = 'tickets'">
          门票管理
        </div>
      </div>

      <div class="dashboard-main">
        <!-- 文章管理 -->
        <div v-if="activeTab === 'articles'" class="tab-content">
          <div class="content-header">
            <h2>文章管理</h2>
            <div class="search-bar">
              <input
                type="text"
                v-model="articleSearch"
                placeholder="搜索文章标题"
                @input="handleArticleSearch"
              />
            </div>
          </div>

          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          <div v-else-if="articles.length === 0" class="no-data">
            暂无文章
          </div>
          <div v-else class="article-list">
            <div v-for="article in articles" :key="article.articleID" class="article-item">
              <div class="article-info">
                <h3>{{ article.title }}</h3>
                <p class="article-meta">
                  作者：{{ article.userID }} | 
                  发布时间：{{ formatDate(article.createTime) }} |
                  状态：{{ getArticleStatus(article.state.state) }}
                </p>
              </div>
              <div class="article-actions">
                <button
                  v-if="article.state.state === 'PENDING'"
                  class="approve-btn"
                  @click="handleApproveArticle(article.articleID)"
                >
                  通过
                </button>
                <button
                  v-if="article.state.state === 'PENDING'"
                  class="reject-btn"
                  @click="handleRejectArticle(article.articleID)"
                >
                  拒绝
                </button>
                <button
                  class="delete-btn"
                  @click="handleDeleteArticle(article.articleID)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 景点管理 -->
        <div v-if="activeTab === 'attractions'" class="tab-content">
          <div class="content-header">
            <h2>景点管理</h2>
            <button class="add-btn" @click="showAddAttractionModal = true">
              添加景点
            </button>
          </div>

          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          <div v-else-if="attractions.length === 0" class="no-data">
            暂无景点
          </div>
          <div v-else class="attraction-list">
            <div v-for="attraction in attractions" :key="attraction.attractionID" class="attraction-item">
              <div class="attraction-info">
                <h3>{{ attraction.attractionName }}</h3>
                <p class="attraction-meta">
                  等级：{{ attraction.attractionLevel }} | 
                  地址：{{ attraction.attractionAddress }}
                </p>
                <p class="attraction-desc">{{ attraction.introduction }}</p>
              </div>
              <div class="attraction-actions">
                <button class="edit-btn" @click="handleEditAttraction(attraction)">
                  编辑
                </button>
                <button class="delete-btn" @click="handleDeleteAttraction(attraction.attractionID)">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 门票管理 -->
        <div v-if="activeTab === 'tickets'" class="tab-content">
          <div class="content-header">
            <h2>门票管理</h2>
            <button class="add-btn" @click="showAddTicketModal = true">
              添加门票
            </button>
          </div>

          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          <div v-else-if="tickets.length === 0" class="no-data">
            暂无门票
          </div>
          <div v-else class="ticket-list">
            <div v-for="ticket in tickets" :key="ticket.ticketID" class="ticket-item">
              <div class="ticket-info">
                <h3>{{ ticket.type }}</h3>
                <p class="ticket-meta">
                  景点：{{ ticket.attractionID }} | 
                  价格：¥{{ ticket.price }} |
                  库存：{{ ticket.stock }}
                </p>
                <p class="ticket-desc">{{ ticket.description }}</p>
              </div>
              <div class="ticket-actions">
                <button class="edit-btn" @click="handleEditTicket(ticket)">
                  编辑
                </button>
                <button class="delete-btn" @click="handleDeleteTicket(ticket.ticketID)">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑景点模态框 -->
    <div v-if="showAddAttractionModal" class="modal">
      <div class="modal-content">
        <h3>{{ editingAttraction ? '编辑景点' : '添加景点' }}</h3>
        <div class="form-group">
          <label>名称</label>
          <input type="text" v-model="attractionForm.attractionName" />
        </div>
        <div class="form-group">
          <label>等级</label>
          <select v-model="attractionForm.attractionID">
            <option value="5A">5A</option>
            <option value="4A">4A</option>
            <option value="3A">3A</option>
          </select>
        </div>
        <div class="form-group">
          <label>地址</label>
          <input type="text" v-model="attractionForm.attractionAddress" />
        </div>
        <div class="form-group">
          <label>开放时间</label>
          <input type="text" v-model="attractionForm.openingHours" />
        </div>
        <div class="form-group">
          <label>介绍</label>
          <textarea v-model="attractionForm.introduction"></textarea>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showAddAttractionModal = false">取消</button>
          <button class="save-btn" @click="handleSaveAttraction">保存</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑门票模态框 -->
    <div v-if="showAddTicketModal" class="modal">
      <div class="modal-content">
        <h3>{{ editingTicket ? '编辑门票' : '添加门票' }}</h3>
        <div class="form-group">
          <label>名称</label>
          <input type="text" v-model="ticketForm.type" />
        </div>
        <div class="form-group">
          <label>景点</label>
          <select v-model="ticketForm.attractionID">
            <option v-for="attraction in attractions" :key="attraction.attractionID" :value="attraction.attractionID">
              {{ attraction.attractionName }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>价格</label>
          <input type="number" v-model="ticketForm.price" />
        </div>
        <div class="form-group">
          <label>库存</label>
          <input type="number" v-model="ticketForm.stock" />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="ticketForm.description"></textarea>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showAddTicketModal = false">取消</button>
          <button class="save-btn" @click="handleSaveTicket">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Article, Attraction, Ticket } from '../types';
/*
  import {
  getArticles,
  approveArticle,
  rejectArticle,
  deleteArticle,
  getAttractions,
  addAttraction,
  updateAttraction,
  deleteAttraction,
  getTickets,
  addTicket,
  updateTicket,
  deleteTicket
} from '../api';*/
 import {
  approveArticle,
  rejectArticle,
  deleteArticle,
  getPendingArticles
 } from '../api/article';

 import{
    addAttraction,
    updateAttraction,
    deleteAttraction,
    getAllAttractions
 } from '../api/attraction';

 import{
    addTicket,
    updateTicket,
    deleteTicket,
    getTicketsByAttractionId
 } from '../api/ticket';


const activeTab = ref('articles');
const loading = ref(false);

// 文章管理
const articles = ref<Article[]>([]);
const articleSearch = ref('');

// 景点管理
const attractions = ref<Attraction[]>([]);
const showAddAttractionModal = ref(false);
const editingAttraction = ref<Attraction | null>(null);
const attractionForm = ref({
  attractionID: 0,
  attractionName: '',
  attractionLevel: '',
  attractionAddress: '',
  openingHours: '',
  introduction: '',
  coverImage: '',
  ticketList: <Ticket[]>[]//改
});

// 门票管理
const tickets = ref<Ticket[]>([]);
const showAddTicketModal = ref(false);
const editingTicket = ref<Ticket | null>(null);
const ticketForm = ref({
  ticketID: 0,
  attractionID: 0,
  type: '',
  price: 0,
  stock: 0,
  description: ''
  
});

// 文章相关方法

const handleArticleSearch = async () => {
  loading.value = true;
  try {
    const response = await getPendingArticles();//??
    if (response.data.success) {
      articles.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to search articles:', error);
  } finally {
    loading.value = false;
  }
};

const handleApproveArticle = async (articleId: number) => {
  if (!confirm('确定要通过这篇文章吗？')) return;
  
  loading.value = true;
  try {
    const response = await approveArticle(articleId);
    if (response.data.success) {
      alert('文章已通过');
      handleArticleSearch();
    }
  } catch (error) {
    console.error('Failed to approve article:', error);
    alert('操作失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleRejectArticle = async (articleId: number) => {
  if (!confirm('确定要拒绝这篇文章吗？')) return;
  
  loading.value = true;
  try {
    const response = await rejectArticle(articleId);
    if (response.data.success) {
      alert('文章已拒绝');
      handleArticleSearch();
    }
  } catch (error) {
    console.error('Failed to reject article:', error);
    alert('操作失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleDeleteArticle = async (articleId: number) => {
  if (!confirm('确定要删除这篇文章吗？')) return;
  
  loading.value = true;
  try {
    const response = await deleteArticle(articleId);
    if (response.data.success) {
      alert('文章已删除');
      handleArticleSearch();
    }
  } catch (error) {
    console.error('Failed to delete article:', error);
    alert('删除失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 景点相关方法
const handleEditAttraction = (attraction: Attraction) => {
  editingAttraction.value = attraction;
  attractionForm.value = { ...attraction };
  showAddAttractionModal.value = true;
};

const handleSaveAttraction = async () => {
  if (!attractionForm.value.attractionName || !attractionForm.value.attractionAddress) {
    alert('请填写完整的景点信息');
    return;
  }

  loading.value = true;
  try {
    let response;
    if (editingAttraction.value) {
      response = await updateAttraction({
        ...editingAttraction.value,
        ...attractionForm.value
      });
    } else {
      response = await addAttraction(attractionForm.value);
    }

    if (response.data.success) {
      alert(editingAttraction.value ? '景点更新成功' : '景点添加成功');
      showAddAttractionModal.value = false;
      fetchAttractions();
    }
  } catch (error) {
    console.error('Failed to save attraction:', error);
    alert('保存失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleDeleteAttraction = async (attractionId: number) => {
  if (!confirm('确定要删除这个景点吗？')) return;
  
  loading.value = true;
  try {
    const response = await deleteAttraction(attractionId);
    if (response.data.success) {
      alert('景点已删除');
      fetchAttractions();
    }
  } catch (error) {
    console.error('Failed to delete attraction:', error);
    alert('删除失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 门票相关方法
const handleEditTicket = (ticket: Ticket) => {
  editingTicket.value = ticket;
  ticketForm.value = { ...ticket };
  showAddTicketModal.value = true;
};

const handleSaveTicket = async () => {
  if (!ticketForm.value.type || !ticketForm.value.attractionID) {
    alert('请填写完整的门票信息');
    return;
  }

  loading.value = true;
  try {
    let response;
    if (editingTicket.value) {
      response = await updateTicket({
        ...editingTicket.value,
        ...ticketForm.value
      });
    } else {
      response = await addTicket(ticketForm.value);
    }

    if (response.data.success) {
      alert(editingTicket.value ? '门票更新成功' : '门票添加成功');
      showAddTicketModal.value = false;
      fetchTickets();
    }
  } catch (error) {
    console.error('Failed to save ticket:', error);
    alert('保存失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleDeleteTicket = async (ticketId: number) => {
  if (!confirm('确定要删除这个门票吗？')) return;
  
  loading.value = true;
  try {
    const response = await deleteTicket(ticketId);
    if (response.data.success) {
      alert('门票已删除');
      fetchTickets();
    }
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    alert('删除失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 通用方法
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getArticleStatus = (state: string) => {
  const statusMap: Record<string, string> = {
    DRAFT: '草稿',
    PENDING: '待审核',
    PUBLISHED: '已发布',
    REJECTED: '已拒绝'
  };
  return statusMap[state] || state;
};

// 数据获取方法
const fetchAttractions = async () => {
  loading.value = true;
  try {
    const response = await getAllAttractions();
    if (response.data.success) {
      attractions.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch attractions:', error);
  } finally {
    loading.value = false;
  }
};

const fetchTickets = async () => {
  loading.value = true;
  try {
    const response = await getTicketsByAttractionId(attractionForm.value.attractionID);//??
    if (response.data.success) {
      tickets.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  handleArticleSearch();
  fetchAttractions();
  fetchTickets();
});
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 1.8rem;
  color: #333;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
}

.dashboard-sidebar {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.menu-item {
  padding: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.dashboard-main {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.content-header h2 {
  font-size: 1.4rem;
  color: #333;
  margin: 0;
}

.search-bar input {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.add-btn {
  padding: 0.5rem 1rem;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #40a9ff;
}

.article-list,
.attraction-list,
.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-item,
.attraction-item,
.ticket-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
}

.article-info h3,
.attraction-info h3,
.ticket-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.article-meta,
.attraction-meta,
.ticket-meta {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.article-desc,
.attraction-desc,
.ticket-desc {
  color: #666;
  margin: 0.5rem 0;
}

.article-actions,
.attraction-actions,
.ticket-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.approve-btn,
.reject-btn,
.edit-btn,
.delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.approve-btn {
  background-color: #52c41a;
  color: #fff;
}

.reject-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.edit-btn {
  background-color: #1890ff;
  color: #fff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #666;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn,
.save-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
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
  color: #999;
  padding: 2rem;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .dashboard-sidebar {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
  }

  .menu-item {
    white-space: nowrap;
  }

  .dashboard-main {
    padding: 1rem;
  }

  .content-header {
    flex-direction: column;
    gap: 1rem;
  }

  .search-bar input {
    width: 100%;
  }

  .add-btn {
    width: 100%;
  }
}
</style> 
<template>
  <div class="user-center">
    <div class="user-header">
      <h1>个人中心</h1>
    </div>

    <div class="user-content">
      <div class="sidebar">
        <div class="user-profile">
          <div class="avatar">
            <el-avatar :size="80" :src="userStore.user?.avatar || ''">
              {{ userStore.user?.nickName?.charAt(0) || 'U' }}
            </el-avatar>
          </div>
          <h3>{{ userStore.user?.nickName || '未设置昵称' }}</h3>
          <p class="user-type">{{ userStore.user?.userType === 'ADMIN' ? '管理员' : '普通用户' }}</p>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="user-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="profile">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
          <el-menu-item index="articles">
            <el-icon><Document /></el-icon>
            <span>我的文章</span>
          </el-menu-item>
          <el-menu-item index="orders">
            <el-icon><Tickets /></el-icon>
            <span>我的订单</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="main-content">
        <!-- 个人信息 -->
        <div v-if="activeMenu === 'profile'" class="content-section">
          <h2>个人信息</h2>
          <el-form
            ref="formRef"
            :model="userForm"
            :rules="rules"
            label-width="100px"
            class="info-form"
          >
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="userForm.gender" placeholder="请选择性别">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="所在地" prop="location">
              <el-input v-model="userForm.location" placeholder="请输入所在地" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateInfo" :loading="loading">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 我的文章 -->
        <div v-if="activeMenu === 'articles'" class="content-section">
          <div class="section-header">
            <h2>我的文章</h2>
            <router-link to="/user/articles/new">
              <el-button type="primary">
                <el-icon><Plus /></el-icon>写新文章
              </el-button>
            </router-link>
          </div>
          <div v-if="loading" class="loading">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="articles.length === 0" class="no-data">
            <el-empty description="暂无文章" />
          </div>
          <div v-else class="article-list">
            <el-card v-for="article in articles" :key="article.articleID" class="article-item">
              <div class="article-header">
                <h3>{{ article.title }}</h3>
                <el-tag :type="getStateType(article.state.state)">
                  {{ getStateText(article.state.state) }}
                </el-tag>
              </div>
              <div class="article-content">
                <p>{{ getExcerpt(article.content) }}</p>
              </div>
              <div class="article-footer">
                <span class="article-date">{{ formatDate(article.createTime) }}</span>
                <div class="article-actions">
                  <el-button-group>
                    <el-button
                      type="primary"
                      link
                      @click="handleEditArticle(article)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      v-if="article.state.canSubmit"
                      type="success"
                      link
                      @click="handleSubmit(article)"
                    >
                      提交审核
                    </el-button>
                    <el-button
                      v-if="article.state.canDelete"
                      type="danger"
                      link
                      @click="handleDelete(article)"
                    >
                      删除
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 我的订单 -->
        <div v-if="activeMenu === 'orders'" class="content-section">
          <h2>我的订单</h2>
          <div v-if="loading" class="loading">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="orders.length === 0" class="no-data">
            <el-empty description="暂无订单" />
          </div>
          <div v-else class="order-list">
            <el-card v-for="order in orders" :key="order.orderID" class="order-item">
              <div class="order-header">
                <div class="order-info">
                  <h3>订单号：{{ order.orderID }}</h3>
                  <p class="order-date">{{ formatDate(order.createTime) }}</p>
                </div>
                <el-tag :type="getOrderStatusType(order.status)">
                  {{ getStatusText(order.status) }}
                </el-tag>
              </div>
              <div class="order-content">
                <div class="ticket-info">
                  <h4>{{ order.attractionName }}</h4>
                  <p>门票类型：{{ order.ticketType }}</p>
                  <p>数量：{{ order.quantity }}</p>
                  <p class="price">总价：¥{{ order.totalAmount }}</p>
                </div>
                <div class="order-actions">
                  <el-button-group>
                    <el-button
                      v-if="order.status === 'PENDING'"
                      type="primary"
                      @click="handlePay(order)"
                    >
                      支付
                    </el-button>
                    <el-button
                      v-if="order.status === 'PENDING'"
                      type="danger"
                      @click="handleCancel(order)"
                    >
                      取消
                    </el-button>
                    <el-button
                      v-if="order.status === 'PAID'"
                      type="warning"
                      @click="handleRefund(order)"
                    >
                      申请退款
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Document, Tickets, Plus } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/user';
import type { TicketOrder, Article } from '../types';
import { updateUserInfo } from '../api/user';
import { getUserOrders } from '../api/order';
import { getUserArticles, submitForReview, deleteArticle } from '../api/article';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const activeMenu = ref('profile');

const userForm = ref({
  nickname: '',
  gender: '男',
  phone: '',
  location: ''
});

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
};

const orders = ref<TicketOrder[]>([]);
const articles = ref<Article[]>([]);

const handleMenuSelect = (key: string) => {
  activeMenu.value = key;
};

const handleUpdateInfo = async () => {
  loading.value = true;
  try {
    const response = await updateUserInfo({
      userID: userStore.user.userID,
      ...userForm.value
    });

    if (response.data.success) {
      ElMessage.success('个人信息更新成功');
    } else {
      ElMessage.error(response.data.message || '更新失败');
    }
  } catch (error) {
    console.error('Failed to update user info:', error);
    ElMessage.error('更新失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await getUserOrders(userStore.user.userID);
    if (response.data.success) {
      orders.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  } finally {
    loading.value = false;
  }
};

const fetchArticles = async () => {
  loading.value = true;
  try {
    const response = await getUserArticles(userStore.user.userID);
    if (response.data.success) {
      articles.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    CANCELLED: '已取消',
    REFUNDED: '已退款'
  };
  return statusMap[status] || status;
};

const getOrderStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    PENDING: 'warning',
    PAID: 'success',
    CANCELLED: 'info',
    REFUNDED: 'info'
  };
  return typeMap[status] || 'info';
};

const getStateText = (state: string) => {
  const stateMap: Record<string, string> = {
    DRAFT: '草稿',
    PENDING: '待审核',
    PUBLISHED: '已发布',
    REJECTED: '已拒绝'
  };
  return stateMap[state] || state;
};

const getStateType = (state: string) => {
  const typeMap: Record<string, string> = {
    DRAFT: 'info',
    PENDING: 'warning',
    PUBLISHED: 'success',
    REJECTED: 'danger'
  };
  return typeMap[state] || 'info';
};

const getExcerpt = (content: string) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
};

const handleEditArticle = (article: Article) => {
  router.push(`/user/articles/edit/${article.articleID}`);
};

const handleSubmit = async (article: Article) => {
  try {
    await ElMessageBox.confirm('确定要提交该文章进行审核吗？', '提示', {
      type: 'warning'
    });

    const response = await submitForReview(article.articleID);
    if (response.data.success) {
      ElMessage.success('提交成功，等待审核');
      fetchArticles();
    } else {
      ElMessage.error(response.data.message || '提交失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to submit article:', error);
      ElMessage.error('提交失败');
    }
  }
};

const handleDelete = async (article: Article) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      type: 'warning'
    });
    
    const response = await deleteArticle(article.articleID);
    if (response.data.success) {
      ElMessage.success('文章已删除');
      fetchArticles();
    } else {
      ElMessage.error(response.data.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete article:', error);
      ElMessage.error('删除失败，请稍后重试');
    }
  }
};

const handlePay = (order: TicketOrder) => {
  // TODO: 实现支付功能
  ElMessage.info('支付功能开发中');
};

const handleCancel = async (order: TicketOrder) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning'
    });
    // TODO: 实现取消订单功能
    ElMessage.success('订单已取消');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to cancel order:', error);
      ElMessage.error('取消订单失败，请稍后重试');
    }
  }
};

const handleRefund = async (order: TicketOrder) => {
  try {
    await ElMessageBox.confirm('确定要申请退款吗？', '提示', {
      type: 'warning'
    });
    // TODO: 实现退款功能
    ElMessage.success('退款申请已提交');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to refund order:', error);
      ElMessage.error('申请退款失败，请稍后重试');
    }
  }
};

onMounted(() => {
  if (userStore.user) {
    userForm.value = {
      nickname: userStore.user.nickName || '',
      gender: userStore.user.gender || '男',
      phone: userStore.user.phone || '',
      location: userStore.user.location || ''
    };
  }
  fetchOrders();
  fetchArticles();
});
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 2rem;
}

.user-header {
  margin-bottom: 2rem;
}

.user-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.user-content {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.user-profile {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar {
  margin-bottom: 1rem;
}

.user-profile h3 {
  margin: 0.5rem 0;
  color: #333;
}

.user-type {
  color: #666;
  margin: 0;
}

.user-menu {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.info-form {
  max-width: 600px;
}

.article-list,
.order-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-item,
.order-item {
  margin-bottom: 1rem;
}

.article-header,
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.article-header h3,
.order-header h3 {
  margin: 0;
  color: #333;
}

.article-content {
  color: #666;
  margin-bottom: 1rem;
}

.article-footer,
.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-date,
.order-date {
  color: #999;
  font-size: 0.9rem;
}

.ticket-info {
  flex: 1;
}

.ticket-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.ticket-info p {
  margin: 0.25rem 0;
  color: #666;
}

.price {
  color: #f5222d;
  font-weight: bold;
}

.loading {
  padding: 2rem;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #999;
}

@media (max-width: 768px) {
  .user-center {
    padding: 1rem;
  }

  .user-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .content-section {
    padding: 1rem;
  }
}
</style> 
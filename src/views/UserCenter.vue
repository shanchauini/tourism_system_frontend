<template>
  <div class="user-center">
    <div class="user-header">
      <h1>个人中心</h1>
    </div>

    <div class="user-content">
      <div class="user-info">
        <h2>个人信息</h2>
        <div class="info-form">
          <div class="form-group">
            <label for="nickname">昵称</label>
            <input
              type="text"
              id="nickname"
              v-model="userForm.nickname"
              placeholder="请输入昵称"
            />
          </div>

          <div class="form-group">
            <label for="gender">性别</label>
            <select id="gender" v-model="userForm.gender">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>

          <div class="form-group">
            <label for="phone">手机号</label>
            <input
              type="tel"
              id="phone"
              v-model="userForm.phone"
              placeholder="请输入手机号"
            />
          </div>

          <div class="form-group">
            <label for="location">所在地</label>
            <input
              type="text"
              id="location"
              v-model="userForm.location"
              placeholder="请输入所在地"
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="save-btn"
              @click="handleUpdateInfo"
              :disabled="loading"
            >
              {{ loading ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </div>
      </div>

      <div class="user-orders">
        <h2>我的订单</h2>
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        <div v-else-if="orders.length === 0" class="no-data">
          暂无订单记录
        </div>
        <div v-else class="order-list">
          <div v-for="order in orders" :key="order.orderID" class="order-item">
            <div class="order-header">
              <span class="order-id">订单号：{{ order.orderID }}</span>
              <span class="order-date">{{ formatDate(order.createTime) }}</span>
            </div>
            <div class="order-content">
              <div class="ticket-info">
                <h3>{{ order.ticketID }}</h3>
                <!--<p>数量：{{ order.quantity }}</p> -->
                <p>总价：¥{{ order.totalAmount }}</p>
              </div>
              <div class="order-status">
                <span :class="['status-tag', order.status.toLowerCase()]">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import type { TicketOrder } from '../types';
import { updateUserInfo } from '../api/user';
import{ getUserOrders} from '../api/order';

const userStore = useUserStore();
const loading = ref(false);

const userForm = ref({
  nickname: '',
  gender: '男',
  phone: '',
  location: ''
});

const orders = ref<TicketOrder[]>([]);

const handleUpdateInfo = async () => {
  loading.value = true;
  try {
    const response = await updateUserInfo({
      userID: userStore.userID,
      ...userForm.value
    });

    if (response.data.success) {
      alert('个人信息更新成功');
    } else {
      alert(response.data.message || '更新失败');
    }
  } catch (error) {
    console.error('Failed to update user info:', error);
    alert('更新失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await getUserOrders(userStore.);//?
    if (response.data.success) {
      orders.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
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

onMounted(() => {
  if (userStore.userInfo) {
    userForm.value = {
      nickname: userStore.userInfo.nickname || '',
      gender: userStore.userInfo.gender || '男',
      phone: userStore.userInfo.phone || '',
      location: userStore.userInfo.location || ''
    };
  }
  fetchOrders();
});
</script>

<style scoped>
.user-center {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.user-header {
  margin-bottom: 2rem;
}

.user-header h1 {
  font-size: 1.8rem;
  color: #333;
}

.user-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.user-info,
.user-orders {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 1.5rem;
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
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  margin-top: 2rem;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.save-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.save-btn:disabled {
  background-color: #bfbfbf;
  cursor: not-allowed;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.ticket-info p {
  margin: 0.25rem 0;
  color: #666;
}

.status-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.status-tag.pending {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-tag.paid {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-tag.cancelled {
  background-color: #fff1f0;
  color: #f5222d;
}

.status-tag.refunded {
  background-color: #f5f5f5;
  color: #666;
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
  .user-center {
    padding: 1rem;
  }

  .user-content {
    grid-template-columns: 1fr;
  }

  .user-info,
  .user-orders {
    padding: 1rem;
  }
}
</style> 
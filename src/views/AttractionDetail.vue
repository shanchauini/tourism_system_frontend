<template>
  <div class="attraction-detail">
    <!-- 景点基本信息 -->
    <div class="attraction-header">
      <div class="attraction-cover">
        <img :src="attraction?.coverImage" :alt="attraction?.attractionName" />
      </div>
      <div class="attraction-info">
        <h1 class="attraction-name">{{ attraction?.attractionName }}</h1>
        <div class="attraction-meta">
          <span class="attraction-level">{{ attraction?.attractionLevel }}</span>
          <span class="attraction-address">{{ attraction?.attractionAddress }}</span>
        </div>
        <div class="attraction-hours">
          <h3>开放时间</h3>
          <p>{{ attraction?.openingHours }}</p>
        </div>
        <div class="attraction-intro">
          <h3>景点介绍</h3>
          <p>{{ attraction?.introduction }}</p>
        </div>
      </div>
    </div>

    <!-- 门票信息 -->
    <div class="ticket-section">
      <h2>门票信息</h2>
      <div class="ticket-list">
        <div v-for="ticket in attraction?.ticketList" :key="ticket.ticketID" class="ticket-card">
          <div class="ticket-info">
            <h3>{{ ticket.type }}</h3>
            <p class="ticket-price">¥{{ ticket.price }}</p>
            <p class="ticket-stock">库存：{{ ticket.stock }}</p>
            <p class="ticket-desc">{{ ticket.description }}</p>
          </div>
          <button
            class="book-btn"
            :disabled="ticket.stock <= 0"
            @click="handleBookTicket(ticket)"
          >
            {{ ticket.stock > 0 ? '立即预订' : '已售罄' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 预订表单对话框 -->
    <div v-if="showBookingForm" class="booking-modal">
      <div class="booking-form">
        <h2>预订门票</h2>
        <form @submit.prevent="submitBooking">
          <div class="form-group">
            <label for="customerName">姓名</label>
            <input
              type="text"
              id="customerName"
              v-model="bookingForm.customerName"
              required
            />
          </div>
          <div class="form-group">
            <label for="customerPhone">手机号码</label>
            <input
              type="tel"
              id="customerPhone"
              v-model="bookingForm.customerPhone"
              required
            />
          </div>
          <div class="form-group">
            <label for="quantity">数量</label>
            <input
              type="number"
              id="quantity"
              v-model="bookingForm.quantity"
              min="1"
              :max="selectedTicket?.stock"
              required
            />
          </div>
          <div class="form-group">
            <label>总价</label>
            <p class="total-price">¥{{ totalPrice }}</p>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showBookingForm = false">
              取消
            </button>
            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? '提交中...' : '确认预订' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Attraction, Ticket } from '../types';
import { getAttractionDetail } from '../api/attraction';
import { createOrder } from '../api/order';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const attraction = ref<Attraction | null>(null);
const loading = ref(false);
const showBookingForm = ref(false);
const selectedTicket = ref<Ticket | null>(null);

const bookingForm = ref({
  customerName: '',
  customerPhone: '',
  quantity: 1
});

const totalPrice = computed(() => {
  if (!selectedTicket.value) return 0;
  return selectedTicket.value.price * bookingForm.value.quantity;
});

onMounted(async () => {
  const attractionId = Number(route.params.id);
  if (isNaN(attractionId)) {
    ElMessage.error('无效的景点ID');
    router.push('/attractions');
    return;
  }

  try {
    const response = await getAttractionDetail(attractionId);
    if (response.data.success) {
      attraction.value = response.data.data;
      console.log('景点详情数据:', attraction.value);
    } else {
      ElMessage.error(response.data.message || '获取景点详情失败');
      router.push('/attractions');
    }
  } catch (error) {
    console.error('Failed to fetch attraction details:', error);
    ElMessage.error('获取景点详情失败，请稍后重试');
    router.push('/attractions');
  }
});

const handleBookTicket = (ticket: Ticket) => {
  if (!userStore.user) {
    router.push('/login');
    return;
  }
  selectedTicket.value = ticket;
  showBookingForm.value = true;
};

const submitBooking = async () => {
  if (!selectedTicket.value || !attraction.value) return;

  loading.value = true;
  try {
    const response = await createOrder({
      userID: userStore.user.userID,
      attractionID: attraction.value.attractionID,
      ticketID: selectedTicket.value.ticketID,
      orderType: 'TICKET',
      totalAmount: totalPrice.value,
      customerName: bookingForm.value.customerName,
      customerPhone: bookingForm.value.customerPhone
    });

    if (response.data.success) {
      alert('预订成功！');
      showBookingForm.value = false;
      router.push('/user/orders');
    } else {
      alert('预订失败，请稍后重试');
    }
  } catch (error) {
    console.error('Booking failed:', error);
    alert('预订失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.attraction-detail {
  padding: 2rem;
}

.attraction-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.attraction-cover {
  flex: 1;
  max-width: 600px;
}

.attraction-cover img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.attraction-info {
  flex: 1;
}

.attraction-name {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.attraction-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.attraction-level {
  color: #1890ff;
  font-weight: bold;
}

.attraction-address {
  color: #666;
}

.attraction-hours,
.attraction-intro {
  margin-bottom: 2rem;
}

.attraction-hours h3,
.attraction-intro h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.ticket-section {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ticket-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

.ticket-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.ticket-card {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-info h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.ticket-price {
  color: #f5222d;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.ticket-stock {
  color: #666;
  margin-bottom: 0.5rem;
}

.ticket-desc {
  color: #666;
  font-size: 0.9rem;
}

.book-btn {
  padding: 0.75rem 1.5rem;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.book-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.book-btn:disabled {
  background-color: #bfbfbf;
  cursor: not-allowed;
}

.booking-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.booking-form {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.booking-form h2 {
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
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.total-price {
  font-size: 1.5rem;
  color: #f5222d;
  font-weight: bold;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background-color: #bfbfbf;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .attraction-header {
    flex-direction: column;
  }

  .attraction-cover {
    max-width: 100%;
  }

  .attraction-cover img {
    height: 300px;
  }
}
</style> 
<template>
  <div class="attraction-detail" v-loading="loading">
    <div v-if="attraction" class="detail-container">
      <div class="attraction-header">
        <img :src="attraction.coverImage" :alt="attraction.attractionName" class="cover-image">
        <div class="attraction-info">
          <h1>{{ attraction.attractionName }}</h1>
          <div class="info-item">
            <span class="label">景点等级：</span>
            <span class="value">{{ attraction.attractionLevel }}</span>
          </div>
          <div class="info-item">
            <span class="label">地址：</span>
            <span class="value">{{ attraction.attractionAddress }}</span>
          </div>
          <div class="info-item">
            <span class="label">开放时间：</span>
            <span class="value">{{ attraction.openingHours }}</span>
          </div>
        </div>
      </div>

      <div class="attraction-content">
        <h2>景点介绍</h2>
        <div class="introduction" v-html="attraction.introduction"></div>
      </div>

      <div class="ticket-section">
        <h2>门票预订</h2>
        <div class="ticket-list">
          <!-- <div v-for="ticket in attraction.ticketList" :key="ticket.ticketID" class="ticket-item"> -->
          <div v-for="ticket in tickets" :key="ticket.ticketID" class="ticket-item">
            <div class="ticket-info">
              <h3>{{ ticket.type }}</h3>
              <p class="price">¥{{ ticket.price }}</p>
              <p class="description">{{ ticket.description }}</p>
            </div>
            <el-button 
              type="primary" 
              @click="selectedTicket = ticket"
              :class="{ 'is-selected': selectedTicket?.ticketID === ticket.ticketID }"
            >
              选择
            </el-button>
          </div>
        </div>

        <div v-if="selectedTicket" class="booking-form">
          <h3>预订信息</h3>
          <div class="form-item">
            <span class="label">门票类型：</span>
            <span class="value">{{ selectedTicket.type }}</span>
          </div>
          <div class="form-item">
            <span class="label">单价：</span>
            <span class="value">¥{{ selectedTicket.price }}</span>
          </div>
          <div class="form-item">
            <span class="label">数量：</span>
            <el-input-number 
              v-model="quantity" 
              :min="1" 
              :max="selectedTicket.stock"
            />
          </div>
          <div class="form-item">
            <span class="label">总价：</span>
            <span class="value price">¥{{ (selectedTicket.price * quantity).toFixed(2) }}</span>
          </div>
          <el-button type="primary" @click="handleBook">立即预订</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { Attraction, Ticket } from '../types';
import { getAttractionDetail } from '../api/attraction';
import { createOrder } from '../api/order';
import { getTicketsByAttractionId } from '@/api/ticket';

const route = useRoute();
const router = useRouter();
// const loading = ref(false);
const loading = ref(true);
const attraction = ref<Attraction | null>(null);
const selectedTicket = ref<Ticket | null>(null);
const quantity = ref(1);
const tickets = ref<Ticket[]>([]); // 单独存储门票列表


const fetchAttractionDetail = async () => {
  const attractionID = Number(route.params.id);
  console.debug('[AttractionDetail] 开始获取景点详情:', { attractionID });

  if (!attractionID || isNaN(attractionID)) {
    console.error('[AttractionDetail] 无效的景点ID:', route.params.id);
    ElMessage.error('无效的景点ID');
    router.push('/attractions');
    return;
  }
  fetchTickets(attractionID);

  loading.value = true;
  try {
    console.debug('[AttractionDetail] 调用API获取景点详情');
    const response = await getAttractionDetail(attractionID);
    console.debug('[AttractionDetail] API响应:', response);

    if (response.data.success) {
      attraction.value = response.data.data;
      console.debug('[AttractionDetail] 设置景点数据:', attraction.value);
    } else {
      console.error('[AttractionDetail] API返回错误:', response.data.message);
      ElMessage.error(response.data.message || '获取景点详情失败');
      router.push('/attractions');
    }
  } catch (error) {
    console.error('[AttractionDetail] 获取景点详情失败:', error);
    ElMessage.error('获取景点详情失败');
    router.push('/attractions');
  } finally {
    loading.value = false;
  }
};

// 获取门票列表
const fetchTickets = async (attractionID: number) => {
  try {
    const response = await getTicketsByAttractionId(attractionID);
    
    if (response.data.success) {
      tickets.value = response.data.data;
      console.debug('门票列表获取成功:', tickets.value);
    } else {
      throw new Error(response.data.message || '获取门票列表失败');
    }
  } catch (error) {
    console.error('获取门票列表失败:', error);
    ElMessage.error('获取门票列表失败');
    throw error;
  }
};

const handleBook = async () => {
  if (!selectedTicket.value) {
    ElMessage.warning('请选择门票类型');
    return;
  }

  if (quantity.value < 1) {
    ElMessage.warning('请选择有效的门票数量');
    return;
  }

  try {
    const response = await createOrder({
      attractionID: attraction.value?.attractionID || 0,
      ticketID: selectedTicket.value.ticketID,
      quantity: quantity.value
    });

    if (response.data.success) {
      ElMessage.success('预订成功');
      router.push('/user/orders');
    } else {
      ElMessage.error(response.data.message || '预订失败');
    }
  } catch (error) {
    console.error('Failed to create order:', error);
    ElMessage.error('预订失败');
  }
};

// 确保组件挂载时调用
onMounted(() => {
  console.debug('[AttractionDetail] 组件挂载');
  fetchAttractionDetail();
  
});
</script>

<style scoped>
.attraction-detail {
  padding: 20px;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.attraction-header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.cover-image {
  width: 400px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.attraction-info {
  flex: 1;
}

.attraction-info h1 {
  margin: 0 0 20px 0;
  font-size: 24px;
}

.info-item {
  margin-bottom: 15px;
}

.label {
  color: #666;
  margin-right: 10px;
}

.attraction-content {
  margin-bottom: 30px;
}

.introduction {
  line-height: 1.6;
  color: #333;
}

.ticket-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.ticket-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.ticket-item {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-info h3 {
  margin: 0 0 10px 0;
}

.price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
  margin: 10px 0;
}

.description {
  color: #666;
  margin: 10px 0;
}

.booking-form {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.form-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.form-item .label {
  width: 80px;
}

.form-item .value {
  flex: 1;
}

.is-selected {
  background-color: #67c23a;
  border-color: #67c23a;
}
</style> 
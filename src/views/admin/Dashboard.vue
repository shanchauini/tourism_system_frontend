<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>总用户数</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ statistics.totalUsers }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>总景点数</span>
              <el-icon><Location /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ statistics.totalAttractions }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>总文章数</span>
              <el-icon><Document /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ statistics.totalArticles }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>总订单数</span>
              <el-icon><Tickets /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ statistics.totalOrders }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近订单</span>
            </div>
          </template>
          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column prop="orderID" label="订单号" width="100" />
            <el-table-column prop="customerName" label="客户名称" />
            <el-table-column prop="totalAmount" label="金额" width="100">
              <template #default="{ row }">
                ¥{{ row.totalAmount }}
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近文章</span>
            </div>
          </template>
          <el-table :data="recentArticles" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="author.nickName" label="作者" width="120" />
            <el-table-column prop="createTime" label="发布时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User, Location, Document, Tickets } from '@element-plus/icons-vue';
import type { Order, Article } from '../../types';

const statistics = ref({
  totalUsers: 0,
  totalAttractions: 0,
  totalArticles: 0,
  totalOrders: 0
});

const recentOrders = ref<Order[]>([]);
const recentArticles = ref<Article[]>([]);

onMounted(async () => {
  // TODO: 调用API获取统计数据
  statistics.value = {
    totalUsers: 100,
    totalAttractions: 20,
    totalArticles: 50,
    totalOrders: 200
  };

  // TODO: 调用API获取最近订单
  recentOrders.value = [
    {
      orderID: 1,
      customerName: '张三',
      totalAmount: 100,
      createTime: '2024-03-20 10:00:00',
      userID: 1,
      orderType: 'ticket',
      status: 'paid',
      customerPhone: '13800138000'
    }
  ];

  // TODO: 调用API获取最近文章
  recentArticles.value = [
    {
      articleID: 1,
      title: '示例文章',
      author: {
        userID: 1,
        nickName: '作者',
        gender: '男',
        phone: '13800138000',
        location: '北京',
        password: '',
        userType: 'tourist'
      },
      content: '',
      state: {
        state: 'published',
        canSubmit: false,
        canEdit: false,
        canDelete: false,
        canPublish: false,
        canReject: false,
        stateDescription: '已发布'
      },
      createTime: '2024-03-20 10:00:00',
      userID: 1
    }
  ];
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.data-card {
  height: 120px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-top: 10px;
}

.el-icon {
  font-size: 20px;
  color: #409eff;
}
</style> 
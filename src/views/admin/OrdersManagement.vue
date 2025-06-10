<template>
  <div class="orders-management">
    <div class="page-header">
      <h1>订单管理</h1>
      <div class="filters">
        <el-select v-model="filters.status" placeholder="订单状态" clearable>
          <el-option label="待支付" value="PENDING" />
          <el-option label="已支付" value="PAID" />
          <el-option label="已取消" value="CANCELLED" />
          <el-option label="已退款" value="REFUNDED" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <el-card class="orders-table">
      <el-table
        v-loading="loading"
        :data="orders"
        style="width: 100%"
      >
        <el-table-column prop="orderID" label="订单号" width="180" />
        <el-table-column prop="userName" label="用户名称" width="120" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="attractionName" label="景点名称" width="180" />
        <el-table-column prop="ticketType" label="门票类型" width="120" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                link
                @click="handleViewDetails(row)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="row.status === 'PENDING'"
                type="success"
                link
                @click="handleConfirmOrder(row)"
              >
                确认订单
              </el-button>
              <el-button
                v-if="row.status === 'PAID'"
                type="warning"
                link
                @click="handleRefund(row)"
              >
                退款
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="订单详情"
      width="600px"
    >
      <div v-if="selectedOrder" class="order-details">
        <div class="detail-item">
          <span class="label">订单号：</span>
          <span>{{ selectedOrder.orderID }}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户信息：</span>
          <span>{{ selectedOrder.userName }} ({{ selectedOrder.phone }})</span>
        </div>
        <div class="detail-item">
          <span class="label">景点：</span>
          <span>{{ selectedOrder.attractionName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">门票类型：</span>
          <span>{{ selectedOrder.ticketType }}</span>
        </div>
        <div class="detail-item">
          <span class="label">数量：</span>
          <span>{{ selectedOrder.quantity }}</span>
        </div>
        <div class="detail-item">
          <span class="label">总金额：</span>
          <span class="amount">¥{{ selectedOrder.totalAmount }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="getStatusType(selectedOrder.status)">
            {{ getStatusText(selectedOrder.status) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span>{{ formatDate(selectedOrder.createTime) }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="退款确认"
      width="500px"
    >
      <el-form
        ref="refundFormRef"
        :model="refundForm"
        :rules="refundRules"
        label-width="100px"
      >
        <el-form-item label="退款原因" prop="reason">
          <el-input
            v-model="refundForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入退款原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRefund" :loading="refundLoading">
            确认退款
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { TicketOrder } from '../../types/index';
// import { getOrders, confirmOrder, refundOrder } from '../../api/order';

const loading = ref(false);
const orders = ref<TicketOrder[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const filters = ref({
  status: '',
  dateRange: []
});

const detailsDialogVisible = ref(false);
const selectedOrder = ref<TicketOrder | null>(null);

const refundDialogVisible = ref(false);
const refundLoading = ref(false);
const refundFormRef = ref();
const refundForm = ref({
  reason: ''
});

const refundRules = {
  reason: [
    { required: true, message: '请输入退款原因', trigger: 'blur' },
    { min: 5, max: 200, message: '退款原因长度在 5 到 200 个字符', trigger: 'blur' }
  ]
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await getOrders({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: filters.value.status,
      startDate: filters.value.dateRange[0],
      endDate: filters.value.dateRange[1]
    });

    if (response.data.success) {
      orders.value = response.data.data.orders;
      total.value = response.data.data.total;
    } else {
      ElMessage.error(response.data.message || '获取订单列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchOrders();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchOrders();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchOrders();
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

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    PENDING: 'warning',
    PAID: 'success',
    CANCELLED: 'info',
    REFUNDED: 'info'
  };
  return typeMap[status] || 'info';
};

const handleViewDetails = (order: TicketOrder) => {
  selectedOrder.value = order;
  detailsDialogVisible.value = true;
};

const handleConfirmOrder = async (order: TicketOrder) => {
  try {
    await ElMessageBox.confirm('确定要确认该订单吗？', '提示', {
      type: 'warning'
    });

    const response = await confirmOrder(order.orderID);
    if (response.data.success) {
      ElMessage.success('订单已确认');
      fetchOrders();
    } else {
      ElMessage.error(response.data.message || '确认订单失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to confirm order:', error);
      ElMessage.error('确认订单失败');
    }
  }
};

const handleRefund = (order: TicketOrder) => {
  selectedOrder.value = order;
  refundForm.value.reason = '';
  refundDialogVisible.value = true;
};

const confirmRefund = async () => {
  if (!refundFormRef.value) return;

  try {
    await refundFormRef.value.validate();
    
    if (!selectedOrder.value) return;
    
    refundLoading.value = true;
    const response = await refundOrder({
      orderID: selectedOrder.value.orderID,
      reason: refundForm.value.reason
    });

    if (response.data.success) {
      ElMessage.success('退款申请已提交');
      refundDialogVisible.value = false;
      fetchOrders();
    } else {
      ElMessage.error(response.data.message || '退款申请失败');
    }
  } catch (error) {
    console.error('Failed to submit refund:', error);
    ElMessage.error('退款申请失败');
  } finally {
    refundLoading.value = false;
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.orders-management {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 1rem 0;
  color: #333;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.orders-table {
  margin-bottom: 2rem;
}

.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.order-details {
  padding: 1rem;
}

.detail-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.detail-item .label {
  width: 100px;
  color: #666;
}

.detail-item .amount {
  color: #f5222d;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style> 


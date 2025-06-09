<template>
  <div class="user-orders">
    <div class="page-header">
      <h2>我的订单</h2>
    </div>

    <el-card>
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="orderID" label="订单号" width="100" />
        <el-table-column prop="attractionName" label="景点名称" />
        <el-table-column prop="ticketType" label="门票类型" width="120" />
        <el-table-column prop="totalAmount" label="总价" width="100">
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
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                v-if="row.status === 'PENDING'"
                type="primary"
                link
                @click="handlePay(row)"
              >
                支付
              </el-button>
              <el-button
                v-if="row.status === 'PENDING'"
                type="danger"
                link
                @click="handleCancel(row)"
              >
                取消
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
    </el-card>

    <!-- 支付对话框 -->
    <el-dialog
      v-model="payDialogVisible"
      title="订单支付"
      width="400px"
    >
      <div class="payment-info">
        <p>订单号：{{ selectedOrder?.orderID }}</p>
        <p>支付金额：¥{{ selectedOrder?.totalAmount }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="payDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPay">
            确认支付
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="申请退款"
      width="400px"
    >
      <el-form
        ref="refundFormRef"
        :model="refundForm"
        :rules="refundRules"
        label-width="80px"
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
          <el-button type="primary" @click="confirmRefund">
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
import type { TicketOrder } from '../types';
import { getUserOrders, cancelOrder } from '../api/order';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const orders = ref<TicketOrder[]>([]);

// 支付相关
const payDialogVisible = ref(false);
const selectedOrder = ref<TicketOrder | null>(null);

// 退款相关
const refundDialogVisible = ref(false);
const refundFormRef = ref();
const refundForm = ref({
  reason: ''
});

const refundRules = {
  reason: [{ required: true, message: '请输入退款原因', trigger: 'blur' }]
};

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    PENDING: 'warning',
    PAID: 'success',
    CANCELLED: 'info',
    REFUNDED: 'info'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    CANCELLED: '已取消',
    REFUNDED: '已退款'
  };
  return textMap[status] || status;
};

// 获取订单列表
const fetchOrders = async () => {
  try {
    const response = await getUserOrders(userStore.user.userID);
    if (response.data.success) {
      orders.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    ElMessage.error('获取订单列表失败');
  }
};

// 支付订单
const handlePay = (order: TicketOrder) => {
  selectedOrder.value = order;
  payDialogVisible.value = true;
};

const confirmPay = async () => {
  if (!selectedOrder.value) return;
  
  try {
    // TODO: 调用支付API
    ElMessage.success('支付成功');
    payDialogVisible.value = false;
    fetchOrders();
  } catch (error) {
    console.error('Payment failed:', error);
    ElMessage.error('支付失败，请稍后重试');
  }
};

// 取消订单
const handleCancel = async (order: TicketOrder) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning'
    });
    
    const response = await cancelOrder(order.orderID);
    if (response.data.success) {
      ElMessage.success('订单已取消');
      fetchOrders();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to cancel order:', error);
      ElMessage.error('取消订单失败，请稍后重试');
    }
  }
};

// 申请退款
const handleRefund = (order: TicketOrder) => {
  selectedOrder.value = order;
  refundForm.value.reason = '';
  refundDialogVisible.value = true;
};

const confirmRefund = async () => {
  if (!refundFormRef.value || !selectedOrder.value) return;
  
  try {
    await refundFormRef.value.validate();
    // TODO: 调用退款API
    ElMessage.success('退款申请已提交');
    refundDialogVisible.value = false;
    fetchOrders();
  } catch (error) {
    console.error('Refund failed:', error);
    ElMessage.error('申请退款失败，请稍后重试');
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.user-orders {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.payment-info {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.payment-info p {
  margin: 10px 0;
  color: #666;
}
</style> 
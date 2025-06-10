<template>
  <div class="user-center">
    <el-container>
      <el-aside width="250px">
        <div class="user-info">
          <h2>{{ userStore.user?.nickname || userStore.user?.username }}</h2>
          <p class="user-role">{{ userStore.user?.userType === 'ADMIN' ? '管理员' : '普通用户' }}</p>
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
      </el-aside>

      <el-main>
        <!-- 个人信息 -->
        <div v-if="activeMenu === 'profile'" class="profile-section">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>个人信息</span>
                <el-button type="primary" @click="handleEdit">编辑</el-button>
              </div>
            </template>
            <div class="info-list">
              <div class="info-item">
                <span class="label">用户名：</span>
                <span class="value">{{ userStore.user?.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">昵称：</span>
                <span class="value">{{ userStore.user?.nickname }}</span>
              </div>
              <div class="info-item">
                <span class="label">邮箱：</span>
                <span class="value">{{ userStore.user?.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机：</span>
                <span class="value">{{ userStore.user?.phone }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 我的文章 -->
        <div v-if="activeMenu === 'articles'" class="articles-section">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>我的文章</span>
                <el-button type="primary" @click="handleAddArticle">写新文章</el-button>
              </div>
            </template>
            <el-table :data="articles" style="width: 100%">
              <el-table-column prop="title" label="标题" />
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column prop="state" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStateType(row.state)">{{ getStateText(row.state) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button 
                    v-if="row.state === 'DRAFT'"
                    type="primary" 
                    size="small" 
                    @click="handleEditArticle(row)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    v-if="row.state === 'DRAFT'"
                    type="success" 
                    size="small" 
                    @click="handleSubmitArticle(row)"
                  >
                    提交审核
                  </el-button>
                  <el-button 
                    v-if="row.state === 'REJECTED'"
                    type="warning" 
                    size="small" 
                    @click="handleResubmitArticle(row)"
                  >
                    重新提交
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 我的订单 -->
        <div v-if="activeMenu === 'orders'" class="orders-section">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>我的订单</span>
              </div>
            </template>
            <el-table :data="orders" style="width: 100%">
              <el-table-column prop="orderID" label="订单号" width="180" />
              <el-table-column prop="attractionName" label="景点名称" />
              <el-table-column prop="ticketType" label="门票类型" />
              <el-table-column prop="quantity" label="数量" width="80" />
              <el-table-column prop="totalAmount" label="总金额" width="120">
                <template #default="{ row }">
                  ¥{{ row.totalAmount }}
                </template>
              </el-table-column>
              <el-table-column prop="orderTime" label="下单时间" width="180" />
              <el-table-column prop="orderStatus" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getOrderStatusType(row.orderStatus)">
                    {{ getOrderStatusText(row.orderStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button 
                    v-if="row.orderStatus === 'PENDING'"
                    type="primary" 
                    size="small" 
                    @click="handlePayOrder(row)"
                  >
                    支付
                  </el-button>
                  <el-button 
                    v-if="row.orderStatus === 'PENDING'"
                    type="danger" 
                    size="small" 
                    @click="handleCancelOrder(row)"
                  >
                    取消
                  </el-button>
                  <el-button 
                    v-if="row.orderStatus === 'PAID'"
                    type="warning" 
                    size="small" 
                    @click="handleRefundOrder(row)"
                  >
                    申请退款
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-main>
    </el-container>

    <!-- 编辑个人信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人信息"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 文章编辑对话框 -->
    <el-dialog
      v-model="articleDialogVisible"
      :title="currentArticle ? '编辑文章' : '写新文章'"
      width="800px"
    >
      <el-form
        ref="articleFormRef"
        :model="articleForm"
        :rules="articleRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="articleForm.title" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="articleForm.content"
            type="textarea"
            :rows="10"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="articleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitArticle">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Document, Tickets } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { getUserArticles, createArticle, updateArticle, submitArticle } from '../api/article';
import { getUserOrders, cancelOrder, refundOrder } from '../api/order';
import { updateUserInfo } from '../api/user';

const userStore = useUserStore();
const activeMenu = ref('profile');
const articles = ref([]);
const orders = ref([]);
const loading = ref(false);

// 编辑个人信息相关
const editDialogVisible = ref(false);
const editFormRef = ref<FormInstance>();
const editForm = ref({
  nickname: '',
  email: '',
  phone: ''
});

const editRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
};

// 文章相关
const articleDialogVisible = ref(false);
const articleFormRef = ref<FormInstance>();
const currentArticle = ref(null);
const articleForm = ref({
  title: '',
  content: ''
});

const articleRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, message: '内容不能少于 10 个字符', trigger: 'blur' }
  ]
};

// 获取文章列表
const fetchArticles = async () => {
  try {
    const response = await getUserArticles();
    if (response.data.success) {
      articles.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    ElMessage.error('获取文章列表失败');
  }
};

// 获取订单列表
const fetchOrders = async () => {
  try {
    const response = await getUserOrders();
    if (response.data.success) {
      orders.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    ElMessage.error('获取订单列表失败');
  }
};

// 菜单选择处理
const handleMenuSelect = (key: string) => {
  activeMenu.value = key;
  if (key === 'articles') {
    fetchArticles();
  } else if (key === 'orders') {
    fetchOrders();
  }
};

// 编辑个人信息
const handleEdit = () => {
  editForm.value = {
    nickname: userStore.user?.nickname || '',
    email: userStore.user?.email || '',
    phone: userStore.user?.phone || ''
  };
  editDialogVisible.value = true;
};

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return;
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await updateUserInfo({
          userID: userStore.user?.userID || 0,
          ...editForm.value
        });

        if (response.data.success) {
          ElMessage.success('更新成功');
          editDialogVisible.value = false;
          // 更新用户信息
          userStore.setUser(response.data.data);
        } else {
          ElMessage.error(response.data.message || '更新失败');
        }
      } catch (error) {
        console.error('Failed to update user info:', error);
        ElMessage.error('更新失败');
      }
    }
  });
};

// 写新文章
const handleAddArticle = () => {
  currentArticle.value = null;
  articleForm.value = {
    title: '',
    content: ''
  };
  articleDialogVisible.value = true;
};

// 编辑文章
const handleEditArticle = (article: any) => {
  currentArticle.value = article;
  articleForm.value = {
    title: article.title,
    content: article.content
  };
  articleDialogVisible.value = true;
};

// 提交文章
const submitArticle = async () => {
  if (!articleFormRef.value) return;
  
  await articleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = currentArticle.value
          ? await updateArticle({
              articleID: currentArticle.value.articleID,
              ...articleForm.value
            })
          : await createArticle(articleForm.value);

        if (response.data.success) {
          ElMessage.success(currentArticle.value ? '更新成功' : '创建成功');
          articleDialogVisible.value = false;
          fetchArticles();
        } else {
          ElMessage.error(response.data.message || (currentArticle.value ? '更新失败' : '创建失败'));
        }
      } catch (error) {
        console.error('Failed to submit article:', error);
        ElMessage.error(currentArticle.value ? '更新失败' : '创建失败');
      }
    }
  });
};

// 提交文章审核
const handleSubmitArticle = async (article: any) => {
  try {
    const response = await submitArticle(article.articleID);
    if (response.data.success) {
      ElMessage.success('提交成功');
      fetchArticles();
    } else {
      ElMessage.error(response.data.message || '提交失败');
    }
  } catch (error) {
    console.error('Failed to submit article:', error);
    ElMessage.error('提交失败');
  }
};

// 重新提交文章
const handleResubmitArticle = (article: any) => {
  handleEditArticle(article);
};

// 获取文章状态类型
const getStateType = (state: string) => {
  switch (state) {
    case 'DRAFT':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'PUBLISHED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取文章状态文本
const getStateText = (state: string) => {
  switch (state) {
    case 'DRAFT':
      return '草稿';
    case 'PENDING':
      return '待审核';
    case 'PUBLISHED':
      return '已发布';
    case 'REJECTED':
      return '已拒绝';
    default:
      return '未知';
  }
};

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'PAID':
      return 'success';
    case 'CANCELLED':
      return 'info';
    case 'REFUNDED':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '待支付';
    case 'PAID':
      return '已支付';
    case 'CANCELLED':
      return '已取消';
    case 'REFUNDED':
      return '已退款';
    default:
      return '未知';
  }
};

// 支付订单
const handlePayOrder = async (order: any) => {
  try {
    const response = await createOrder({
      orderID: order.orderID,
      status: 'PAID'
    });
    if (response.data.success) {
      ElMessage.success('支付成功');
      fetchOrders();
    } else {
      ElMessage.error(response.data.message || '支付失败');
    }
  } catch (error) {
    console.error('Failed to pay order:', error);
    ElMessage.error('支付失败');
  }
};

// 取消订单
const handleCancelOrder = async (order: any) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning'
    });
    
    const response = await cancelOrder(order.orderID);
    if (response.data.success) {
      ElMessage.success('取消成功');
      fetchOrders();
    } else {
      ElMessage.error(response.data.message || '取消失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to cancel order:', error);
      ElMessage.error('取消失败');
    }
  }
};

// 申请退款
const handleRefundOrder = async (order: any) => {
  try {
    await ElMessageBox.confirm('确定要申请退款吗？', '提示', {
      type: 'warning'
    });
    
    const response = await refundOrder(order.orderID);
    if (response.data.success) {
      ElMessage.success('申请成功');
      fetchOrders();
    } else {
      ElMessage.error(response.data.message || '申请失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to refund order:', error);
      ElMessage.error('申请失败');
    }
  }
};

onMounted(() => {
  fetchArticles();
  fetchOrders();
});
</script>

<style scoped>
.user-center {
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}

.user-info {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #e6e6e6;
}

.user-info h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.user-role {
  margin: 10px 0 0;
  color: #666;
  font-size: 14px;
}

.user-menu {
  border-right: none;
}

.el-main {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-list {
  padding: 20px 0;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.info-item .label {
  width: 80px;
  color: #666;
}

.info-item .value {
  flex: 1;
  color: #333;
}

.articles-section,
.orders-section {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 
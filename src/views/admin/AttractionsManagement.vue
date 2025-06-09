<template>
  <div class="attractions-management">
    <div class="header">
      <h2>景点管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加景点
      </el-button>
    </div>

    <el-table :data="attractions" v-loading="loading" border>
      <el-table-column prop="attractionName" label="景点名称" />
      <el-table-column prop="attractionLevel" label="景点等级" />
      <el-table-column prop="attractionAddress" label="地址" />
      <el-table-column prop="openingHours" label="开放时间" />
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link @click="handleTickets(row)">门票管理</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 景点表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加景点' : '编辑景点'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="景点名称" prop="attractionName">
          <el-input v-model="form.attractionName" />
        </el-form-item>
        <el-form-item label="景点等级" prop="attractionLevel">
          <el-select v-model="form.attractionLevel" placeholder="请选择景点等级">
            <el-option label="5A" value="5A" />
            <el-option label="4A" value="4A" />
            <el-option label="3A" value="3A" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="attractionAddress">
          <el-input v-model="form.attractionAddress" />
        </el-form-item>
        <el-form-item label="开放时间" prop="openingHours">
          <el-input v-model="form.openingHours" />
        </el-form-item>
        <el-form-item label="景点介绍" prop="introduction">
          <el-input
            v-model="form.introduction"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item label="封面图片" prop="coverImage">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="form.coverImage" :src="form.coverImage" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 门票管理对话框 -->
    <el-dialog
      title="门票管理"
      v-model="ticketDialogVisible"
      width="800px"
    >
      <div class="ticket-header">
        <h3>{{ currentAttraction?.attractionName }} - 门票列表</h3>
        <el-button type="primary" @click="handleAddTicket(currentAttraction)">
          <el-icon><Plus /></el-icon>添加门票
        </el-button>
      </div>

      <el-table :data="currentAttraction?.ticketList || []" border>
        <el-table-column prop="type" label="门票类型" />
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存">
          <template #default="{ row }">
            <el-input-number
              v-model="row.stock"
              :min="0"
              @change="(val) => handleUpdateStock(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEditTicket(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteTicket(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 门票表单对话框 -->
    <el-dialog
      :title="ticketForm.ticketID === 0 ? '添加门票' : '编辑门票'"
      v-model="ticketFormVisible"
      width="500px"
    >
      <el-form
        ref="ticketFormRef"
        :model="ticketForm"
        :rules="ticketRules"
        label-width="100px"
      >
        <el-form-item label="门票类型" prop="type">
          <el-input v-model="ticketForm.type" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="ticketForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="ticketForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input
            v-model="ticketForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ticketFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTicketSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import type { Attraction, Ticket } from '../../types';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAllAttractions, addAttraction, updateAttraction, deleteAttraction } from '../../api/attraction';
import { getTicketsByAttractionId,addTicket, updateTicket, deleteTicket, updateTicketStock } from '../../api/ticket';
import { getAttractionDetail } from '../../api/attraction';

const loading = ref(false);
const attractions = ref<Attraction[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();
const form = ref({
  attractionID: 0,
  attractionName: '',
  attractionLevel: '',
  attractionAddress: '',
  openingHours: '',
  introduction: '',
  coverImage: ''
});

const rules = {
  attractionName: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  attractionLevel: [{ required: true, message: '请选择景点等级', trigger: 'change' }],
  attractionAddress: [{ required: true, message: '请输入景点地址', trigger: 'blur' }],
  openingHours: [{ required: true, message: '请输入开放时间', trigger: 'blur' }],
  introduction: [{ required: true, message: '请输入景点介绍', trigger: 'blur' }]
};

const ticketDialogVisible = ref(false);
const ticketFormVisible = ref(false);
const ticketFormRef = ref();
const ticketForm = ref({
  ticketID: 0,
  attractionID: 0,
  type: '',
  price: 0,
  stock: 0,
  description: ''
});

const ticketRules = {
  type: [{ required: true, message: '请输入门票类型', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入门票价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存必须大于0', trigger: 'blur' }
  ]
};

const currentAttraction = ref<Attraction | null>(null);

const fetchAttractions = async () => {
  loading.value = true;
  try {
    const response = await getAllAttractions();
    if (response.data.success) {
      attractions.value = response.data.data;
      total.value = response.data.data.length;
    } else {
      ElMessage.error(response.data.message || '获取景点列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch attractions:', error);
    ElMessage.error('获取景点列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchAttractions();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchAttractions();
};

const handleAdd = () => {
  dialogType.value = 'add';
  form.value = {
    attractionID: 0,
    attractionName: '',
    attractionLevel: '',
    attractionAddress: '',
    openingHours: '',
    introduction: '',
    coverImage: ''
  };
  dialogVisible.value = true;
};

const handleEdit = (row: Attraction) => {
  dialogType.value = 'edit';
  form.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: Attraction) => {
  try {
    await ElMessageBox.confirm('确定要删除该景点吗？', '提示', {
      type: 'warning'
    });

    const response = await deleteAttraction(row.attractionID);
    if (response.data.success) {
      ElMessage.success('删除成功');
      fetchAttractions();
    } else {
      ElMessage.error(response.data.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete attraction:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    
    const response = dialogType.value === 'add'
      ? await addAttraction(form.value)
      : await updateAttraction(form.value);

    if (response.data.success) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功');
      dialogVisible.value = false;
      fetchAttractions();
    } else {
      ElMessage.error(response.data.message || '操作失败');
    }
  } catch (error) {
    console.error('Failed to submit form:', error);
    ElMessage.error('操作失败');
  }
};

const handleTickets = async (row: Attraction) => {
  currentAttraction.value = row;
  ticketDialogVisible.value = true;
  // 获取该景点的门票列表
  try {
    const response = await getTicketsByAttractionId(row.attractionID);//
    if (response.data.success) {
      currentAttraction.value = response.data.data;
    } else {
      ElMessage.error(response.data.message || '获取门票列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    ElMessage.error('获取门票列表失败');
  }
};

const handleAddTicket = (attraction: Attraction) => {
  ticketForm.value = {
    ticketID: 0,
    attractionID: attraction.attractionID,
    type: '',
    price: 0,
    stock: 0,
    description: ''
  };
  ticketFormVisible.value = true;
};

const handleEditTicket = (ticket: Ticket) => {
  ticketForm.value = { ...ticket };
  ticketFormVisible.value = true;
};

const handleDeleteTicket = async (ticket: Ticket) => {
  try {
    await ElMessageBox.confirm('确定要删除该门票吗？', '提示', {
      type: 'warning'
    });

    const response = await deleteTicket(ticket.ticketID);
    if (response.data.success) {
      ElMessage.success('删除成功');
      fetchAttractions();
    } else {
      ElMessage.error(response.data.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete ticket:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleTicketSubmit = async () => {
  if (!ticketFormRef.value) return;

  try {
    await ticketFormRef.value.validate();
    
    const response = ticketForm.value.ticketID === 0
      ? await addTicket(ticketForm.value)
      : await updateTicket(ticketForm.value);

    if (response.data.success) {
      ElMessage.success(ticketForm.value.ticketID === 0 ? '添加成功' : '编辑成功');
      ticketFormVisible.value = false;
      fetchAttractions();
    } else {
      ElMessage.error(response.data.message || '操作失败');
    }
  } catch (error) {
    console.error('Failed to submit ticket form:', error);
    ElMessage.error('操作失败');
  }
};

const handleUpdateStock = async (ticket: Ticket, newStock: number) => {
  try {
    const response = await updateTicketStock(ticket.ticketID, newStock);
    if (response.data.success) {
      ElMessage.success('库存更新成功');
      fetchAttractions();
    } else {
      ElMessage.error(response.data.message || '更新失败');
    }
  } catch (error) {
    console.error('Failed to update ticket stock:', error);
    ElMessage.error('更新失败');
  }
};

const handleUploadSuccess = (response: any) => {
  form.value.coverImage = response.url;
};

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return false;
  }
  return true;
};

onMounted(() => {
  fetchAttractions();
});
</script>

<style scoped>
.attractions-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style> 
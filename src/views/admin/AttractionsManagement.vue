<template>
  <div class="attractions-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>景点管理</span>
          <el-button type="primary" @click="handleAdd">添加景点</el-button>
        </div>
      </template>

      <el-table :data="attractions" style="width: 100%" v-loading="loading">
        <el-table-column prop="attractionName" label="景点名称" />
        <el-table-column prop="attractionLevel" label="景点等级" width="120" />
        <el-table-column prop="attractionAddress" label="地址" />
        <el-table-column prop="openingHours" label="开放时间" width="180" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="handleTickets(row)"
            >
              门票管理
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 景点表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentAttraction ? '编辑景点' : '添加景点'"
      width="800px"
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
            <el-option label="2A" value="2A" />
            <el-option label="1A" value="1A" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="attractionAddress">
          <el-input v-model="form.attractionAddress" />
        </el-form-item>
        <el-form-item label="开放时间" prop="openingHours">
          <el-input v-model="form.openingHours" />
        </el-form-item>
        <el-form-item label="封面图片" prop="coverImage">
          <el-upload
            class="cover-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="form.coverImage" :src="form.coverImage" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="景点介绍" prop="introduction">
          <el-input
            v-model="form.introduction"
            type="textarea"
            :rows="6"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 门票管理对话框 -->
    <el-dialog
      v-model="ticketDialogVisible"
      title="门票管理"
      width="800px"
    >
      <div v-if="currentAttraction" class="ticket-management">
        <div class="ticket-header">
          <h3>{{ currentAttraction.attractionName }} - 门票管理</h3>
          <el-button type="primary" @click="handleAddTicket">添加门票</el-button>
        </div>

        <el-table :data="currentAttraction.ticketList || []" border>
          <el-table-column prop="type" label="门票类型" />
          <el-table-column prop="price" label="价格">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.stock"
                :min="0"
                :max="9999"
                size="small"
                @change="(value) => handleStockChange(row.ticketID, value)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleEditTicket(row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDeleteTicket(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 门票表单对话框 -->
    <el-dialog
      v-model="ticketFormVisible"
      :title="currentTicket ? '编辑门票' : '添加门票'"
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
          <el-input-number
            v-model="ticketForm.price"
            :min="0"
            :precision="2"
            :step="10"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="ticketForm.stock"
            :min="0"
            :max="9999"
          />
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
        <span class="dialog-footer">
          <el-button @click="ticketFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTicketForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance, UploadProps } from 'element-plus';
import { getAllAttractions, addAttraction, updateAttraction, deleteAttraction } from '../../api/attraction';
import { getTicketsByAttractionId, addTicket, updateTicket, deleteTicket, updateTicketStock } from '../../api/ticket';

const loading = ref(false);
const attractions = ref([]);
const dialogVisible = ref(false);
const ticketDialogVisible = ref(false);
const ticketFormVisible = ref(false);
const currentAttraction = ref(null);
const currentTicket = ref(null);
const formRef = ref<FormInstance>();
const ticketFormRef = ref<FormInstance>();

const form = ref({
  attractionName: '',
  attractionLevel: '',
  attractionAddress: '',
  openingHours: '',
  coverImage: '',
  introduction: ''
});

const ticketForm = ref({
  type: '',
  price: 0,
  stock: 0,
  description: ''
});

const rules = {
  attractionName: [
    { required: true, message: '请输入景点名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  attractionLevel: [
    { required: true, message: '请选择景点等级', trigger: 'change' }
  ],
  attractionAddress: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ],
  openingHours: [
    { required: true, message: '请输入开放时间', trigger: 'blur' }
  ],
  coverImage: [
    { required: true, message: '请上传封面图片', trigger: 'change' }
  ],
  introduction: [
    { required: true, message: '请输入景点介绍', trigger: 'blur' },
    { min: 10, message: '内容不能少于 10 个字符', trigger: 'blur' }
  ]
};

const ticketRules = {
  type: [
    { required: true, message: '请输入门票类型', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入说明', trigger: 'blur' }
  ]
};

// 获取景点列表
const fetchAttractions = async () => {
  loading.value = true;
  try {
    const response = await getAllAttractions();
    if (response.data.success) {
      attractions.value = response.data.data;
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

// 添加景点
const handleAdd = () => {
  currentAttraction.value = null;
  form.value = {
    attractionName: '',
    attractionLevel: '',
    attractionAddress: '',
    openingHours: '',
    coverImage: '',
    introduction: ''
  };
  dialogVisible.value = true;
};

// 编辑景点
const handleEdit = (attraction: any) => {
  currentAttraction.value = attraction;
  form.value = { ...attraction };
  dialogVisible.value = true;
};

// 删除景点
const handleDelete = async (attraction: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该景点吗？', '提示', {
      type: 'warning'
    });
    
    const response = await deleteAttraction(attraction.attractionID);
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

// 提交景点表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = currentAttraction.value
          ? await updateAttraction({
              attractionID: currentAttraction.value.attractionID,
              ...form.value
            })
          : await addAttraction(form.value);

        if (response.data.success) {
          ElMessage.success(currentAttraction.value ? '更新成功' : '添加成功');
          dialogVisible.value = false;
          fetchAttractions();
        } else {
          ElMessage.error(response.data.message || (currentAttraction.value ? '更新失败' : '添加失败'));
        }
      } catch (error) {
        console.error('Failed to submit attraction:', error);
        ElMessage.error(currentAttraction.value ? '更新失败' : '添加失败');
      }
    }
  });
};

// 图片上传相关
const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/upload';

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return false;
  }
  return true;
};

const handleUploadSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.success) {
    form.value.coverImage = response.data.url;
  } else {
    ElMessage.error('上传失败');
  }
};

// 门票管理相关
const handleTickets = async (attraction: any) => {
  currentAttraction.value = attraction;
  try {
    const response = await getTicketsByAttractionId(attraction.attractionID);
    if (response.data.success) {
      currentAttraction.value = {
        ...attraction,
        ticketList: response.data.data
      };
      ticketDialogVisible.value = true;
    } else {
      ElMessage.error(response.data.message || '获取门票列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    ElMessage.error('获取门票列表失败');
  }
};

// 添加门票
const handleAddTicket = () => {
  currentTicket.value = null;
  ticketForm.value = {
    type: '',
    price: 0,
    stock: 0,
    description: ''
  };
  ticketFormVisible.value = true;
};

// 编辑门票
const handleEditTicket = (ticket: any) => {
  currentTicket.value = ticket;
  ticketForm.value = { ...ticket };
  ticketFormVisible.value = true;
};

// 删除门票
const handleDeleteTicket = async (ticket: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该门票吗？', '提示', {
      type: 'warning'
    });
    
    const response = await deleteTicket(ticket.ticketID);
    if (response.data.success) {
      ElMessage.success('删除成功');
      handleTickets(currentAttraction.value);
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

// 更新门票库存
const handleStockChange = async (ticketID: number, value: number) => {
  try {
    const response = await updateTicketStock(ticketID, value);
    if (response.data.success) {
      ElMessage.success('更新成功');
    } else {
      ElMessage.error(response.data.message || '更新失败');
    }
  } catch (error) {
    console.error('Failed to update ticket stock:', error);
    ElMessage.error('更新失败');
  }
};

// 提交门票表单
const submitTicketForm = async () => {
  if (!ticketFormRef.value || !currentAttraction.value) return;
  
  await ticketFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = currentTicket.value
          ? await updateTicket({
              ticketID: currentTicket.value.ticketID,
              attractionID: currentAttraction.value.attractionID,
              ...ticketForm.value
            })
          : await addTicket({
              attractionID: currentAttraction.value.attractionID,
              ...ticketForm.value
            });

        if (response.data.success) {
          ElMessage.success(currentTicket.value ? '更新成功' : '添加成功');
          ticketFormVisible.value = false;
          handleTickets(currentAttraction.value);
        } else {
          ElMessage.error(response.data.message || (currentTicket.value ? '更新失败' : '添加失败'));
        }
      } catch (error) {
        console.error('Failed to submit ticket:', error);
        ElMessage.error(currentTicket.value ? '更新失败' : '添加失败');
      }
    }
  });
};

onMounted(() => {
  fetchAttractions();
});
</script>

<style scoped>
.attractions-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 300px;
  height: 200px;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 300px;
  height: 200px;
  line-height: 200px;
  text-align: center;
}

.cover-image {
  width: 300px;
  height: 200px;
  display: block;
  object-fit: cover;
}

.ticket-management {
  padding: 20px;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ticket-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 
<template>
  <div class="users-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-select v-model="userTypeFilter" placeholder="用户类型" clearable>
          <el-option label="全部" value="" />
          <el-option label="游客" value="tourist" />
          <el-option label="管理员" value="admin" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户ID/昵称"
          clearable
          style="width: 200px"
        />
      </div>
    </div>

    <el-card>
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="userID" label="用户ID" width="100" />
        <el-table-column prop="userType" label="用户类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.userType === 'admin' ? 'danger' : 'success'">
              {{ row.userType === 'admin' ? '管理员' : '游客' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nickName" label="昵称" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="location" label="所在地" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button
                v-if="row.userType === 'tourist'"
                type="success"
                link
                @click="handleUpgrade(row)"
              >
                升级管理员
              </el-button>
              <el-button
                v-if="row.userType === 'admin'"
                type="warning"
                link
                @click="handleDowngrade(row)"
              >
                降级游客
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
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
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户ID" prop="userID">
          <el-input v-model="form.userID" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="form.userType" placeholder="请选择用户类型">
            <el-option label="游客" value="tourist" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="所在地" prop="location">
          <el-input v-model="form.location" />
        </el-form-item>
        <el-form-item
          v-if="dialogType === 'add'"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="form.password"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { User } from '../../types';
import { getAllUsers, updateUserInfo, deleteUser } from '../../api/user';

// 筛选相关
const userTypeFilter = ref('');
const searchKeyword = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 用户列表数据
const users = ref<User[]>([]);

// 表单相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();
const form = ref({
  userID: 0,
  username: '',
  nickName: '',
  email: '',
  phone: '',
  role: 'USER'
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

const loading = ref(false);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await getAllUsers();
    if (response.data.success) {
      users.value = response.data.data;
      total.value = response.data.data.length;
    } else {
      ElMessage.error(response.data.message || '获取用户列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUsers();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchUsers();
};

const handleAdd = () => {
  dialogType.value = 'add';
  form.value = {
    userID: 0,
    username: '',
    nickName: '',
    email: '',
    phone: '',
    role: 'USER'
  };
  dialogVisible.value = true;
};

const handleEdit = (row: User) => {
  dialogType.value = 'edit';
  form.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning'
    });

    const response = await deleteUser(row.userID);
    if (response.data.success) {
      ElMessage.success('删除成功');
      fetchUsers();
    } else {
      ElMessage.error(response.data.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete user:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    
    const response = await updateUserInfo(form.value);
    if (response.data.success) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功');
      dialogVisible.value = false;
      fetchUsers();
    } else {
      ElMessage.error(response.data.message || '操作失败');
    }
  } catch (error) {
    console.error('Failed to submit form:', error);
    ElMessage.error('操作失败');
  }
};

const handleUpgrade = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要将该用户升级为管理员吗？', '提示', {
      type: 'warning'
    });

    const response = await updateUserInfo({
      ...row,
      role: 'ADMIN'
    });

    if (response.data.success) {
      ElMessage.success('升级成功');
      fetchUsers();
    } else {
      ElMessage.error(response.data.message || '升级失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to upgrade user:', error);
      ElMessage.error('升级失败');
    }
  }
};

const handleDowngrade = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要将该管理员降级为普通用户吗？', '提示', {
      type: 'warning'
    });

    const response = await updateUserInfo({
      ...row,
      role: 'USER'
    });

    if (response.data.success) {
      ElMessage.success('降级成功');
      fetchUsers();
    } else {
      ElMessage.error(response.data.message || '降级失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to downgrade user:', error);
      ElMessage.error('降级失败');
    }
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 
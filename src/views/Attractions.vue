<template>
  <div class="attractions">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-inputs">
        <input
          type="text"
          v-model="searchParams.name"
          placeholder="景点名称"
          class="search-input"
        />
        <input
          type="text"
          v-model="searchParams.address"
          placeholder="地址"
          class="search-input"
        />
        <select v-model="searchParams.level" class="search-select">
          <option value="">所有等级</option>
          <option value="5A">5A级</option>
          <option value="4A">4A级</option>
          <option value="3A">3A级</option>
        </select>
        <button @click="handleSearch" class="search-btn">搜索</button>
      </div>
    </div>

    <!-- 景点列表 -->
    <div class="attraction-list">
      <div v-for="attraction in attractions" :key="attraction.attractionID" class="attraction-item">
        <div class="attraction-image">
          <img :src="attraction.coverImage" :alt="attraction.attractionName" />
        </div>
        <div class="attraction-content">
          <h2 class="attraction-name">{{ attraction.attractionName }}</h2>
          <div class="attraction-info">
            <span class="attraction-level">{{ attraction.attractionLevel }}</span>
            <span class="attraction-address">{{ attraction.attractionAddress }}</span>
          </div>
          <p class="attraction-intro">{{ attraction.introduction }}</p>
          <div class="attraction-footer">
            <span class="opening-hours">开放时间：{{ attraction.openingHours }}</span>
            <router-link :to="`/attractions/${attraction.attractionID}`" class="view-detail">
              查看详情
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && attractions.length === 0" class="no-data">
      <p>暂无景点数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { Attraction } from '../types';
import { getAllAttractions, searchAttractions } from '../api/attraction';

const attractions = ref<Attraction[]>([]);
const loading = ref(false);

const searchParams = reactive({
  name: '',
  address: '',
  level: ''
});

const fetchAttractions = async () => {
  loading.value = true;
  try {
    const response = await getAllAttractions();
    if (response.data.success) {
      attractions.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch attractions:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = async () => {
  loading.value = true;
  try {
    const response = await searchAttractions(searchParams);
    if (response.data.success) {
      attractions.value = response.data.data;
    }
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAttractions();
});
</script>

<style scoped>
.attractions {
  padding: 2rem;
}

.search-bar {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-inputs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input,
.search-select {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-btn {
  padding: 0.75rem 2rem;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #40a9ff;
}

.attraction-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.attraction-item {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.attraction-image {
  width: 300px;
  height: 200px;
  overflow: hidden;
}

.attraction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attraction-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.attraction-name {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.attraction-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.attraction-level {
  color: #1890ff;
  font-weight: bold;
}

.attraction-address {
  color: #666;
}

.attraction-intro {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex: 1;
}

.attraction-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.opening-hours {
  color: #666;
  font-size: 0.9rem;
}

.view-detail {
  padding: 0.5rem 1rem;
  background-color: #1890ff;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.view-detail:hover {
  background-color: #40a9ff;
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
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
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
  padding: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .attraction-item {
    flex-direction: column;
  }

  .attraction-image {
    width: 100%;
    height: 200px;
  }
}
</style> 
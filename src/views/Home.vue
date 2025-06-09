<template>
  <div class="home">
    <!-- 顶部横幅 -->
    <div class="banner">
      <div class="banner-content">
        <h1>欢迎来到旅游系统</h1>
        <p>发现精彩景点，分享旅游体验</p>
        <router-link to="/attractions" class="btn-primary">浏览景点</router-link>
      </div>
    </div>

    <!-- 热门景点 -->
    <section class="section">
      <div class="section-header">
        <h2>热门景点</h2>
        <router-link to="/attractions" class="view-all">查看全部</router-link>
      </div>
      <div class="attractions-grid">
        <div v-for="attraction in hotAttractions" :key="attraction.attractionID" class="attraction-card">
          <div class="attraction-image">
            <img :src="attraction.coverImage" :alt="attraction.attractionName">
          </div>
          <div class="attraction-info">
            <h3>{{ attraction.attractionName }}</h3>
            <p class="level">{{ attraction.attractionLevel }}</p>
            <p class="address">{{ attraction.attractionAddress }}</p>
            <router-link :to="'/attractions/' + attraction.attractionID" class="btn-link">查看详情</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新文章 -->
    <section class="section">
      <div class="section-header">
        <h2>最新文章</h2>
        <router-link to="/articles" class="view-all">查看全部</router-link>
      </div>
      <div class="articles-grid">
        <div v-for="article in latestArticles" :key="article.articleID" class="article-card">
          <h3>{{ article.title }}</h3>
          <div class="article-meta">
            <span>作者：{{ article.author?.nickName || '未知' }}</span>
            <span>发布时间：{{ formatDate(article.createTime) }}</span>
          </div>
          <p class="excerpt">{{ getExcerpt(article.content) }}</p>
          <router-link :to="'/articles/' + article.articleID" class="btn-link">阅读更多</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllAttractions } from '../api/attraction';
import { getPublishedArticles } from '../api/article';
import type { Attraction } from '../types/index';
import type { Article } from '../types/index';

const hotAttractions = ref<Attraction[]>([]);
const latestArticles = ref<Article[]>([]);

// 获取热门景点
const fetchHotAttractions = async () => {
  try {
    const response = await getAllAttractions();
    hotAttractions.value = response.data.slice(0, 3); // 只显示前3个景点
  } catch (error) {
    console.error('获取热门景点失败:', error);
  }
};

// 获取最新文章
const fetchLatestArticles = async () => {
  try {
    const response = await getPublishedArticles();
    latestArticles.value = response.data.slice(0, 3); // 只显示前3篇文章
  } catch (error) {
    console.error('获取最新文章失败:', error);
  }
};

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

// 获取文章摘要
const getExcerpt = (content: string) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
};

onMounted(() => {
  fetchHotAttractions();
  fetchLatestArticles();
});
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.banner {
  background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 40px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/src/assets/banner-bg.jpg') center/cover;
  opacity: 0.2;
}

.banner-content {
  position: relative;
  z-index: 1;
}

.banner h1 {
  font-size: 3em;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.banner p {
  font-size: 1.5em;
  margin-bottom: 30px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.section {
  margin-bottom: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 2em;
  color: #333;
  margin: 0;
}

.view-all {
  color: #1890ff;
  text-decoration: none;
  font-size: 1.1em;
}

.view-all:hover {
  text-decoration: underline;
}

.attractions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.attraction-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.attraction-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.attraction-image {
  height: 250px;
  overflow: hidden;
}

.attraction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.attraction-card:hover .attraction-image img {
  transform: scale(1.05);
}

.attraction-info {
  padding: 20px;
}

.attraction-info h3 {
  font-size: 1.4em;
  color: #333;
  margin: 0 0 10px;
}

.level {
  color: #4CAF50;
  font-weight: bold;
  margin: 5px 0;
}

.address {
  color: #666;
  margin: 5px 0 15px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.article-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.article-card h3 {
  font-size: 1.4em;
  color: #333;
  margin: 0 0 15px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9em;
  margin-bottom: 15px;
}

.excerpt {
  color: #666;
  margin: 15px 0;
  line-height: 1.6;
}

.btn-primary {
  display: inline-block;
  padding: 15px 30px;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1.1em;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  margin-top: 10px;
}

.btn-link:hover {
  text-decoration: underline;
}
</style> 
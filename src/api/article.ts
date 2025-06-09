import axios from 'axios';

const baseURL = 'http://localhost:8080/api';

// 创建新文章
export const createArticle = (data: {
  title: string;
  content: string;
  userID: number;
}) => {
  return axios.post(`${baseURL}/article/create`, data);
};

// 更新文章
export const updateArticle = (data: {
  articleID: number;
  title: string;
  content: string;
}) => {
  return axios.post(`${baseURL}/article/update`, data);
};

// 删除文章
export const deleteArticle = (articleID: number) => {
  return axios.post(`${baseURL}/article/delete`, null, {
    params: { articleID }
  });
};

// 获取文章详情
export const getArticleDetail = (articleID: number) => {
  return axios.get(`${baseURL}/article/detail`, {
    params: { articleID }
  });
};

// 获取用户的所有文章
export const getUserArticles = (userID: number) => {
  return axios.get(`${baseURL}/article/user-articles`, {
    params: { userID }
  });
};

// 获取所有已发布的文章
export const getPublishedArticles = () => {
  return axios.get(`${baseURL}/article/published`);
};

// 获取待审核的文章（管理员）
export const getPendingArticles = () => {
  return axios.get(`${baseURL}/article/pending`);
};

// 提交文章审核
export const submitForReview = (articleID: number) => {
  return axios.post(`${baseURL}/article/submit`, null, {
    params: { articleID }
  });
};

// 审核通过文章（管理员）
export const approveArticle = (articleID: number) => {
  return axios.post(`${baseURL}/article/approve`, null, {
    params: { articleID }
  });
};

// 拒绝文章（管理员）
export const rejectArticle = (articleID: number) => {
  return axios.post(`${baseURL}/article/reject`, null, {
    params: { articleID }
  });
}; 
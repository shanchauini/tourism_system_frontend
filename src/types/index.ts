// 用户相关类型
export interface User {
  userID: number;
  password: string;
  userType: string;
}

export interface Tourist extends User {
  nickName: string;
  gender: string;
  phone: string;
  location: string;
}

export interface Admin extends User {}

// 景点相关类型
export interface Attraction {
  attractionID: number;
  attractionName: string;
  attractionLevel: string;
  attractionAddress: string;
  openingHours: string;
  introduction: string;
  coverImage: string;
  ticketList: Ticket[];
}

// 门票相关类型
export interface Ticket {
  ticketID: number;
  attractionID: number;
  type: string;
  price: number;
  stock: number;
  description: string;
}

// 文章相关类型
export interface Article {
  articleID: number;
  userID: number;
  title: string;
  content: string;
  author: Tourist;
  state: ArticleState;
  createTime: string;
}

export interface ArticleState {
  state: string;
  canSubmit: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canReject: boolean;
  stateDescription: string;
}

// 订单相关类型
export interface Order {
  orderID: number;
  userID: number;
  orderType: string;
  totalAmount: number;
  status: string;
  createTime: string;
  customerName: string;
  customerPhone: string;
}

export interface TicketOrder extends Order {
  attractionID: number;
  ticketID: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
} 
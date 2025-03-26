import axios from "axios";
import { Message } from "@arco-design/web-vue";

export const isDev = process.env.NODE_ENV === "development";

const myAxios = axios.create({
  baseURL: isDev
    ? "http://localhost:8101"
    : "https://yudada-backend-144305-5-1346746332.sh.run.tcloudbase.com",
  timeout: 60000,
  withCredentials: true,
});

// 请求拦截器
myAxios.interceptors.request.use(
  (config) => {
    // 可在这里添加全局请求头，如token等
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
myAxios.interceptors.response.use(
  (response) => {
    const { data } = response;

    // 处理未登录情况
    if (data.code === 40100) {
      const isLoginRequest = response.config.url?.includes("user/get/login");
      const isLoginPage = window.location.pathname.includes("/user/login");

      if (!isLoginRequest && !isLoginPage) {
        Message.warning("请先登录");
        const redirect = encodeURIComponent(window.location.href);
        window.location.href = `/user/login?redirect=${redirect}`;
        return Promise.reject(new Error("未登录"));
      }
    }

    // 其他业务错误处理
    if (data.code !== 0) {
      Message.error(data.message || "请求失败");
      return Promise.reject(data);
    }

    return data; // 通常直接返回data而不是整个response
  },
  (error) => {
    // 网络错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          Message.error("未授权，请登录");
          break;
        case 403:
          Message.error("拒绝访问");
          break;
        case 404:
          Message.error("请求资源不存在");
          break;
        case 500:
          Message.error("服务器错误");
          break;
        default:
          Message.error(`请求错误: ${error.response.status}`);
      }
    } else if (error.request) {
      Message.error("请求超时，请检查网络");
    } else {
      Message.error(`请求错误: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default myAxios;
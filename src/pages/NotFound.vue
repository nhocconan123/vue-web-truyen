<template>
  <div class="not-found min-h-[70vh] flex items-center justify-center px-4">
    <div class="panel w-full max-w-2xl text-center">
      <div class="badge">404</div>
      <h1 class="title">Không tìm thấy trang</h1>
      <p class="subtitle">
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
      </p>
      <div class="actions">
        <router-link to="/" class="btn btn-primary">Về trang chủ</router-link>
        <button class="btn btn-ghost" type="button" @click="goBack">Quay lại</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

.not-found {
  font-family: 'Space Grotesk', 'Noto Sans', sans-serif;
  background:
    radial-gradient(900px circle at 15% 10%, rgba(99, 102, 241, 0.12), transparent 55%),
    radial-gradient(800px circle at 85% 80%, rgba(16, 185, 129, 0.12), transparent 60%),
    linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #ecfeff 100%);
}

.panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 28px 60px -45px rgba(15, 23, 42, 0.5);
  padding: 42px 32px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 12px;
}

.title {
  margin: 14px 0 6px;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  color: #475569;
  font-size: 15px;
  margin-bottom: 22px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 150ms ease;
}

.btn-primary {
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 10px 20px -15px rgba(79, 70, 229, 0.6);
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-ghost {
  background: transparent;
  border-color: #e2e8f0;
  color: #334155;
}

.btn-ghost:hover {
  background: #fff;
}
</style>

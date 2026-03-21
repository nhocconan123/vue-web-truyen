# Truyện Việt Nam - Frontend Admin

## 🚀 Chức năng đã hoàn thành

### ✅ Quản lý thể loại (Genres)
- **Xem danh sách thể loại** với trạng thái hoạt động
- **Thêm thể loại mới** với validation
- **Chỉnh sửa thể loại** có sẵn
- **Xóa thể loại** với xác nhận
- **Auto-generate slug** từ tên thể loại

### ✅ Thêm truyện mới (Stories)
- **Bước 1**: Tạo thông tin truyện cơ bản
- **Bước 2**: Thêm nhiều chương cho truyện
- **Xem danh sách chương** đã thêm
- **Chỉnh sửa/xóa chương** với modal

### ✅ State Management
- **Pinia stores** với TypeScript
- **Type-safe interfaces** cho tất cả entities
- **Centralized store exports** từ `stores/index.ts`

## 📋 Flow nghiệp vụ theo Postman

### 1. Đăng nhập lấy token
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user1",
  "password": "123456"
}
```
→ Lưu token từ response để dùng cho các API sau

### 2. Tạo truyện mới
```http
POST /api/truyen
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Đấu La Đại Lục",
  "slug": "dau-la-dai-luc",
  "description": "Truyện huyền huyễn về đấu la",
  "coverImage": "https://example.com/cover.jpg",
  "publishStatus": "ONGOING"
}
```
→ Lưu `storyId` từ response

### 3. Thêm chương
```http
POST /api/chapters
Authorization: Bearer <token>
Content-Type: application/json

{
  "truyenId": <storyId>,
  "chapterNumber": 1,
  "title": "Chương 1: Bắt đầu",
  "content": "Nội dung chương..."
}
```

### 4. Xem trạng thái truyện
```http
GET /api/truyen/<storyId>/status
Authorization: Bearer <token>
```

### 5. Admin duyệt/từ chối (cần tài khoản ADMIN)
```http
PUT /api/admin/truyen/<storyId>/approve
Authorization: Bearer <token>
```

## 🛠️ Cách sử dụng

### 1. Import Postman Collection
- Mở Postman
- Import file: `TruyenVietNam_API.postman_collection.json`
- Cập nhật biến `base_url` thành URL backend của bạn

### 2. Chạy Frontend
```bash
npm install
npm run dev
```

### 3. Truy cập Admin
- Đăng nhập: `http://localhost:5174/login`
- Vào Admin: `http://localhost:5174/admin`
- Thêm thể loại: `http://localhost:5174/admin/categories`
- Thêm truyện: `http://localhost:5174/admin/stories/new`

## 📁 Cấu trúc Project

```
src/
├── stores/           # Pinia stores với TypeScript
│   ├── index.ts      # Export tất cả stores
│   ├── auth.ts       # Store authentication
│   ├── counter.ts    # Store counter demo
│   ├── genres.ts     # Store quản lý thể loại
│   └── stories.ts    # Store quản lý truyện
├── services/         # API services
│   ├── axios.ts      # Axios config + interceptors
│   ├── auth.ts       # Auth service
│   ├── genres.ts     # Genres API service
│   └── stories.ts    # Stories API service
├── admin/
│   ├── components/
│   │   ├── GenreModal.vue    # Modal thêm/sửa thể loại
│   │   └── ChapterModal.vue  # Modal thêm/sửa chương
│   └── pages/
│       ├── AdminCategories.vue  # Trang quản lý thể loại
│       └── AdminNewStory.vue    # Trang thêm truyện
└── components/       # Base components
```

## 🎯 Tính năng chính

### AdminCategories.vue
- ✅ Danh sách thể loại với pagination
- ✅ Modal thêm/sửa thể loại
- ✅ Validation form
- ✅ Loading states & error handling
- ✅ Pinia store integration

### AdminNewStory.vue
- ✅ 2-step wizard: Info → Chapters
- ✅ Auto-generate slug
- ✅ Chapter management (CRUD)
- ✅ Real-time chapter list
- ✅ TypeScript support

### Stores (TypeScript)
- ✅ Type-safe interfaces
- ✅ Centralized state management
- ✅ Async actions với error handling
- ✅ Computed properties
- ✅ Reactive updates

## 🔧 API Endpoints được sử dụng

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/genres` | Lấy danh sách thể loại |
| POST | `/api/genres` | Tạo thể loại mới |
| PUT | `/api/genres/{id}` | Cập nhật thể loại |
| DELETE | `/api/genres/{id}` | Xóa thể loại |
| POST | `/api/truyen` | Tạo truyện mới |
| GET | `/api/truyen/{id}/status` | Lấy trạng thái truyện |
| POST | `/api/chapters` | Thêm chương |
| GET | `/api/truyen/{id}/chapters` | Lấy danh sách chương |
| PUT | `/api/admin/truyen/{id}/approve` | Duyệt truyện |
| PUT | `/api/admin/truyen/{id}/reject` | Từ chối truyện |

## 🚀 Next Steps

1. **Backend Implementation**: Triển khai các API endpoints
2. **User Management**: Trang quản lý người dùng
3. **Story Management**: Trang xem/sửa truyện
4. **Dashboard**: Thống kê và báo cáo
5. **File Upload**: Upload ảnh bìa truyện
6. **Search & Filter**: Tìm kiếm và lọc dữ liệu

---

**Happy coding! 🎉**
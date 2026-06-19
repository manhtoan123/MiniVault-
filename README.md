

# 🛡️ MiniVault - Hệ thống Bảo mật & Ẩn danh Dữ liệu Cá nhân

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0-lightgrey.svg)
![Cryptography](https://img.shields.io/badge/Cryptography-AES256_GCM-red.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)

**Đề tài:** Ứng dụng mã hóa và bảo mật dữ liệu cá nhân (Văn bản & Hình ảnh) sử dụng thuật toán AES-256.  
 

### 👨‍🎓 Thông tin sinh viên
* **Họ và tên:** Nguyễn Mạnh Toàn
* **Mã sinh viên:** 23010539

---

## 📑 1. Đặt vấn đề & Mục tiêu dự án
Trong bối cảnh dữ liệu cá nhân (mật khẩu, hình ảnh CCCD, tài liệu nhạy cảm) thường xuyên bị rò rỉ do thiết bị nhiễm mã độc hoặc bị truy cập trái phép, việc chỉ ẩn file hoặc đặt mật khẩu mức hệ điều hành là chưa đủ. 

Nhiều công cụ mã hóa hiện nay có điểm yếu là **vẫn giữ nguyên định dạng file gốc** (ví dụ: `anh_cccd.jpg.enc`), khiến kẻ tấn công dễ dàng đoán được nội dung bên trong là gì.

**MiniVault** ra đời nhằm giải quyết vấn đề đó với 2 mục tiêu:
1. Mã hóa văn bản và hình ảnh với chuẩn mật mã quân đội **AES-256**.
2. **Ẩn danh hoàn toàn tệp tin:** Khi mã hóa hình ảnh, toàn bộ siêu dữ liệu (tên file, đuôi file, định dạng) sẽ bị tước bỏ. Đầu ra là một tệp nhị phân độc quyền (`.mvault`) không thể nhận dạng bởi hệ điều hành.

---

## ⚙️ 2. Kiến trúc Bảo mật (Security Architecture)
Dự án không sử dụng các phương pháp mã hóa thô sơ mà áp dụng các tiêu chuẩn mật mã hiện đại nhất (OWASP Recommended):

* **Thuật toán lõi - AES-256-GCM:** 
  Sử dụng chế độ *Galois/Counter Mode (GCM)* cung cấp tính năng **Mã hóa có xác thực (AEAD)**. Khác với chế độ CBC cũ, GCM sinh ra một mã xác thực (Tag). Nếu tệp tin bị hacker cố tình thay đổi dù chỉ 1 byte, quá trình giải mã sẽ báo lỗi ngay lập tức thay vì trả về dữ liệu hỏng.
* **Phái sinh khóa - PBKDF2-HMAC-SHA256:**
  Mật khẩu người dùng nhập vào (VD: `123456`) không bao giờ được dùng trực tiếp làm khóa. Hệ thống kết hợp mật khẩu với một **Salt (16 bytes) ngẫu nhiên** và băm qua **600.000 vòng lặp** để tạo ra khóa AES 256-bit. Điều này triệt tiêu hoàn toàn khả năng tấn công Brute-force hoặc dùng Rainbow Tables.
* **Tính ngẫu nhiên - Nonce (IV):**
  Mỗi lần bấm mã hóa, hệ thống tạo ra một chuỗi Nonce ngẫu nhiên (12 bytes). Dù mã hóa cùng một bức ảnh, cùng một mật khẩu, file đầu ra mỗi lần sẽ hoàn toàn khác nhau.

---

## 📦 3. Cấu trúc Tệp nhị phân `.mvault`
Để đảm bảo "Không ai biết file gốc là gì", MiniVault tự định nghĩa một cấu trúc file nhị phân riêng biệt:

| Kích thước | Thành phần | Mô tả |
| :--- | :--- | :--- |
| `4 bytes` | **MAGIC HEADER** | Chuỗi định danh `MVLT` để ứng dụng nhận diện file của mình. |
| `1 byte` | **VERSION** | Phiên bản thuật toán (`\x01`). |
| `16 bytes` | **SALT** | Muối ngẫu nhiên dùng để phái sinh lại khóa khi giải mã. |
| `12 bytes` | **NONCE** | Vector khởi tạo cho thuật toán AES-GCM. |
| `N bytes` | **CIPHERTEXT + TAG** | Dữ liệu **đã bị mã hóa**. Bên trong chứa cả Metadata (Tên file, Định dạng) và Data (Byte ảnh thô). |

*Lưu ý: Toàn bộ thông tin nhạy cảm (Tên file, định dạng MIME) đều nằm trong phần `CIPHERTEXT`. Khi chưa có mật khẩu, tệp tin chỉ là một khối dữ liệu rác đối với mọi phần mềm xem ảnh.*

---

## 🚀 4. Ngăn xếp Công nghệ (Tech Stack)
* **Backend:** Python 3, Flask (Framework API nhẹ).
* **Mật mã học:** Thư viện `cryptography` chuẩn Python.
* **Frontend:** HTML5, JavaScript (Fetch API), Tailwind CSS (Giao diện Dark Mode UI).

---

## 🛠️ 5. Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu hệ thống:
* Đã cài đặt Python 3.8 trở lên.

### Các bước chạy dự án:
**Bước 1:** Clone dự án hoặc giải nén thư mục mã nguồn.
```bash
cd minivault
```

**Bước 2:** Cài đặt các thư viện phụ thuộc.
```bash
pip install -r requirements.txt
```

**Bước 3:** Khởi chạy Server Backend.
```bash
python app.py
```

**Bước 4:** Mở trình duyệt và truy cập vào địa chỉ:
👉 **http://127.0.0.1:5000**

---

## 🎯 6. Kịch bản Kiểm thử / Demo cho Giảng viên

Để chứng minh tính hiệu quả của MiniVault, hãy thực hiện theo các bước sau:

1. **Mã hóa Hình ảnh ẩn danh:**
   * Tải lên một file ảnh `.jpg` hoặc `.png`. Nhập mật khẩu.
   * Bấm mã hóa. Hệ thống trả về file `encrypted_image.mvault`.
   * **Chứng minh:** Thử mở file `.mvault` bằng công cụ xem ảnh của Windows/Mac -> *Hệ điều hành báo lỗi không thể mở*. File đã mất hoàn toàn định dạng ảnh.
2. **Giải mã & Kiểm tra tính toàn vẹn (AEAD):**
   * Tải file `.mvault` lên web. 
   * Cố tình nhập **SAI** mật khẩu -> Hệ thống ném lỗi bảo mật từ chối giải mã (Nhờ cơ chế xác thực GCM Tag).
   * Nhập **ĐÚNG** mật khẩu -> Ảnh gốc hiển thị lại nguyên vẹn cùng tên file ban đầu.

---

## 📜 7. Tổng kết
Dự án **MiniVault** đã đáp ứng thành công việc áp dụng các tiêu chuẩn an toàn thông tin vào thực tế. Hệ thống không chỉ mã hóa dữ liệu mà còn giải quyết được bài toán ẩn danh tệp tin ở cấp độ hệ thống, bảo vệ người dùng khỏi các nguy cơ đánh cắp thông tin thụ động.


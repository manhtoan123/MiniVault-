let currentCategory = 'text';

function switchCategory(category) {
    currentCategory = category;
    
    document.getElementById('section-text').classList.toggle('hidden', category !== 'text');
    document.getElementById('section-image').classList.toggle('hidden', category !== 'image');
    
    const tabText = document.getElementById('tab-text');
    const tabImg = document.getElementById('tab-image');

    if (category === 'text') {
        tabText.className = "flex-1 py-4 text-sm font-semibold border-b-2 tab-active transition-all flex justify-center items-center gap-2";
        tabImg.className = "flex-1 py-4 text-sm font-semibold border-b-2 tab-inactive transition-all flex justify-center items-center gap-2";
    } else {
        tabImg.className = "flex-1 py-4 text-sm font-semibold border-b-2 tab-active transition-all flex justify-center items-center gap-2";
        tabText.className = "flex-1 py-4 text-sm font-semibold border-b-2 tab-inactive transition-all flex justify-center items-center gap-2";
    }
    hideAlert();
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imgPreview').src = e.target.result;
            document.getElementById('imgPreview').classList.remove('hidden');
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function showAlert(msg, isSuccess = false) {
    const box = document.getElementById('alertBox');
    box.classList.remove('hidden', 'bg-red-500/20', 'text-red-400', 'bg-emerald-500/20', 'text-emerald-400');
    if(isSuccess) {
        box.classList.add('bg-emerald-500/20', 'text-emerald-400');
    } else {
        box.classList.add('bg-red-500/20', 'text-red-400');
    }
    box.innerText = msg;
}

function hideAlert() {
    document.getElementById('alertBox').classList.add('hidden');
}

// ================= API GỌI XUỐNG FLASK =================

// Hàm gọi API Mã hóa (Nhận về File Download)
async function encryptData(category) {
    hideAlert();
    const password = document.getElementById('masterPassword').value;
    if(!password) return showAlert("Vui lòng nhập mật khẩu Master!");

    const formData = new FormData();
    formData.append('password', password);
    formData.append('category', category);

    if (category === 'text') {
        const txt = document.getElementById('textContent').value;
        if(!txt) return showAlert("Vui lòng nhập văn bản cần mã hóa!");
        formData.append('content', txt);
    } else {
        const fileInput = document.getElementById('imageInput');
        if(!fileInput.files[0]) return showAlert("Vui lòng chọn ảnh để mã hóa!");
        formData.append('file', fileInput.files[0]);
    }

    try {
        const response = await fetch('/encrypt', { method: 'POST', body: formData });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error);
        }

        // Tải file .mvault về
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = category === 'text' ? 'van_ban.mvault' : 'hinh_anh.mvault';
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        showAlert("✅ Mã hóa thành công! Đã tải file .mvault về máy.", true);
    } catch (e) {
        showAlert(e.message);
    }
}

// Hàm gọi API Giải mã
async function decryptData(category, fileInputElement) {
    hideAlert();
    const file = fileInputElement.files[0];
    if(!file) return;
    fileInputElement.value = ''; // Reset input

    const password = document.getElementById('masterPassword').value;
    if(!password) return showAlert("Vui lòng nhập mật khẩu Master để giải mã!");

    const formData = new FormData();
    formData.append('password', password);
    formData.append('file', file);

    try {
        const response = await fetch('/decrypt', { method: 'POST', body: formData });
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || "Lỗi giải mã");
        }

        if (category === 'text') {
            document.getElementById('textContent').value = data.content;
            showAlert("✅ Giải mã văn bản thành công!", true);
        } else if (category === 'image') {
            document.getElementById('decryptedImgPreview').src = data.content_base64;
            document.getElementById('originalImgName').innerText = "Tên file gốc: " + data.original_name;
            document.getElementById('decryptedImageContainer').classList.remove('hidden');
            showAlert("✅ Khôi phục hình ảnh thành công!", true);
        }

    } catch (e) {
        showAlert(e.message);
    }
}

import os
import io
import base64
import traceback
from flask import Flask, request, jsonify, send_file, render_template
import crypto_utils

app = Flask(__name__)

# Giới hạn kích thước file tải lên (VD: 16MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 

@app.route('/')
def index():
    """Hiển thị giao diện Web"""
    return render_template('index.html')

@app.route('/encrypt', methods=['POST'])
def encrypt():
    """API Mã hóa dữ liệu -> Xuất ra file .mvault"""
    try:
        password = request.form.get('password')
        category = request.form.get('category') # 'text' hoặc 'image'
        
        if not password:
            return jsonify({'error': 'Vui lòng nhập mật khẩu chính'}), 400
            
        if category == 'text':
            content_str = request.form.get('content', '')
            if not content_str:
                return jsonify({'error': 'Nội dung văn bản không được để trống'}), 400
            content_bytes = content_str.encode('utf-8')
            mime = 'text/plain'
            original_name = 'van_ban_bi_mat.txt'
            
        elif category == 'image':
            if 'file' not in request.files:
                return jsonify({'error': 'Không tìm thấy file ảnh đính kèm'}), 400
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'Chưa chọn file ảnh'}), 400
            
            content_bytes = file.read()
            mime = file.mimetype
            original_name = file.filename
        else:
            return jsonify({'error': 'Loại dữ liệu không hợp lệ'}), 400

        # Gọi hàm mã hóa từ crypto_utils
        encrypted_blob = crypto_utils.encrypt_item(original_name, category, mime, content_bytes, password)
        
        # Trả về file rác .mvault để trình duyệt tải xuống
        return send_file(
            io.BytesIO(encrypted_blob),
            mimetype='application/octet-stream',
            as_attachment=True,
            download_name=f"encrypted_{category}.mvault"
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Lỗi hệ thống: {str(e)}'}), 500

@app.route('/decrypt', methods=['POST'])
def decrypt():
    """API Giải mã file .mvault -> Trả về nội dung gốc"""
    try:
        password = request.form.get('password')
        if not password:
            return jsonify({'error': 'Vui lòng nhập mật khẩu để giải mã'}), 400
            
        if 'file' not in request.files:
            return jsonify({'error': 'Vui lòng tải lên file .mvault cần giải mã'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Chưa chọn file'}), 400
            
        blob = file.read()
        
        # Gọi hàm giải mã từ crypto_utils
        original_name, category, mime, content_bytes = crypto_utils.decrypt_item(blob, password)
        
        # Trả kết quả về Frontend hiển thị
        if category == 'text':
            return jsonify({
                'success': True,
                'category': 'text',
                'original_name': original_name,
                'content': content_bytes.decode('utf-8')
            })
        elif category == 'image':
            b64_content = base64.b64encode(content_bytes).decode('utf-8')
            return jsonify({
                'success': True,
                'category': 'image',
                'mime': mime,
                'original_name': original_name,
                # Frontend dùng base64 để render ảnh không cần tải lại trang
                'content_base64': f"data:{mime};base64,{b64_content}" 
            })
            
    except crypto_utils.DecryptionError:
        return jsonify({'error': '❌ Sai mật khẩu hoặc file đã bị hỏng/chỉnh sửa!'}), 400
    except crypto_utils.InvalidVaultFile as e:
        return jsonify({'error': f'❌ Định dạng file không đúng: {str(e)}'}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'❌ Lỗi hệ thống: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Khởi động Server MiniVault tại: http://127.0.0.1:5000")
    app.run(debug=True, port=5000)

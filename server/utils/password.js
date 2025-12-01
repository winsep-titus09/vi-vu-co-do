import crypto from 'crypto';

/**
 * Tạo mật khẩu ngẫu nhiên
 * @param {number} length - Độ dài mật khẩu (mặc định 10)
 * @returns {string} - Mật khẩu ngẫu nhiên
 */
export const generateRandomPassword = (length = 10) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + special;

    // Đảm bảo mật khẩu có ít nhất 1 ký tự từ mỗi loại
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Thêm các ký tự còn lại
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Xáo trộn mật khẩu
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Export default nếu cần
export default {
    generateRandomPassword
};
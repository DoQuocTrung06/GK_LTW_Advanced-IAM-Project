// src/utils/userColors.js

export const avatarColors = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f59e0b', // Amber
  '#8b5cf6'  // Violet
];

// Hàm dùng chung để tính màu theo ID
export const getUserColor = (userId) => {
  if (!userId) return '#4f46e5'; 
  
  // Đảm bảo ID là số nguyên để chia lấy dư
  const numericId = parseInt(userId, 10);
  if (isNaN(numericId)) return '#4f46e5';

  return avatarColors[numericId % avatarColors.length];
};
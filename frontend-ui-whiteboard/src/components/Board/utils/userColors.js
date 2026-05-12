export const avatarColors = [
  '#6366f1', 
  '#ec4899', 
  '#14b8a6', 
  '#f59e0b', 
  '#8b5cf6'  
];


export const getUserColor = (userId) => {
  if (!userId) return '#4f46e5'; 
  
  
  const numericId = parseInt(userId, 10);
  if (isNaN(numericId)) return '#4f46e5';

  return avatarColors[numericId % avatarColors.length];
};
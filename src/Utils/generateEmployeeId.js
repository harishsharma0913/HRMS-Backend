const generateEmployeeId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  
  const randomChars = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const randomNums = Array.from({ length: 3 }, () => nums[Math.floor(Math.random() * nums.length)]).join('');
  
  return `EMP-${randomChars}${randomNums}`;
};

module.exports = generateEmployeeId;

// UserCount.js

let userCount = 0;

export const incrementUserCount = () => {
  userCount++;
  return userCount;
};

export const decrementUserCount = () => {
  userCount = Math.max(0, userCount - 1);
  return userCount;
};

export const getUserCount = () => {
  return userCount;
};

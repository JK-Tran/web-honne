export const formatCurrencyVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

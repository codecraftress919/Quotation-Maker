// Helper functions to calculate totals for Quotation items

export const calculateSubTotal = (products) => {
  return products.reduce((sum, product) => {
    return sum + (product.quantity * (product.unitPrice || 0));
  }, 0);
};

export const calculateGrandTotal = (formData) => {
  const subTotal = calculateSubTotal(formData.products);
  const discount = formData.discount || 0;
  const taxRate = formData.taxRate || 0;
  const afterDiscount = subTotal - discount;
  const tax = (afterDiscount * taxRate) / 100;
  return Math.max(0, afterDiscount + tax);
};

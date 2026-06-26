import React from 'react';
import { Plus, Trash2, Copy, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ProductTable = ({ products, setProducts }) => {
  // Add a new product row
  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      name: '',
      quantity: 1,
      unit: 'pcs',
      unitPrice: 0,
    };
    setProducts([...products, newProduct]);
  };

  // Delete a product row
  const deleteProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter((product) => product.id !== id));
    }
  };

  // Duplicate a product row
  const duplicateProduct = (id) => {
    const productToDuplicate = products.find((p) => p.id === id);
    if (productToDuplicate) {
      const duplicatedProduct = {
        ...productToDuplicate,
        id: Date.now() + 1,
      };
      const index = products.findIndex((p) => p.id === id);
      const newProducts = [...products];
      newProducts.splice(index + 1, 0, duplicatedProduct);
      setProducts(newProducts);
    }
  };

  // ✅ FIXED: 'unit' is now excluded from Number() conversion (was causing blank unit in preview)
  const updateProduct = (id, field, value) => {
    setProducts(
      products.map((product) =>
        product.id === id
          ? {
              ...product,
              [field]:
                field === 'name' || field === 'unit'
                  ? value
                  : Number(value),
            }
          : product
      )
    );
  };

  // Calculate total for a product
  const calculateTotal = (quantity, unitPrice) => {
    return quantity * unitPrice;
  };

  // Calculate accumulated sum of products
  const productsSubTotal = products.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );

  const UNITS = ['pcs', 'kg', 'meter', 'set', 'box', 'hour', 'kWp', 'job'];

  return (
    <div className="w-full space-y-4">
      {/* Product Section Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-soft border border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Products & Services</h3>
            <p className="text-xs text-slate-500">Manage quotation line items</p>
          </div>
        </div>
        <button
          type="button"
          onClick={addProduct}
          className="bg-gradient-to-r from-secondary to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 touch-manipulation cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Sticky Subtotal for Mobile */}
      <div className="md:hidden sticky top-[56px] z-30 bg-primary/95 backdrop-blur text-white px-4 py-3 rounded-xl shadow-md flex justify-between items-center transition-all border border-primary-light">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
            Items Subtotal
          </span>
          <span className="text-lg font-extrabold">
            PKR {productsSubTotal.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-[11px] bg-white/20 px-2 py-1 rounded-full font-medium">
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <th className="px-6 py-4 w-12 text-center">#</th>
              <th className="px-6 py-4">Product / Service Name</th>
              <th className="px-6 py-4 w-28 text-center">Quantity</th>
              <th className="px-6 py-4 w-32">Unit</th>
              <th className="px-6 py-4 w-36">Unit Price (PKR)</th>
              <th className="px-6 py-4 w-36">Total (PKR)</th>
              <th className="px-6 py-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {/* # */}
                  <td className="px-6 py-4 text-center font-medium text-slate-400">
                    {index + 1}
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                      placeholder="e.g. Solar Panels, Inverter, Cable..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                      min="1"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </td>

                  {/* Unit — ✅ now correctly saves string value */}
                  <td className="px-6 py-4">
                    <select
                      value={product.unit}
                      onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Unit Price */}
                  <td className="px-6 py-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                        PKR
                      </span>
                      <input
                        type="number"
                        value={product.unitPrice || ''}
                        onChange={(e) => updateProduct(product.id, 'unitPrice', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {calculateTotal(product.quantity, product.unitPrice).toLocaleString('en-PK', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => duplicateProduct(product.id)}
                        title="Duplicate item"
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteProduct(product.id)}
                          title="Delete item"
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        <AnimatePresence initial={false}>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-soft space-y-3"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Item #{index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => duplicateProduct(product.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Product / Service Name
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                  placeholder="Enter product/service name"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                    min="1"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
                  />
                </div>

                {/* Unit — ✅ fixed */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Unit
                  </label>
                  <select
                    value={product.unit}
                    onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u.charAt(0).toUpperCase() + u.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    value={product.unitPrice || ''}
                    onChange={(e) => updateProduct(product.id, 'unitPrice', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Item Total */}
              <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Item Total:</span>
                <span className="text-sm font-extrabold text-slate-800">
                  PKR{' '}
                  {calculateTotal(product.quantity, product.unitPrice).toLocaleString('en-PK', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductTable;
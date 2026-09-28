import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Power, AlertCircle, Trash2, Tag, ShoppingBag, Stethoscope } from 'lucide-react';
import { AdminLayout, useAdminToast } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import { AdminImageUrlInput } from '../../components/admin/AdminImageUrlInput';
import { getProductImageUrl } from '../../lib/utils';
import { useRestockNotifications } from '../../hooks/useRestockNotifications';
import api from '../../lib/axios';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  productType?: string;
  petType?: string;
  species?: string;
  subcategory?: string;
  brand?: string;
  stockQuantity: number;
  imageUrl: string;
  isActive: boolean;
}

const PHARMACY_CATEGORIES = [
  { label: 'Medications', value: 'MEDICATIONS' },
  { label: 'Food & Nutrition', value: 'FOOD & NUTRITION' },
  { label: 'Supplements & Care', value: 'SUPPLEMENTS' },
  { label: 'Flea & Tick', value: 'FLEA & TICK' },
  { label: 'Grooming & Hygiene', value: 'GROOMING' },
];

const ESSENTIALS_CATEGORIES = [
  { label: 'Food', value: 'FOOD' },
  { label: 'Treats', value: 'TREATS' },
  { label: 'Toys', value: 'TOYS' },
  { label: 'Walk & Travel', value: 'WALK & TRAVEL' },
  { label: 'Clothing & Accessories', value: 'CLOTHING & ACCESSORIES' },
  { label: 'Bowls & Feeders', value: 'BOWLS & FEEDERS' },
  { label: 'Grooming', value: 'GROOMING' },
  { label: 'Beds & Housing', value: 'BEDS & HOUSING' },
  { label: 'Cat Litter', value: 'CAT LITTER' },
  { label: 'Fish Food', value: 'FISH FOOD' },
  { label: 'Bird Food', value: 'BIRD FOOD' },
  { label: 'Hamster Food', value: 'HAMSTER FOOD' },
  { label: 'Rabbit Food', value: 'RABBIT FOOD' },
];

const PET_TYPES = [
  { label: 'All Pets', value: 'ALL' },
  { label: 'Dogs', value: 'DOG' },
  { label: 'Cats', value: 'CAT' },
  { label: 'Small Pets', value: 'SMALL_PET' },
  { label: 'Birds', value: 'BIRD' },
  { label: 'Fish', value: 'FISH' },
  { label: 'Reptiles', value: 'REPTILE' },
];

export const AdminProductsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'pharmacy' | 'pet-essentials'>('pharmacy');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useAdminToast();
  const { triggerRestock } = useRestockNotifications();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    productType: 'PHARMACY',
    category: 'MEDICATIONS',
    petType: 'DOG',
    subcategory: '',
    brand: '',
    stockQuantity: '',
    imageUrl: '',
    isActive: true,
  });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/products');
      setProducts(res.data || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load products from database.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by current viewMode
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      const pType = (p.productType || '').toUpperCase();
      if (viewMode === 'pharmacy') {
        if (pType === 'PHARMACY') return true;
        if (pType === 'ESSENTIAL') return false;
        // Fallback for legacy items without explicit productType
        const cat = (p.category || '').toUpperCase();
        return (
          cat.includes('MEDIC') ||
          cat.includes('PHARM') ||
          cat.includes('SUPPLEMENT') ||
          cat.includes('FLEA') ||
          cat.includes('CARE')
        );
      } else {
        if (pType === 'ESSENTIAL') return true;
        if (pType === 'PHARMACY') return false;
        // Fallback for legacy items without explicit productType
        const cat = (p.category || '').toUpperCase();
        return !(
          cat.includes('MEDIC') ||
          cat.includes('PHARM') ||
          cat.includes('SUPPLEMENT') ||
          cat.includes('FLEA')
        );
      }
    });
  }, [products, viewMode]);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      productType: viewMode === 'pharmacy' ? 'PHARMACY' : 'ESSENTIAL',
      category: viewMode === 'pharmacy' ? 'MEDICATIONS' : 'FOOD',
      petType: 'DOG',
      subcategory: '',
      brand: '',
      stockQuantity: '',
      imageUrl: '',
      isActive: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    const prodType = (product.productType || (viewMode === 'pharmacy' ? 'PHARMACY' : 'ESSENTIAL')).toUpperCase();
    setFormData({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      productType: prodType,
      category: product.category || (prodType === 'PHARMACY' ? 'MEDICATIONS' : 'FOOD'),
      petType: product.petType || 'DOG',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      stockQuantity: String(product.stockQuantity),
      imageUrl: product.imageUrl || '',
      isActive: product.isActive,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await api.patch(`/admin/products/${id}/toggle-status`);
      const updatedActive = res.data?.isActive;
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: updatedActive ?? !p.isActive } : p))
      );
      showToast(res.data?.message || 'Product status updated successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to toggle product status.';
      showToast(msg, 'error');
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/products/${productToDelete.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast(res.data?.message || `Product "${productToDelete.name}" deleted successfully.`);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete product', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete product.';
      showToast(msg, 'error');
      fetchProducts();
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        productType: formData.productType,
        category: formData.category,
        petType: formData.productType === 'ESSENTIAL' ? formData.petType : undefined,
        subcategory: formData.productType === 'ESSENTIAL' && formData.subcategory ? formData.subcategory.trim() : undefined,
        brand: formData.productType === 'ESSENTIAL' && formData.brand ? formData.brand.trim() : undefined,
        stockQuantity: parseInt(formData.stockQuantity, 10),
        imageUrl: formData.imageUrl.trim(),
        isActive: formData.isActive,
      };

      if (isEditing && currentId) {
        await api.put(`/admin/products/${currentId}`, payload);
        showToast('Product updated successfully!');
        if (payload.stockQuantity > 0) {
          triggerRestock(currentId, payload.name, payload.stockQuantity, payload.category);
        }
      } else {
        const createRes = await api.post('/admin/products', payload);
        showToast('Product created successfully and saved to database!');
        if (payload.stockQuantity > 0 && createRes.data?.id) {
          triggerRestock(createRes.data.id, payload.name, payload.stockQuantity, payload.category);
        }
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // Pharmacy Columns
  const pharmacyColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Pharmacy Product',
      className: 'w-[34%]',
      render: (row) => {
        const thumbUrl = getProductImageUrl(row.name, row.imageUrl, row.id);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {thumbUrl ? (
                <img src={thumbUrl} alt={row.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400 font-bold">{row.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{row.name}</p>
              {row.description && (
                <p className="text-xs text-gray-500 truncate max-w-[280px]">{row.description}</p>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      className: 'w-[16%]',
      render: (row) => {
        const cat = (row.category || 'MEDICATIONS').toUpperCase();
        let bgClass = 'bg-[#E6F9EC] text-[#009E66] border-[#C3E8CC]';
        if (cat.includes('FOOD')) bgClass = 'bg-[#FEF9C3] text-[#B45309] border-[#FDE047]';
        else if (cat.includes('SUPPLEMENT')) bgClass = 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]';
        else if (cat.includes('FLEA')) bgClass = 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]';
        else if (cat.includes('GROOMING')) bgClass = 'bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3]';

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${bgClass}`}>
            {row.category}
          </span>
        );
      },
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      className: 'w-[12%]',
      render: (row) => <span className="font-semibold text-gray-900">₹{row.price?.toFixed(2)}</span>,
    },
    {
      key: 'stockQuantity',
      header: 'Stock',
      sortable: true,
      className: 'w-[14%]',
      render: (row) => {
        const isOutOfStock = row.stockQuantity === 0;
        const isLowStock = row.stockQuantity > 0 && row.stockQuantity < 10;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                isOutOfStock
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : isLowStock
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {(isOutOfStock || isLowStock) && <AlertCircle className="w-3 h-3 shrink-0" />}
              {row.stockQuantity} units
              {isOutOfStock && ' (Out)'}
              {isLowStock && ' (Low)'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      className: 'w-[12%]',
      render: (row) => <AdminStatusBadge status={row.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[12%] text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row.id)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${
              row.isActive
                ? 'text-[#6B7280] hover:text-[#C0392B] hover:bg-[#FDEDEC]'
                : 'text-[#6B7280] hover:text-[#3FA65C] hover:bg-[#EBF7EE]'
            }`}
            title={row.isActive ? 'Deactivate (Hide)' : 'Activate (Show)'}
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-[#D0453C] hover:bg-[#FDEDEC] rounded-lg transition-colors cursor-pointer shrink-0"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Pet Essentials Columns
  const essentialsColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Essential Product',
      className: 'w-[30%]',
      render: (row) => {
        const thumbUrl = getProductImageUrl(row.name, row.imageUrl, row.id);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {thumbUrl ? (
                <img src={thumbUrl} alt={row.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400 font-bold">{row.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{row.name}</p>
              {row.brand && (
                <p className="text-[11px] font-bold text-[#009E66] flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#EF7C3C]" />
                  {row.brand}
                </p>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'petType',
      header: 'Pet Target',
      sortable: true,
      className: 'w-[12%]',
      render: (row) => {
        const pet = (row.petType || 'ALL').toUpperCase();
        let label = 'All Pets';
        if (pet.includes('DOG')) label = 'Dogs';
        else if (pet.includes('CAT')) label = 'Cats';
        else if (pet.includes('SMALL')) label = 'Small Pets';
        else if (pet.includes('BIRD')) label = 'Birds';
        else if (pet.includes('FISH')) label = 'Fish';
        else if (pet.includes('REPTILE')) label = 'Reptiles';

        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
            {label}
          </span>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      className: 'w-[16%]',
      render: (row) => (
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-[#FAF6EE] text-[#009E66] border border-[#E5DFCE]">
            {row.category}
          </span>
          {row.subcategory && (
            <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{row.subcategory}</p>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      className: 'w-[10%]',
      render: (row) => <span className="font-semibold text-gray-900">₹{row.price?.toFixed(2)}</span>,
    },
    {
      key: 'stockQuantity',
      header: 'Stock',
      sortable: true,
      className: 'w-[12%]',
      render: (row) => {
        const isOutOfStock = row.stockQuantity === 0;
        const isLowStock = row.stockQuantity > 0 && row.stockQuantity < 10;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                isOutOfStock
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : isLowStock
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {(isOutOfStock || isLowStock) && <AlertCircle className="w-3 h-3 shrink-0" />}
              {row.stockQuantity} units
            </span>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      className: 'w-[10%]',
      render: (row) => <AdminStatusBadge status={row.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[10%] text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row.id)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${
              row.isActive
                ? 'text-[#6B7280] hover:text-[#C0392B] hover:bg-[#FDEDEC]'
                : 'text-[#6B7280] hover:text-[#3FA65C] hover:bg-[#EBF7EE]'
            }`}
            title={row.isActive ? 'Deactivate (Hide)' : 'Activate (Show)'}
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-[#D0453C] hover:bg-[#FDEDEC] rounded-lg transition-colors cursor-pointer shrink-0"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const viewSwitcherNode = (
    <div className="relative shrink-0">
      <select
        value={viewMode}
        onChange={(e) => setViewMode(e.target.value as 'pharmacy' | 'pet-essentials')}
        className="px-3 py-2 text-xs font-bold text-[#16241B] bg-[#F9FAF8] border border-[#E5E7EB] hover:border-[#3FA65C] focus:border-[#3FA65C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/20 transition-all cursor-pointer shadow-2xs"
        aria-label="Select products category view"
      >
        <option value="pharmacy">Pharmacy</option>
        <option value="pet-essentials">Paw Store</option>
      </select>
    </div>
  );

  return (
    <AdminLayout title="Products Management">
      {viewMode === 'pharmacy' ? (
        <DataTable
          columns={pharmacyColumns}
          data={displayedProducts}
          isLoading={isLoading}
          beforeSearch={viewSwitcherNode}
          searchPlaceholder="Search pharmacy products..."
          searchKey="name"
          filterLabel="All Categories"
          filterOptions={[
            { label: 'All Categories', value: 'ALL' },
            ...PHARMACY_CATEGORIES,
          ]}
          filterKey="category"
          actions={
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3FA65C] hover:bg-[#33894B] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Pharmacy Product
            </button>
          }
        />
      ) : (
        <DataTable
          columns={essentialsColumns}
          data={displayedProducts}
          isLoading={isLoading}
          beforeSearch={viewSwitcherNode}
          searchPlaceholder="Search Paw Store products by name or brand..."
          searchKey="name"
          filterLabel="All Categories"
          filterOptions={[
            { label: 'All Categories', value: 'ALL' },
            ...ESSENTIALS_CATEGORIES,
          ]}
          filterKey="category"
          actions={
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3FA65C] hover:bg-[#33894B] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Paw Store Product
            </button>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          isEditing
            ? `Edit ${formData.productType === 'PHARMACY' ? 'Pharmacy Product' : 'Paw Store Product'}`
            : `Add New ${formData.productType === 'PHARMACY' ? 'Pharmacy Product' : 'Paw Store Product'}`
        }
        subtitle={
          isEditing
            ? 'Modify catalog item details'
            : `Create a new ${formData.productType === 'PHARMACY' ? 'pharmacy' : 'pet essential'} catalog item`
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#FDEDEC] border border-[#FADBD8] rounded-lg flex items-center gap-2 text-xs text-[#C0392B]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector (Pharmacy vs Pet Essentials) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  productType: 'PHARMACY',
                  category: 'MEDICATIONS',
                })
              }
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                formData.productType === 'PHARMACY'
                  ? 'bg-white text-[#16241B] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#009E66]" />
              <span>Pharmacy</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  productType: 'ESSENTIAL',
                  category: 'FOOD',
                })
              }
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                formData.productType === 'ESSENTIAL'
                  ? 'bg-white text-[#16241B] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#EF7C3C]" />
              <span>Paw Store</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={
                formData.productType === 'PHARMACY'
                  ? 'e.g. Frontline Plus Flea & Tick Treatment'
                  : 'e.g. Royal Canin Maxi Adult Dry Dog Food'
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          {/* Conditional Category & Pet Type Fields */}
          {formData.productType === 'PHARMACY' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Pharmacy Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
                >
                  {PHARMACY_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="1299.00"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Pet Target *
                  </label>
                  <select
                    value={formData.petType}
                    onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
                  >
                    {PET_TYPES.map((pt) => (
                      <option key={pt.value} value={pt.value}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Essentials Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
                  >
                    {ESSENTIALS_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g. Dry Food, Chew Toys, Harness"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Royal Canin, Pedigree, Kong"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2499.00"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
                  />
                </div>
              </div>
            </>
          )}

          {formData.productType === 'PHARMACY' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                placeholder="50"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
              />
            </div>
          )}

          <AdminImageUrlInput
            label="Product Image URL"
            value={formData.imageUrl}
            onChange={(val) => setFormData({ ...formData, imageUrl: val })}
            placeholder="https://images.unsplash.com/... or https://..."
            entityName={formData.name || 'Product'}
            helperText="Provide a direct URL to a product photograph (starts with http:// or https://, max 512 chars)."
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="High quality nutrition for growing pups..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#3FA65C] hover:bg-[#358E4E] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Product Confirmation Modal */}
      <AdminModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Product"
        subtitle="Permanent removal from product catalog"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#4B5563]">
            Are you sure you want to permanently delete product{' '}
            <strong className="text-[#111827] font-semibold">{productToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F3F4F6]">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-[#D0453C] hover:bg-[#b83c34] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
};

export default AdminProductsPage;

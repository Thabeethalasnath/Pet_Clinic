import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, AlertCircle, Star, Trash2 } from 'lucide-react';
import { AdminLayout, useAdminToast } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import { AdminImageUrlInput } from '../../components/admin/AdminImageUrlInput';
import { getVetImageUrl, formatCurrency } from '../../lib/utils';
import api from '../../lib/axios';

interface Vet {
  id: number;
  name: string;
  specialization: string;
  rating?: number;
  reviewsCount?: number;
  consultationFee?: number;
  photoUrl: string;
  bio?: string;
  address?: string;
  isActive: boolean;
}

export const AdminVetsPage: React.FC = () => {
  const { showToast } = useAdminToast();
  const [vets, setVets] = useState<Vet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vetToDelete, setVetToDelete] = useState<Vet | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    consultationFee: 500,
    photoUrl: '',
    bio: '',
    isActive: true,
  });

  const fetchVets = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/vets');
      setVets(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch vets', err);
      const msg = err.response?.data?.message || 'Failed to load veterinarians from database.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVets();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      specialization: '',
      consultationFee: 500,
      photoUrl: '',
      bio: '',
      isActive: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (vet: Vet) => {
    setIsEditing(true);
    setCurrentId(vet.id);
    setFormData({
      name: vet.name,
      specialization: vet.specialization || '',
      consultationFee: vet.consultationFee ?? 500,
      photoUrl: vet.photoUrl || '',
      bio: vet.bio || '',
      isActive: vet.isActive,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await api.patch(`/admin/vets/${id}/toggle-status`);
      showToast(res.data?.message || 'Veterinarian status updated successfully!');
      fetchVets();
    } catch (err: any) {
      console.error('Failed to toggle vet status', err);
      const msg = err.response?.data?.message || 'Failed to toggle veterinarian status.';
      showToast(msg, 'error');
    }
  };

  const openDeleteModal = (vet: Vet) => {
    setVetToDelete(vet);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vetToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/vets/${vetToDelete.id}`);
      setVets((prev) => prev.filter((v) => v.id !== vetToDelete.id));
      showToast(res.data?.message || `Veterinarian "${vetToDelete.name}" deleted successfully.`);
      setDeleteModalOpen(false);
      setVetToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete vet', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete veterinarian.';
      showToast(msg, 'error');
      fetchVets();
      setDeleteModalOpen(false);
      setVetToDelete(null);
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
        name: formData.name,
        specialization: formData.specialization,
        consultationFee: formData.consultationFee,
        photoUrl: formData.photoUrl,
        bio: formData.bio,
        isActive: formData.isActive,
      };

      if (isEditing && currentId) {
        await api.put(`/admin/vets/${currentId}`, payload);
        showToast('Veterinarian profile and consultation fee updated successfully!');
      } else {
        await api.post('/admin/vets', payload);
        showToast('Veterinarian profile created successfully!');
      }

      setModalOpen(false);
      fetchVets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save veterinarian profile');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Vet>[] = [
    {
      key: 'name',
      header: 'Veterinarian',
      render: (row) => {
        const photo = getVetImageUrl(row.name, row.photoUrl, row.id);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4EFE6] border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {photo ? (
                <img src={photo} alt={row.name} className="w-full h-full object-cover object-[center_20%]" />
              ) : (
                <span className="text-xs text-gray-500 font-bold">{row.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{row.name}</p>
              <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{row.bio || 'Veterinary Specialist'}</p>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'specialization',
      header: 'Specialization',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
          {row.specialization}
        </span>
      ),
    },
    {
      key: 'consultationFee',
      header: 'Consultation Fee',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-bold text-[#009E66]">
          {formatCurrency(row.consultationFee ?? 500)}
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
          {row.reviewsCount && row.reviewsCount > 0 ? (
            <>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{row.rating ? row.rating.toFixed(1) : '5.0'}</span>
            </>
          ) : (
            <span className="text-gray-400 font-normal">No reviews</span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (row) => <AdminStatusBadge status={row.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Veterinarian"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              row.isActive
                ? 'text-[#6B7280] hover:text-[#C0392B] hover:bg-[#FDEDEC]'
                : 'text-[#6B7280] hover:text-[#3FA65C] hover:bg-[#EBF7EE]'
            }`}
            title={row.isActive ? 'Deactivate' : 'Reactivate'}
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="p-1.5 text-[#9CA3AF] hover:text-[#D0453C] hover:bg-[#FDEDEC] rounded-lg transition-colors cursor-pointer"
            title="Delete Veterinarian"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Veterinarians Management">
      <DataTable
        columns={columns}
        data={vets}
        isLoading={isLoading}
        searchPlaceholder="Search veterinarians by name or specialty..."
        searchKey="name"
        filterLabel="All Statuses"
        filterOptions={[
          { label: 'Active Only', value: 'TRUE' },
          { label: 'Inactive Only', value: 'FALSE' },
        ]}
        filterKey={(row) => String(row.isActive)}
        actions={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3FA65C] hover:bg-[#33894B] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Veterinarian
          </button>
        }
      />

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Veterinarian' : 'Add New Veterinarian'}
        subtitle={isEditing ? 'Update doctor credentials & consultation fee' : 'Register a new clinical vet'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#FDEDEC] border border-[#FADBD8] rounded-lg flex items-center gap-2 text-xs text-[#C0392B]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. Sarah Jenkins, DVM"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Specialization *
            </label>
            <input
              type="text"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="Canine Surgery & Internal Medicine"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Consultation Fee (₹) *
            </label>
            <input
              type="number"
              required
              min={100}
              max={10000}
              value={formData.consultationFee}
              onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
              placeholder="500"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          <AdminImageUrlInput
            label="Photo URL"
            value={formData.photoUrl}
            onChange={(val) => setFormData({ ...formData, photoUrl: val })}
            placeholder="https://images.unsplash.com/... or https://..."
            entityName={formData.name || 'Veterinarian'}
            helperText="Provide a direct URL to a profile photo (starts with http:// or https://, max 512 chars)."
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Dr. Sarah Mitchell is a dedicated Veterinary Surgeon with over 12 years of experience specializing in orthopedic surgery, soft tissue procedures, and emergency trauma care."
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
              {submitting ? 'Saving...' : isEditing ? 'Update Vet' : 'Create Vet'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Veterinarian Confirmation Modal */}
      <AdminModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Veterinarian"
        subtitle="Permanent removal from clinic directory"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#4B5563]">
            Are you sure you want to permanently delete veterinarian{' '}
            <strong className="text-[#111827] font-semibold">{vetToDelete?.name}</strong>?
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
              {deleting ? 'Deleting...' : 'Delete Veterinarian'}
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
};

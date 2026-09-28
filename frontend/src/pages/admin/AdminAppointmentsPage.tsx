import React, { useState, useEffect } from 'react';
import { Check, X, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { AdminLayout, useAdminToast } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import api from '../../lib/axios';

interface AppointmentRecord {
  id: number;
  customerName?: string;
  customerEmail?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  petName: string;
  petSpecies: string;
  vetName: string;
  serviceName: string;
  fee?: number;
  amount?: number;
  consultationFee?: number;
  dateTime: string;
  status: string;
  paymentStatus?: string;
  notes: string;
  hasMedicalRecord: boolean;
}

export const AdminAppointmentsPage: React.FC = () => {
  const { showToast } = useAdminToast();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Medical Record Modal
  const [medicalModalOpen, setMedicalModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [apptToDelete, setApptToDelete] = useState<AppointmentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [medicalForm, setMedicalForm] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
  });

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/appointments');
      setAppointments(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch appointments', err);
      const msg = err.response?.data?.message || 'Failed to load appointments from database.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await api.patch(`/admin/appointments/${id}/status`, { status });
      const formattedStatus = status.replace(/_/g, ' ').toLowerCase();
      showToast(res.data?.message || `Appointment status updated to ${formattedStatus}.`);
      fetchAppointments();
    } catch (err: any) {
      console.error('Failed to update appointment status', err);
      const msg = err.response?.data?.message || 'Failed to update appointment status.';
      showToast(msg, 'error');
    }
  };

  const handleUpdatePaymentStatus = async (id: number, paymentStatus: string) => {
    try {
      const res = await api.patch(`/admin/appointments/${id}/payment-status`, { paymentStatus });
      showToast(res.data?.message || `Payment status updated to ${paymentStatus}.`);
      fetchAppointments();
    } catch (err: any) {
      console.error('Failed to update payment status', err);
      const msg = err.response?.data?.message || 'Failed to update payment status.';
      showToast(msg, 'error');
    }
  };

  const openMedicalModal = async (appt: AppointmentRecord) => {
    setSelectedAppt(appt);
    setMedicalForm({
      diagnosis: '',
      prescription: '',
      notes: '',
    });
    setError(null);
    setMedicalModalOpen(true);

    try {
      const res = await api.get(`/admin/appointments/${appt.id}/medical-record`);
      if (res.data) {
        setMedicalForm({
          diagnosis: res.data.diagnosis || '',
          prescription: res.data.prescription || '',
          notes: res.data.notes || '',
        });
      }
    } catch (err) {
      console.error('Failed to load existing medical record', err);
    }
  };

  const handleCreateMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/admin/appointments/${selectedAppt.id}/medical-record`, medicalForm);
      showToast('Medical record saved successfully!');
      setMedicalModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (appt: AppointmentRecord) => {
    setApptToDelete(appt);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!apptToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/appointments/${apptToDelete.id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== apptToDelete.id));
      showToast(res.data?.message || `Appointment #${apptToDelete.id} deleted successfully.`);
      setDeleteModalOpen(false);
      setApptToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete appointment', err);
      const msg = err.response?.data?.message || 'Failed to delete appointment.';
      showToast(msg, 'error');
      fetchAppointments();
      setDeleteModalOpen(false);
      setApptToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<AppointmentRecord>[] = [
    {
      key: 'petName',
      header: 'Pet & Owner',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-[#16241B] text-sm">
            {row.petName}{' '}
            <span className="text-gray-400 font-normal text-xs">
              ({row.petSpecies || 'Pet'})
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Owner: {row.customerName || row.ownerName || 'Customer'}
          </div>
        </div>
      ),
    },
    {
      key: 'vetName',
      header: 'Veterinarian',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-xs sm:text-sm text-gray-900">
          {row.vetName}
        </span>
      ),
    },
    {
      key: 'serviceName',
      header: 'Service',
      sortable: true,
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {row.serviceName}
        </span>
      ),
    },
    {
      key: 'fee',
      header: 'Amount',
      sortable: true,
      render: (row) => {
        const amount = row.fee ?? row.amount ?? row.consultationFee ?? 500.0;
        return (
          <span className="font-bold text-[#16241B] text-xs sm:text-sm">
            ₹{amount.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'dateTime',
      header: 'Scheduled Time',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-600">
          {row.dateTime ? new Date(row.dateTime).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <AdminStatusBadge status={row.status} />,
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      sortable: true,
      render: (row) => {
        const ps = (row.paymentStatus || 'UNPAID').toUpperCase();
        const isTerminal = ps === 'PAID' || ps === 'FAILED';

        if (isTerminal) {
          return <AdminStatusBadge status={ps} />;
        }

        return (
          <select
            value={ps}
            onChange={(e) => handleUpdatePaymentStatus(row.id, e.target.value)}
            className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded-md focus:outline-none cursor-pointer"
          >
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
          </select>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleUpdateStatus(row.id, 'CONFIRMED')}
                className="p-1.5 text-[#3FA65C] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                title="Confirm Appointment"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUpdateStatus(row.id, 'CANCELLED')}
                className="p-1.5 text-[#C0392B] hover:bg-[#FDEDEC] rounded-lg transition-colors cursor-pointer"
                title="Reject Appointment"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}

          {row.status === 'CONFIRMED' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'COMPLETED')}
              className="px-2.5 py-1 bg-[#EBF7EE] text-[#3FA65C] hover:bg-[#3FA65C] hover:text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              Mark Completed
            </button>
          )}

          {row.status === 'COMPLETED' && (
            <button
              onClick={() => openMedicalModal(row)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                row.hasMedicalRecord
                  ? 'bg-[#EBF7EE] text-[#009E66] hover:bg-[#009E66] hover:text-white'
                  : 'bg-[#EFF6FF] text-[#3B7DD8] hover:bg-[#3B7DD8] hover:text-white'
              }`}
              title={row.hasMedicalRecord ? 'View / Edit Medical Record' : 'Add Medical Record'}
            >
              <FileText className="w-3.5 h-3.5" />
              {row.hasMedicalRecord ? 'Medical Record ✓' : '+ Medical Record'}
            </button>
          )}

          <button
            onClick={() => openDeleteModal(row)}
            className="p-1.5 text-[#9CA3AF] hover:text-[#D0453C] hover:bg-[#FDEDEC] rounded-lg transition-colors cursor-pointer"
            title="Delete Appointment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Appointments & Medical Records">
      <DataTable
        columns={columns}
        data={appointments}
        isLoading={isLoading}
        searchPlaceholder="Search by pet, customer, or vet name..."
        searchKey={(row) => `${row.petName} ${row.customerName || row.ownerName || ''} ${row.customerEmail || row.ownerEmail || ''} ${row.vetName} ${row.serviceName}`}
        filterLabel="All Appointment Statuses"
        filterOptions={[
          { label: 'Pending', value: 'PENDING' },
          { label: 'Confirmed', value: 'CONFIRMED' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
        filterKey="status"
      />

      {/* Add Medical Record Modal */}
      <AdminModal
        isOpen={medicalModalOpen}
        onClose={() => setMedicalModalOpen(false)}
        title={selectedAppt ? `Add Medical Record for ${selectedAppt.petName}` : 'Add Medical Record'}
        subtitle={
          selectedAppt
            ? `Doctor: ${selectedAppt.vetName} • Service: ${selectedAppt.serviceName}`
            : 'Clinical examination documentation'
        }
      >
        <form onSubmit={handleCreateMedicalRecord} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#FDEDEC] border border-[#FADBD8] rounded-lg flex items-center gap-2 text-xs text-[#C0392B]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Diagnosis *
            </label>
            <input
              type="text"
              required
              value={medicalForm.diagnosis}
              onChange={(e) => setMedicalForm({ ...medicalForm, diagnosis: e.target.value })}
              placeholder="e.g. Mild Canine Dermatitis / Routine Vaccination"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Prescription & Treatment *
            </label>
            <textarea
              rows={3}
              required
              value={medicalForm.prescription}
              onChange={(e) => setMedicalForm({ ...medicalForm, prescription: e.target.value })}
              placeholder="e.g. Amoxicillin 250mg twice daily for 7 days; topical soothing spray"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Veterinarian Clinical Notes
            </label>
            <textarea
              rows={2}
              value={medicalForm.notes}
              onChange={(e) => setMedicalForm({ ...medicalForm, notes: e.target.value })}
              placeholder="Patient is alert and hydrated. Follow-up check recommended in 2 weeks."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setMedicalModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#3FA65C] hover:bg-[#358E4E] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Attaching...' : 'Save Medical Record'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Appointment Modal */}
      <AdminModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Appointment"
        subtitle="Permanent removal of appointment and medical records"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#4B5563]">
            Are you sure you want to permanently delete appointment{' '}
            <strong className="text-[#111827] font-semibold">#{apptToDelete?.id}</strong> for{' '}
            <strong className="text-[#111827] font-semibold">{apptToDelete?.petName}</strong>?
            This will also delete any associated medical records and reviews.
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
              {deleting ? 'Deleting...' : 'Delete Appointment'}
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
};

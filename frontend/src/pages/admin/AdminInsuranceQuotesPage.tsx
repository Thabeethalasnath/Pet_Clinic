import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Edit3, Mail, Phone, Clock, CheckCircle2 } from 'lucide-react';
import { AdminLayout, useAdminToast } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import api from '../../lib/axios';

interface InsuranceQuoteRecord {
  id: number;
  customerId?: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  petName: string;
  petSpecies: string;
  petAge: number;
  selectedPlan: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const AdminInsuranceQuotesPage: React.FC = () => {
  const { showToast } = useAdminToast();
  const [quotes, setQuotes] = useState<InsuranceQuoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Status Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<InsuranceQuoteRecord | null>(null);
  const [editStatus, setEditStatus] = useState<string>('PENDING');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const url = statusFilter !== 'ALL' ? `/admin/insurance-quotes?status=${statusFilter}` : '/admin/insurance-quotes';
      const res = await api.get(url);
      setQuotes(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch insurance quotes', err);
      const msg = err.response?.data?.message || 'Failed to load insurance quotes.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  const handleOpenEditModal = (quote: InsuranceQuoteRecord) => {
    setSelectedQuote(quote);
    setEditStatus(quote.status || 'PENDING');
    setEditNotes(quote.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedQuote) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/admin/insurance-quotes/${selectedQuote.id}/status`, {
        status: editStatus,
        notes: editNotes,
      });
      showToast(`Quote #${selectedQuote.id} status updated to ${editStatus}.`);
      setIsEditModalOpen(false);
      fetchQuotes();
    } catch (err: any) {
      console.error('Failed to update quote status', err);
      const msg = err.response?.data?.message || 'Failed to update quote status.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      q.customerName.toLowerCase().includes(term) ||
      q.customerEmail.toLowerCase().includes(term) ||
      q.customerPhone.toLowerCase().includes(term) ||
      q.petName.toLowerCase().includes(term) ||
      q.selectedPlan.toLowerCase().includes(term) ||
      q.status.toLowerCase().includes(term)
    );
  });

  // Calculate summary counts
  const totalCount = quotes.length;
  const pendingCount = quotes.filter((q) => q.status === 'PENDING').length;
  const reviewedCount = quotes.filter((q) => q.status === 'REVIEWED' || q.status === 'CONTACTED').length;
  const approvedCount = quotes.filter((q) => q.status === 'APPROVED').length;

  const columns: Column<InsuranceQuoteRecord>[] = [
    {
      key: 'id',
      header: 'Quote Details',
      render: (q: InsuranceQuoteRecord) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#16241B] text-xs">Quote #{q.id}</span>
          <span className="text-[11px] text-gray-500 font-medium">
            {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (q: InsuranceQuoteRecord) => (
        <div className="flex flex-col space-y-0.5">
          <span className="font-bold text-[#16241B] text-xs flex items-center gap-1">
            {q.customerName}
          </span>
          <span className="text-[11px] text-gray-500 font-medium truncate flex items-center gap-1">
            <Mail className="w-3 h-3 text-gray-400" /> {q.customerEmail}
          </span>
          <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
            <Phone className="w-3 h-3 text-gray-400" /> {q.customerPhone}
          </span>
        </div>
      ),
    },
    {
      key: 'petName',
      header: 'Pet Profile',
      render: (q: InsuranceQuoteRecord) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#16241B] text-xs">{q.petName}</span>
          <span className="text-[11px] text-gray-500 font-medium">
            {q.petSpecies} • {q.petAge} {q.petAge === 1 ? 'yr' : 'yrs'} old
          </span>
        </div>
      ),
    },
    {
      key: 'selectedPlan',
      header: 'Plan Tiers',
      render: (q: InsuranceQuoteRecord) => {
        let badgeStyle = 'bg-gray-100 text-gray-700';
        if (q.selectedPlan === 'Basic') badgeStyle = 'bg-purple-100 text-purple-800 border-purple-200';
        else if (q.selectedPlan === 'Standard') badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        else if (q.selectedPlan === 'Comprehensive') badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';

        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black border ${badgeStyle}`}>
            {q.selectedPlan}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (q: InsuranceQuoteRecord) => <AdminStatusBadge status={q.status} />,
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (q: InsuranceQuoteRecord) => (
        <span className="text-xs text-gray-600 italic max-w-xs truncate block" title={q.notes || 'No notes'}>
          {q.notes || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (q: InsuranceQuoteRecord) => (
        <button
          onClick={() => handleOpenEditModal(q)}
          className="px-3 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#E6F9EC] text-[#16241B] hover:text-[#009E66] text-xs font-bold border border-[#EDE7D9] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Manage</span>
        </button>
      ),
    },
  ];

  return (
    <AdminLayout title="Insurance Quotes Management">
      <div className="space-y-6">
        {/* Header Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#EBEBE8] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#3FA65C] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Quotes</p>
              <p className="text-xl font-black text-[#16241B]">{totalCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EBEBE8] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending Review</p>
              <p className="text-xl font-black text-[#16241B]">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EBEBE8] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Reviewed / Contacted</p>
              <p className="text-xl font-black text-[#16241B]">{reviewedCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EBEBE8] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Approved</p>
              <p className="text-xl font-black text-[#16241B]">{approvedCount}</p>
            </div>
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="bg-white rounded-2xl p-4 border border-[#EBEBE8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {['ALL', 'PENDING', 'REVIEWED', 'CONTACTED', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#16241B] text-white shadow-xs'
                    : 'bg-[#F9FAF8] text-gray-600 hover:bg-[#F3F4F6]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, pet, or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F9FAF8] border border-[#E5E7EB] text-xs text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#3FA65C]"
            />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredQuotes}
          isLoading={isLoading}
          emptyTitle="No insurance quote requests found"
          emptySubtitle="No requests match your selected status or search term."
        />

        {/* Status & Notes Management Modal */}
        {isEditModalOpen && selectedQuote && (
          <AdminModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title={`Manage Quote #${selectedQuote.id}`}
          >
            <div className="space-y-4 text-xs">
              <div className="bg-[#FAF6EE] rounded-xl p-3.5 border border-[#EDE7D9] space-y-1">
                <p className="font-bold text-[#16241B]">
                  Customer: <span className="font-normal">{selectedQuote.customerName} ({selectedQuote.customerEmail})</span>
                </p>
                <p className="font-bold text-[#16241B]">
                  Pet: <span className="font-normal">{selectedQuote.petName} ({selectedQuote.petSpecies}, {selectedQuote.petAge} yrs)</span>
                </p>
                <p className="font-bold text-[#16241B]">
                  Selected Plan: <span className="font-normal">{selectedQuote.selectedPlan}</span>
                </p>
                <p className="font-bold text-[#16241B]">
                  Phone: <span className="font-normal">{selectedQuote.customerPhone}</span>
                </p>
              </div>

              <div>
                <label className="block font-black text-gray-700 uppercase tracking-wider mb-1">
                  Update Quote Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF8] border border-[#E5E7EB] text-xs text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#3FA65C]"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="REVIEWED">REVIEWED</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-gray-700 uppercase tracking-wider mb-1">
                  Admin Internal Notes / Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Spoke with customer on phone. Policy terms sent via email."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAF8] border border-[#E5E7EB] text-xs text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#3FA65C]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full bg-[#3FA65C] hover:bg-[#348e4e] text-white font-bold cursor-pointer disabled:opacity-70 shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </AdminModal>
        )}
      </div>
    </AdminLayout>
  );
};

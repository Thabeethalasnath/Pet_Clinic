import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Calendar,
  Users,
  IndianRupee,
  Package,
  Stethoscope,
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Megaphone,
} from 'lucide-react';
import { AdminLayout, useAdminToast } from '../../components/admin/AdminLayout';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import { AdminModal } from '../../components/admin/AdminModal';
import api from '../../lib/axios';

interface LowStockProduct {
  id: number;
  name: string;
  category: string;
  stockQuantity: number;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
}

interface Stats {
  totalOrdersThisMonth: number;
  pendingAppointments: number;
  totalCustomers: number;
  totalRevenueThisMonth: number;
  activeVetsCount: number;
  inactiveVetsCount: number;
  totalVetsCount: number;
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
}

interface MonthlyRevenueData {
  month: string;
  fullMonth: string;
  orderRevenue: number;
  appointmentRevenue: number;
  totalRevenue: number;
  orderCount: number;
  appointmentCount: number;
}

interface RecentOrder {
  id: number;
  customerName: string;
  customerEmail?: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  itemName?: string;
  itemCount?: number;
  lineItemCount?: number;
}

interface RecentAppointment {
  id: number;
  customerName: string;
  ownerName?: string;
  petName: string;
  petSpecies?: string;
  vetName: string;
  serviceName: string;
  dateTime: string;
  status: string;
  amount?: number;
  fee?: number;
}

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useAdminToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  // Announcement Modal State
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;
    setAnnouncementSubmitting(true);
    try {
      const res = await api.post('/admin/announcements', {
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
      });
      showToast(res.data?.message || 'Announcement sent to all active customers!');
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setAnnouncementModalOpen(false);
    } catch (err: any) {
      console.error('Failed to send announcement:', err);
      showToast(err.response?.data?.message || 'Failed to send announcement.', 'error');
    } finally {
      setAnnouncementSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/admin/dashboard/summary');
        if (res.data) {
          setStats(res.data.stats || null);
          setMonthlyRevenue(res.data.monthlyRevenue || []);
          setRecentOrders(res.data.recentOrders || []);
          setRecentAppointments(res.data.recentAppointments || []);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to load dashboard data.';
        showToast(msg, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const maxRevenue = Math.max(
    ...monthlyRevenue.flatMap((m) => [m.orderRevenue, m.appointmentRevenue, m.totalRevenue]),
    200
  );

  const totalPeriodRevenue = monthlyRevenue.reduce((acc, m) => acc + m.totalRevenue, 0);

  // Vet Donut Chart Calculations
  const activeVets = stats?.activeVetsCount ?? 0;
  const inactiveVets = stats?.inactiveVetsCount ?? 0;
  const totalVets = stats?.totalVetsCount ?? (activeVets + inactiveVets);
  const activeVetPct = totalVets > 0 ? Math.round((activeVets / totalVets) * 100) : 0;
  const donutR = 52;
  const donutCircumference = 2 * Math.PI * donutR;
  const activeStroke = totalVets > 0 ? (activeVets / totalVets) * donutCircumference : 0;
  const inactiveStroke = donutCircumference - activeStroke;

  const lowStockList = stats?.lowStockProducts || [];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div>
            <h2 className="text-base font-black text-[#16241B]">Admin Portal Overview</h2>
            <p className="text-xs text-gray-500 font-medium">Broadcast platform announcements and review real-time activity.</p>
          </div>
          <button
            onClick={() => setAnnouncementModalOpen(true)}
            className="px-4 py-2.5 bg-[#3FA65C] hover:bg-[#009E66] text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Send Announcement</span>
          </button>
        </div>
        {/* ========================================================================= */}
        {/* ROW 1: 4 STAT CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Orders */}
          <div
            className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between hover:shadow-md hover:border-[#3B7DD8]/40 hover:-translate-y-0.5 transition-all duration-200 group cursor-default"
          >
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#3B7DD8] transition-colors">
                Total Orders
              </p>
              <h3 className="text-3xl font-black text-[#16241B] mt-1 tracking-tight">
                {isLoading ? '...' : stats?.totalOrdersThisMonth ?? 0}
              </h3>
              <p className="text-[11px] font-medium text-gray-400 mt-0.5">This month's orders</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#3B7DD8] flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-[#3B7DD8] group-hover:text-white transition-all shadow-2xs">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Pending Appointments */}
          <div
            className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between hover:shadow-md hover:border-[#EF7C3C]/40 hover:-translate-y-0.5 transition-all duration-200 group cursor-default"
          >
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#EF7C3C] transition-colors">
                Pending Appointments
              </p>
              <h3 className="text-3xl font-black text-[#16241B] mt-1 tracking-tight">
                {isLoading ? '...' : stats?.pendingAppointments ?? 0}
              </h3>
              <p className="text-[11px] font-medium text-gray-400 mt-0.5">Awaiting action</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FEF3EC] text-[#EF7C3C] flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-[#EF7C3C] group-hover:text-white transition-all shadow-2xs">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Total Customers */}
          <div
            className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between hover:shadow-md hover:border-[#3FA65C]/40 hover:-translate-y-0.5 transition-all duration-200 group cursor-default"
          >
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#3FA65C] transition-colors">
                Total Customers
              </p>
              <h3 className="text-3xl font-black text-[#16241B] mt-1 tracking-tight">
                {isLoading ? '...' : stats?.totalCustomers ?? 0}
              </h3>
              <p className="text-[11px] font-medium text-gray-400 mt-0.5">Registered accounts</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#EBF7EE] text-[#3FA65C] flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-[#3FA65C] group-hover:text-white transition-all shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Total Revenue */}
          <div
            className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between hover:shadow-md hover:border-purple-400/40 hover:-translate-y-0.5 transition-all duration-200 group cursor-default"
          >
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">
                Total Revenue
              </p>
              <h3 className="text-3xl font-black text-[#16241B] mt-1 tracking-tight">
                {isLoading ? '...' : `₹${(stats?.totalRevenueThisMonth ?? 0).toFixed(2)}`}
              </h3>
              <p className="text-[11px] font-medium text-gray-400 mt-0.5">Orders & vet fees</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: MONTHLY REVENUE ANALYTICS (LINE/AREA CHART) & RECENT ORDERS LIST */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Monthly Revenue Analytics Line/Area Chart */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#3FA65C] flex items-center justify-center">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-[#16241B] tracking-tight">
                        Monthly Revenue Analytics
                      </h3>
                      <p className="text-xs font-medium text-gray-500">
                        Monthly order and vet consultation revenue over the last 6 months
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3FA65C]"></span>
                    <span>Order Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF7C3C]"></span>
                    <span>Vet Visits</span>
                  </div>
                  <div className="px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700 font-bold text-xs">
                    6-Mo: ₹{totalPeriodRevenue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Bar Chart */}
              <div className="relative w-full pt-2">
                {isLoading ? (
                  <div className="h-56 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#3FA65C] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : monthlyRevenue.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-xs text-gray-400">
                    No revenue recorded yet
                  </div>
                ) : (
                  <div className="relative h-56 flex flex-col justify-end">
                    {/* Horizontal Background Gridlines & Y-Axis values */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                      {[1, 0.75, 0.5, 0.25, 0].map((pct, idx) => {
                        const val = maxRevenue * pct;
                        return (
                          <div key={idx} className="flex items-center w-full">
                            <span className="w-9 text-right pr-2 text-[10px] text-gray-400 font-medium select-none">
                              ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
                            </span>
                            <div className={`flex-1 border-b ${idx === 4 ? 'border-gray-200' : 'border-dashed border-gray-100'}`} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Bars Container */}
                    <div className="relative z-10 grid grid-cols-6 gap-2 sm:gap-4 pl-9 h-full items-end pb-7">
                      {monthlyRevenue.map((item, idx) => {
                        const isHovered = hoveredMonthIndex === idx;
                        const orderHeightPct = maxRevenue > 0 ? (item.orderRevenue / maxRevenue) * 100 : 0;
                        const aptHeightPct = maxRevenue > 0 ? (item.appointmentRevenue / maxRevenue) * 100 : 0;

                        return (
                          <div
                            key={idx}
                            className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                            onMouseEnter={() => setHoveredMonthIndex(idx)}
                            onMouseLeave={() => setHoveredMonthIndex(null)}
                          >
                            {/* Side-by-Side Grouped Bar Columns */}
                            <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-1">
                              {/* 1. Order Revenue Bar */}
                              {item.orderRevenue === 0 ? (
                                <div
                                  className="w-3 sm:w-4.5 h-1.5 bg-gray-100 rounded-full transition-all group-hover:bg-gray-200"
                                  title="Order Revenue: ₹0.00"
                                />
                              ) : (
                                <div
                                  className="w-3 sm:w-4.5 bg-[#3FA65C] rounded-t-md shadow-xs transition-all duration-300 group-hover:bg-[#2F8A4B] group-hover:shadow-md"
                                  style={{
                                    height: `${Math.max(6, Math.min(100, orderHeightPct))}%`,
                                  }}
                                  title={`Order Revenue: ₹${item.orderRevenue.toFixed(2)}`}
                                />
                              )}

                              {/* 2. Vet Visits Bar */}
                              {item.appointmentRevenue === 0 ? (
                                <div
                                  className="w-3 sm:w-4.5 h-1.5 bg-gray-100 rounded-full transition-all group-hover:bg-gray-200"
                                  title="Vet Visits: ₹0.00"
                                />
                              ) : (
                                <div
                                  className="w-3 sm:w-4.5 bg-[#EF7C3C] rounded-t-md shadow-xs transition-all duration-300 group-hover:bg-[#D96B2C] group-hover:shadow-md"
                                  style={{
                                    height: `${Math.max(6, Math.min(100, aptHeightPct))}%`,
                                  }}
                                  title={`Vet Visits: ₹${item.appointmentRevenue.toFixed(2)}`}
                                />
                              )}
                            </div>

                            {/* Month Label */}
                            <span
                              className={`absolute -bottom-6 text-[11px] font-bold transition-colors select-none ${
                                isHovered ? 'text-[#3FA65C]' : 'text-gray-600'
                              }`}
                            >
                              {item.month}
                            </span>

                            {/* Tooltip on Hover */}
                            {isHovered && (
                              <div className="absolute bottom-full mb-2 z-30 bg-[#16241B] text-white text-[11px] rounded-xl px-3 py-2 shadow-xl border border-white/10 whitespace-nowrap pointer-events-none -translate-x-1/2 left-1/2 animate-in fade-in duration-150">
                                <p className="font-bold text-white text-xs">{item.fullMonth}</p>
                                <div className="mt-1 space-y-0.5">
                                  <p className="text-emerald-400">
                                    Order Revenue: ₹{item.orderRevenue.toFixed(2)} ({item.orderCount} {item.orderCount === 1 ? 'order' : 'orders'})
                                  </p>
                                  <p className="text-orange-400">
                                    Vet Visits: ₹{item.appointmentRevenue.toFixed(2)} ({item.appointmentCount} {item.appointmentCount === 1 ? 'visit' : 'visits'})
                                  </p>
                                  <p className="font-black text-white pt-1 border-t border-white/20">
                                    Total: ₹{item.totalRevenue.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Updated automatically with paid orders & completed visits</span>
              <span className="font-semibold text-gray-700">6-Month Trend</span>
            </div>
          </div>

          {/* Recent Orders List (customer, item, status badge) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#16241B] tracking-tight">
                    Recent Orders
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    Latest customer purchases
                  </p>
                </div>
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3FA65C] hover:text-[#009E66] transition-colors"
                >
                  View All
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                      <div className="h-4 bg-gray-200 rounded w-28" />
                      <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No orders recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/70 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-[#16241B]">#{order.id}</span>
                          <span className="text-xs font-semibold text-gray-900 truncate">
                            {order.customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-gray-500 truncate max-w-[150px]">
                            {order.itemName || 'Store item'}
                          </span>
                          {order.itemCount && order.itemCount > 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                              +{order.itemCount - 1} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs font-black text-[#16241B]">
                          ₹{order.totalAmount?.toFixed(2)}
                        </span>
                        <AdminStatusBadge status={order.orderStatus} className="text-[10px] px-2 py-0.5 scale-90 origin-right" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>Showing 5 latest</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 3: THREE PANELS */}
        {/* 1. Manage Products (Low stock items with counts) */}
        {/* 2. Manage Vets (Active vs Inactive pie/donut chart) */}
        {/* 3. Recent Appointments (Pet, owner, vet, time) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* PANEL 1: Manage Products (Low Stock Items) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#16241B] tracking-tight">
                      Manage Products
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500">
                      Low stock alerts (&lt; 10 units)
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/products"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3FA65C] hover:text-[#009E66] transition-colors"
                >
                  Manage
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : lowStockList.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6 text-[#3FA65C] mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-[#16241B]">Inventory is Healthy</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    No products are below 10 units in stock.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {lowStockList.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/30 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-9 h-9 rounded-lg object-cover border border-amber-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#16241B] truncate">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-gray-500">{product.category}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                          {product.stockQuantity} left
                        </span>
                        <p className="text-[10px] font-bold text-gray-600 mt-0.5">
                          ₹{product.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-700">
                {stats?.lowStockCount ?? lowStockList.length} items low in stock
              </span>
            </div>
          </div>

          {/* PANEL 2: Manage Vets (Active vs Inactive Donut Chart) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#EF7C3C] flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#16241B] tracking-tight">
                      Manage Vets
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500">
                      Staff availability & status
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/vets"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3FA65C] hover:text-[#009E66] transition-colors"
                >
                  Manage
                </Link>
              </div>

              {/* Donut Chart */}
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#EF7C3C] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 130 130" className="w-full h-full transform -rotate-90">
                      {/* Background circle / Inactive */}
                      <circle
                        cx="65"
                        cy="65"
                        r={donutR}
                        fill="transparent"
                        stroke="#E5E7EB"
                        strokeWidth="14"
                      />
                      {/* Inactive slice */}
                      {inactiveVets > 0 && (
                        <circle
                          cx="65"
                          cy="65"
                          r={donutR}
                          fill="transparent"
                          stroke="#9CA3AF"
                          strokeWidth="14"
                          strokeDasharray={`${inactiveStroke} ${donutCircumference}`}
                          strokeDashoffset={-activeStroke}
                          className="transition-all duration-500"
                        />
                      )}
                      {/* Active slice */}
                      {activeVets > 0 && (
                        <circle
                          cx="65"
                          cy="65"
                          r={donutR}
                          fill="transparent"
                          stroke="#3FA65C"
                          strokeWidth="14"
                          strokeDasharray={`${activeStroke} ${donutCircumference}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      )}
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-black text-[#16241B] tracking-tight leading-none">
                        {activeVetPct}%
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Legend Breakdown */}
                  <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3FA65C] shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Active</p>
                        <p className="text-xs font-black text-[#16241B]">{activeVets} Doctors</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200/80">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Inactive</p>
                        <p className="text-xs font-black text-[#16241B]">{inactiveVets} Doctors</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>{totalVets} Total Registered</span>
            </div>
          </div>

          {/* PANEL 3: Recent Appointments (Pet, Owner, Vet, Time) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#16241B] tracking-tight">
                      Recent Appointments
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500">
                      Pet, owner, vet & scheduled time
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/appointments"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3FA65C] hover:text-[#009E66] transition-colors"
                >
                  View All
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : recentAppointments.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No appointments booked yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className="p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/70 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[#16241B] truncate">
                            {apt.petName}
                          </span>
                          {apt.petSpecies && (
                            <span className="text-[10px] font-semibold text-gray-400">
                              ({apt.petSpecies})
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">
                          Owner: <span className="font-semibold text-gray-700">{apt.ownerName || apt.customerName}</span>
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          Vet: <span className="font-semibold text-emerald-700">{apt.vetName}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold text-gray-600">
                          {apt.dateTime
                            ? new Date(apt.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })
                            : '-'}
                        </span>
                        <AdminStatusBadge status={apt.status} className="text-[10px] px-2 py-0.5 scale-90 origin-right" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="font-bold text-sky-700">
                {recentAppointments.length} appointments recorded
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Send Announcement Modal */}
      <AdminModal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        title="Broadcast Customer Announcement"
        subtitle="Send an official announcement notification to all registered customers."
      >
        <form onSubmit={handleSendAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Free Dental Checkup Week / Platform Maintenance"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Message Content *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Write the full announcement message to broadcast..."
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA65C]/30 focus:border-[#3FA65C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setAnnouncementModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={announcementSubmitting}
              className="px-5 py-2.5 bg-[#3FA65C] hover:bg-[#009E66] text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>{announcementSubmitting ? 'Sending...' : 'Broadcast Announcement'}</span>
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminLayout>
  );
};

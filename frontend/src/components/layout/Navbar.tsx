import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  X,
  Calendar,
  LogIn,
  LogOut,
  Megaphone,
  CheckCheck,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { getCloudinaryImageUrl } from '../../lib/utils';
import { useAuth } from '../../features/auth/AuthContext';
import { apiClient } from '../../lib/axios';

interface NotificationItem {
  id: string;
  numericId?: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'admin' | 'appointment' | 'order' | 'promo' | 'product' | 'restock';
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Just now';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface NavbarProps {
  activePage?:
    | 'home'
    | 'services'
    | 'pharmacy'
    | 'pet-essentials'
    | 'health-tips'
    | 'find-a-vet'
    | 'insurance'
    | 'profile';
}

export const Navbar: React.FC<NavbarProps> = ({ activePage = 'home' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const logoUrl = getCloudinaryImageUrl('pawfectly_logo');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const fetchBackendNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications((prev) => (prev.length > 0 ? [] : prev));
      return;
    }
    try {
      const res = await apiClient.get('/customer/notifications');
      const backendData: any[] = res.data || [];
      const mapped: NotificationItem[] = backendData.map((n: any) => ({
        id: n.id ? n.id.toString() : Math.random().toString(),
        numericId: n.id,
        title: n.title || 'Notification',
        message: n.message || '',
        time: formatRelativeTime(n.createdAt),
        isRead: !!n.isRead,
        type: n.type === 'ANNOUNCEMENT' ? 'admin' : n.type === 'APPOINTMENT' ? 'appointment' : (n.type && n.type.includes('ORDER')) ? 'order' : 'admin',
      }));
      setNotifications(mapped);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBackendNotifications();
  }, [fetchBackendNotifications]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchBackendNotifications();
    };
    window.addEventListener('notifications-updated', handleUpdate);
    return () => window.removeEventListener('notifications-updated', handleUpdate);
  }, [fetchBackendNotifications]);

  useEffect(() => {
    if (notificationMenuOpen) {
      fetchBackendNotifications();
    }
  }, [notificationMenuOpen, fetchBackendNotifications]);


  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    const item = notifications.find((n) => n.id === id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (item && item.numericId) {
      try {
        await apiClient.patch(`/customer/notifications/${item.numericId}/read`);
      } catch (err) {
        console.error('Failed to mark notification read', err);
      }
    }
    window.dispatchEvent(new Event('notifications-updated'));
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiClient.patch('/customer/notifications/read-all');
    } catch {
      const unread = notifications.filter((n) => !n.isRead && n.numericId);
      await Promise.all(
        unread.map((n) =>
          apiClient.patch(`/customer/notifications/${n.numericId}/read`).catch(() => {})
        )
      );
    }
    window.dispatchEvent(new Event('notifications-updated'));
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    try {
      await apiClient.delete('/customer/notifications');
    } catch {
      await Promise.all(
        notifications.filter((n) => n.numericId).map((n) =>
          apiClient.delete(`/customer/notifications/${n.numericId}`).catch(() => {})
        )
      );
    }
    window.dispatchEvent(new Event('notifications-updated'));
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (item && item.numericId) {
      try {
        await apiClient.delete(`/customer/notifications/${item.numericId}`);
      } catch (err) {
        console.error('Failed to delete notification', err);
      }
    }
    window.dispatchEvent(new Event('notifications-updated'));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markAsRead(notif.id);
    setNotificationMenuOpen(false);
    if (
      notif.type === 'product' ||
      notif.type === 'restock' ||
      notif.title.toLowerCase().includes('back in stock')
    ) {
      navigate('/pharmacy');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(target)
      ) {
        setNotificationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'Services', href: '/services', id: 'services' },
    { label: 'Pharmacy', href: '/pharmacy', id: 'pharmacy' },
    { label: 'Paw Store', href: '/pet-essentials', id: 'pet-essentials' },
    { label: 'Fur & Facts', href: '/health-tips', id: 'health-tips' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF6EE]/85 backdrop-blur-2xl backdrop-saturate-180 border-b border-[#16241B]/10 shadow-[0_8px_30px_rgba(22,36,27,0.06)] h-16 sm:h-18'
          : 'bg-[#FAF6EE]/95 backdrop-blur-lg border-b border-[#16241B]/6 h-20'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between relative">
        {/* Leftmost: Logo & Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
          className="flex items-center gap-3 cursor-pointer shrink-0"
        >
          <img
            src={logoUrl}
            alt="Pawfectly Logo"
            className="w-10 h-10 rounded-full object-cover shadow-xs"
          />
          <span className="text-2xl font-black tracking-tight text-[#16241B] font-sans">
            Pawfectly<span className="text-[#EF7C3C]">.</span>
          </span>
        </a>

        {/* Centered Component */}
        {activePage === 'profile' ? null : (
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-semibold text-sm absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;

              return (
                <div key={link.id} className="relative py-2">
                  <Link
                    to={link.href}
                    className={`flex items-center gap-1 transition-colors relative ${
                      isActive
                        ? 'text-[#3FA65C] font-bold after:content-[\'\'] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#3FA65C]'
                        : 'text-[#334437] hover:text-[#3FA65C]'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                </div>
              );
            })}
          </nav>
        )}

        {/* Rightmost: Actions */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {activePage === 'profile' ? (
            <>
              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                  aria-label="Notifications"
                  title="Notifications"
                  className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                    notificationMenuOpen
                      ? 'bg-[#E6F9EC] border-[#3FA65C] text-[#009E66]'
                      : 'bg-white border-[#E5DFCE] text-[#334437] hover:bg-[#F3EDE0]'
                  }`}
                >
                  <Bell className="w-4.5 h-4.5 text-[#16241B]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationMenuOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-[#EDE7D9] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3.5 border-b border-[#F0EAE1] bg-[#FAF6EE]/70 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#16241B]">Inbox Notifications</span>
                        {unreadCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#E6F9EC] text-[#009E66] text-[10px] font-bold">
                            All read
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-xs font-bold text-[#009E66] hover:text-[#008757] hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F0EAE1]">
                      {notifications.length === 0 ? (
                        <div className="py-10 px-4 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FAF6EE] border border-[#E5DFCE] flex items-center justify-center text-[#88998C]">
                            <Bell className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-[#16241B]">No notifications</p>
                          <p className="text-xs text-[#88998C] mt-1">You're all caught up with clinic updates!</p>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`group p-3.5 transition-colors cursor-pointer relative flex items-start gap-3 ${
                              item.isRead
                                ? 'bg-white hover:bg-[#FAF6EE]/50 text-[#6B7280]'
                                : 'bg-[#FAF6EE]/40 hover:bg-[#FAF6EE] text-[#16241B]'
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border ${
                                item.type === 'admin'
                                  ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
                                  : item.type === 'appointment'
                                  ? 'bg-[#E6F9EC] border-[#C3ECD0] text-[#009E66]'
                                  : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]'
                              }`}
                            >
                              {item.type === 'admin' ? (
                                <Megaphone className="w-4 h-4" />
                              ) : item.type === 'appointment' ? (
                                <Calendar className="w-4 h-4" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <p
                                  className={`text-xs truncate ${
                                    item.isRead ? 'font-semibold text-[#334437]' : 'font-black text-[#16241B]'
                                  }`}
                                >
                                  {item.title}
                                </p>
                                {!item.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs leading-relaxed text-[#55665B] line-clamp-2">
                                {item.message}
                              </p>
                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F0EAE1]/60">
                                <span className="text-[10px] font-medium text-[#88998C] flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.time}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => deleteNotification(item.id, e)}
                              title="Dismiss notification"
                              className="opacity-0 group-hover:opacity-100 p-1 text-[#88998C] hover:text-red-500 hover:bg-red-50 rounded-md transition-all absolute top-3 right-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 bg-[#FAF6EE]/50 border-t border-[#F0EAE1] flex items-center justify-between text-xs">
                        <button
                          onClick={clearAllNotifications}
                          className="font-bold text-[#88998C] hover:text-red-500 transition-colors cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Logout Icon Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                aria-label="Logout"
                title="Log Out"
                className="w-10 h-10 rounded-full bg-white border border-[#E5DFCE] flex items-center justify-center text-[#334437] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </>
          ) : (
            <>
              {/* Notification Bell with Dialogue Box */}
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                  aria-label="Notifications"
                  aria-expanded={notificationMenuOpen}
                  className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                    notificationMenuOpen
                      ? 'bg-[#E6F9EC] border-[#3FA65C] text-[#009E66]'
                      : 'bg-white border-[#E5DFCE] text-[#334437] hover:bg-[#F3EDE0]'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationMenuOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-[#EDE7D9] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3.5 border-b border-[#F0EAE1] bg-[#FAF6EE]/70 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#16241B]">Notifications</span>
                        {unreadCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#E6F9EC] text-[#009E66] text-[10px] font-bold">
                            All read
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-xs font-bold text-[#009E66] hover:text-[#008757] hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F0EAE1]">
                      {notifications.length === 0 ? (
                        <div className="py-10 px-4 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FAF6EE] border border-[#E5DFCE] flex items-center justify-center text-[#88998C]">
                            <Bell className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-[#16241B]">No notifications</p>
                          <p className="text-xs text-[#88998C] mt-1">You're all caught up with clinic updates!</p>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`group p-3.5 transition-colors cursor-pointer relative flex items-start gap-3 ${
                              item.isRead
                                ? 'bg-white hover:bg-[#FAF6EE]/50 text-[#6B7280]'
                                : 'bg-[#FAF6EE]/40 hover:bg-[#FAF6EE] text-[#16241B]'
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border ${
                                item.type === 'admin'
                                  ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
                                  : item.type === 'appointment'
                                  ? 'bg-[#E6F9EC] border-[#C3ECD0] text-[#009E66]'
                                  : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]'
                              }`}
                            >
                              {item.type === 'admin' ? (
                                <Megaphone className="w-4 h-4" />
                              ) : item.type === 'appointment' ? (
                                <Calendar className="w-4 h-4" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <p
                                  className={`text-xs truncate ${
                                    item.isRead ? 'font-semibold text-[#334437]' : 'font-black text-[#16241B]'
                                  }`}
                                >
                                  {item.title}
                                </p>
                                {!item.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs leading-relaxed text-[#55665B] line-clamp-2">
                                {item.message}
                              </p>
                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F0EAE1]/60">
                                <span className="text-[10px] font-medium text-[#88998C] flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.time}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => deleteNotification(item.id, e)}
                              title="Dismiss notification"
                              className="opacity-0 group-hover:opacity-100 p-1 text-[#88998C] hover:text-red-500 hover:bg-red-50 rounded-md transition-all absolute top-3 right-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 bg-[#FAF6EE]/50 border-t border-[#F0EAE1] flex items-center justify-between text-xs">
                        <button
                          onClick={clearAllNotifications}
                          className="font-bold text-[#88998C] hover:text-red-500 transition-colors cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Button */}
              {isAuthenticated ? (
                <button
                  onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/profile')}
                  aria-label="Profile"
                  className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer bg-white border-[#E5DFCE] text-[#334437] hover:bg-[#F3EDE0]"
                >
                  <span className="font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold bg-white border border-[#E5DFCE] text-[#16241B] hover:bg-[#F3EDE0] transition-colors shadow-xs"
                >
                  <LogIn className="w-4 h-4 text-[#3FA65C]" />
                  Sign In
                </Link>
              )}

              <Button
                variant="primary"
                size="sm"
                showPaw
                onClick={() => navigate(isAuthenticated ? '/profile?tab=appointments' : '/login')}
                className="h-10 text-sm font-bold cursor-pointer"
              >
                Appointment
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button & actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              aria-label="Notifications"
              className="relative w-9 h-9 rounded-full bg-white border border-[#E5DFCE] flex items-center justify-center text-[#334437] hover:bg-[#F3EDE0] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-[#16241B]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#16241B] hover:bg-[#EAE3D2]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF6EE] border-b border-[#EAE3D2] px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-4 font-semibold text-base">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={
                  activePage === link.id
                    ? 'text-[#3FA65C] font-bold'
                    : 'text-[#334437] hover:text-[#3FA65C]'
                }
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/profile');
              }}
              className="text-left text-[#334437] hover:text-[#3FA65C] font-bold pt-2 border-t border-[#EAE3D2] cursor-pointer"
            >
              {user?.role === 'ADMIN' ? 'Admin Portal' : 'My Profile'}
            </button>
          </nav>
          <div className="pt-4 border-t border-[#EAE3D2] flex flex-col gap-3">
            <Button
              variant="primary"
              size="sm"
              showPaw
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(isAuthenticated ? '/profile?tab=appointments' : '/login');
              }}
              className="w-full cursor-pointer justify-between px-5"
            >
              Appointment
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};



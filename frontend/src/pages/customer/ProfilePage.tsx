import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../../components/layout/Navbar';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useAuth } from '../../features/auth/AuthContext';
import { getCloudinaryImageUrl, getArticleImageUrl, getPetSpeciesImage, getVetImageUrl, getProductImageUrl, getServiceImageUrl, formatCurrency, type WishlistItem } from '../../lib/utils';
import apiClient from '../../lib/axios';
import { HeartToggle } from '../../components/common/HeartToggle';
import {
  User,
  PawPrint,
  Package,
  Calendar,
  Lock,
  Sliders,
  Check,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Bell,
  Mail,
  Clock,
  Star,
  Stethoscope,
  MapPin,
  Phone,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Heart,
  Minus,
  FileText,
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface PetItem {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  imageUrl?: string;
  medicalNotes?: string;
}

interface OrderLineItem {
  id?: number;
  productId?: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  price?: number;
  priceAtPurchase?: number;
  totalPrice?: number;
}

interface OrderItem {
  id: number;
  customerId?: number;
  customerName?: string;
  orderNumber?: string;
  totalAmount: number;
  status?: string;
  orderStatus?: string;
  paymentStatus?: string;
  shippingAddress?: string;
  createdAt?: string;
  items: OrderLineItem[];
}

interface AppointmentItem {
  id: number;
  vetName?: string;
  serviceName?: string;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  dateTime?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  createdAt?: string;
}

interface VetDoctorItem {
  id: number;
  name: string;
  fullName?: string;
  specialization: string;
  secondarySpecialization?: string;
  city?: string;
  consultationFee?: number;
  experienceYears?: number;
}

interface CartItemData {
  id: number;
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  stockQuantity?: number;
}

interface ArticleItem {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  petType?: string;
  isFeatured?: boolean;
  publishedAt?: string;
}

const getRelativeTimeString = (dateStr?: string): string => {
  if (!dateStr) return 'Just now';
  const now = new Date().getTime();
  const past = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - past) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

export const ProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'overview';
  const { user } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. User Profile State (Overview & Settings)
  const [userProfile, setUserProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [formProfile, setFormProfile] = useState(userProfile);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await apiClient.get('/customer/profile');
      if (res.data) {
        setUserProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
        setFormProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
      }
    } catch {
      if (user) {
        setUserProfile((prev) => ({ ...prev, name: user.name, email: user.email }));
        setFormProfile((prev) => ({ ...prev, name: user.name, email: user.email }));
      }
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    setIsProfileDirty(
      formProfile.name !== userProfile.name ||
        formProfile.email !== userProfile.email ||
        formProfile.phone !== userProfile.phone ||
        formProfile.address !== userProfile.address
    );
  }, [formProfile, userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formProfile.phone) {
      const cleanPhone = formProfile.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        showToast('Phone number must be exactly 10 digits.', 'error');
        return;
      }
    }

    setProfileSaving(true);
    try {
      const cleanPhone = formProfile.phone ? formProfile.phone.replace(/\D/g, '') : '';
      const res = await apiClient.put('/customer/profile', {
        ...formProfile,
        phone: cleanPhone,
      });
      setUserProfile({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone || '',
        address: res.data.address || '',
      });
      setIsProfileDirty(false);
      showToast('Profile updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      showToast(msg, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // 2. Pets State
  const [pets, setPets] = useState<PetItem[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState<string | null>(null);

  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [petFormData, setPetFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: 1,
    medicalNotes: '',
  });
  const [petSubmitting, setPetSubmitting] = useState(false);
  const [petToDelete, setPetToDelete] = useState<number | null>(null);
  const [petDeleting, setPetDeleting] = useState(false);

  const fetchPets = useCallback(async () => {
    setPetsLoading(true);
    setPetsError(null);
    try {
      const res = await apiClient.get<PetItem[]>('/customer/pets');
      setPets(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load pets.';
      setPetsError(msg);
    } finally {
      setPetsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petFormData.name.trim()) return;

    setPetSubmitting(true);
    try {
      const payload = {
        name: petFormData.name,
        species: petFormData.species,
        breed: petFormData.breed,
        age: Number(petFormData.age),
        medicalNotes: petFormData.medicalNotes,
      };

      if (editingPetId) {
        const res = await apiClient.put<PetItem>(`/customer/pets/${editingPetId}`, payload);
        setPets((prev) => prev.map((p) => (p.id === editingPetId ? res.data : p)));
        showToast('Pet profile updated!');
      } else {
        const res = await apiClient.post<PetItem>('/customer/pets', payload);
        setPets((prev) => [...prev, res.data]);
        showToast('New pet registered!');
      }

      setPetFormData({ name: '', species: 'Dog', breed: '', age: 1, medicalNotes: '' });
      setEditingPetId(null);
      setIsAddPetModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save pet.';
      showToast(msg, 'error');
    } finally {
      setPetSubmitting(false);
    }
  };

  const handleRemovePetConfirm = async (id: number) => {
    setPetDeleting(true);
    setPets((prev) => prev.filter((p) => p.id !== id));
    setPetToDelete(null);
    try {
      await apiClient.delete(`/customer/pets/${id}`);
      showToast('Pet removed from profile.');
    } catch (err: unknown) {
      fetchPets();
      const msg = err instanceof Error ? err.message : 'Failed to remove pet.';
      showToast(msg, 'error');
    } finally {
      setPetDeleting(false);
    }
  };

  // 3. Orders State
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await apiClient.get<OrderItem[]>('/customer/orders');
      setOrders(res.data || []);
      if (res.data && res.data.length > 0) {
        setExpandedOrderId(res.data[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load order history.';
      setOrdersError(msg);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const handleCancelOrderConfirm = async (orderId: number) => {
    setCancellingOrder(true);
    try {
      const res = await apiClient.patch<OrderItem>(`/customer/orders/${orderId}/cancel`);
      const newStatus = res.data?.orderStatus || 'CANCELLED';
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, orderStatus: newStatus }
            : o
        )
      );
      showToast(`Order #${orderId} has been cancelled successfully.`);
      setOrderToCancel(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel order.';
      showToast(msg, 'error');
    } finally {
      setCancellingOrder(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'orders' || currentTab === 'overview') {
      fetchOrders();
    }
  }, [currentTab, fetchOrders]);

  // 4. Appointments State
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState(false);

  // Booking Modal State (In Profile)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [vetsList, setVetsList] = useState<VetDoctorItem[]>([]);
  const [servicesList, setServicesList] = useState<{ id: number; name: string; description?: string }[]>([]);
  const [selectedVetId, setSelectedVetId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState(() =>
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [petNameInput, setPetNameInput] = useState('');
  const [bookingNotesInput, setBookingNotesInput] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingErrorMsg, setBookingErrorMsg] = useState<string | null>(null);

  const convertTimeTo24h = (timeStr: string): string => {
    if (!timeStr) return '10:00:00';
    const parts = timeStr.trim().split(' ');
    if (parts.length === 2) {
      const [time, modifier] = parts;
      const [hours, minutes] = time.split(':');
      let h = parseInt(hours, 10);
      if (modifier.toUpperCase() === 'PM' && h < 12) {
        h += 12;
      }
      if (modifier.toUpperCase() === 'AM' && h === 12) {
        h = 0;
      }
      const hStr = h < 10 ? `0${h}` : `${h}`;
      return `${hStr}:${minutes || '00'}:00`;
    }
    if (timeStr.includes(':')) {
      const [h, m] = timeStr.split(':');
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
    }
    return '10:00:00';
  };

  const formatAptDateTime = (apt: AppointmentItem) => {
    if (apt.dateTime) {
      try {
        const d = new Date(apt.dateTime);
        if (!isNaN(d.getTime())) {
          return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          };
        }
      } catch {
        // fallback
      }
    }
    return {
      date: apt.appointmentDate || 'Upcoming Date',
      time: apt.appointmentTime || '',
    };
  };

  const fetchVetsList = useCallback(async () => {
    try {
      const res = await apiClient.get<VetDoctorItem[]>('/vets');
      setVetsList(res.data || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchServicesList = useCallback(async () => {
    try {
      const res = await apiClient.get<{ id: number; name: string; description?: string }[]>('/services');
      const list = res.data || [];
      setServicesList(list);
      if (list.length > 0 && !selectedServiceId) {
        setSelectedServiceId(list[0].id);
      }
    } catch {
      // ignore
    }
  }, [selectedServiceId]);

  const fetchAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    try {
      const res = await apiClient.get<AppointmentItem[]>('/customer/appointments');
      setAppointments(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load appointments.';
      setAppointmentsError(msg);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentTab === 'appointments' || currentTab === 'overview') {
      fetchAppointments();
      fetchVetsList();
      fetchServicesList();
      fetchPets();
    }
  }, [currentTab, fetchAppointments, fetchVetsList, fetchServicesList, fetchPets]);

  useEffect(() => {
    if (pets.length > 0 && (!selectedPetId || !pets.find((p) => p.id === selectedPetId))) {
      setSelectedPetId(pets[0].id);
      if (pets[0].name) setPetNameInput(pets[0].name);
    }
  }, [pets, selectedPetId]);

  useEffect(() => {
    const vetIdParam = searchParams.get('vetId');
    const bookParam = searchParams.get('book');
    if (currentTab === 'appointments' && (vetIdParam || bookParam === 'true')) {
      setIsBookingModalOpen(true);
      fetchVetsList();
      fetchServicesList();
      fetchPets();
      if (vetIdParam) {
        setSelectedVetId(Number(vetIdParam));
      }
    }
  }, [currentTab, searchParams, fetchVetsList, fetchServicesList, fetchPets]);

  const handleConfirmNewAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVetId) {
      setBookingErrorMsg('Please select a veterinarian.');
      return;
    }

    const petIdToUse = selectedPetId || (pets.length > 0 ? pets[0].id : null);
    if (!petIdToUse) {
      setBookingErrorMsg('No registered pet selected. Please add a pet under "My Pets" tab first.');
      return;
    }

    setBookingSubmitting(true);
    setBookingErrorMsg(null);

    try {
      const time24 = convertTimeTo24h(bookingTime);
      const isoDateTime = `${bookingDate}T${time24}`;

      await apiClient.post('/customer/appointments', {
        petId: petIdToUse,
        vetId: selectedVetId,
        serviceId: selectedServiceId || (servicesList[0]?.id || 1),
        dateTime: isoDateTime,
      });

      showToast('Appointment booked successfully!');
      window.dispatchEvent(new Event('admin-notifications-updated'));
      setIsBookingModalOpen(false);
      setBookingNotesInput('');
      fetchAppointments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to confirm appointment. Please try again.';
      setBookingErrorMsg(msg);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCancelAppointmentConfirm = async (id: number) => {
    setCancellingAppointment(true);
    try {
      const res = await apiClient.put<AppointmentItem>(`/customer/appointments/${id}/cancel`);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: res.data.status || 'CANCELLED' } : apt))
      );
      setAppointmentToCancel(null);
      showToast('Appointment cancelled successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel appointment.';
      showToast(msg, 'error');
    } finally {
      setCancellingAppointment(false);
    }
  };

  // 4b. Notifications & Reviews State
  const [notifications, setNotifications] = useState<{ id: number; customerId: number; type: string; title: string; message: string; relatedEntityId?: number; isRead: boolean; createdAt?: string }[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [userReviews, setUserReviews] = useState<{ id: number; appointmentId: number; vetId: number; rating: number; reviewText?: string; createdAt?: string }[]>([]);
  const [reviewModalApt, setReviewModalApt] = useState<AppointmentItem | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleOpenReviewModal = (apt: AppointmentItem) => {
    setReviewModalApt(apt);
    setReviewRating(5);
    setReviewText('');
  };

  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const res = await apiClient.get('/customer/notifications');
      setNotifications(res.data || []);
    } catch {
      // ignore
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiClient.patch(`/customer/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      // ignore
    }
  };

  const handleDeleteNotification = async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiClient.delete(`/customer/notifications/${id}`);
      showToast('Notification removed.');
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      fetchNotifications();
      showToast('Failed to delete notification.', 'error');
    }
  };

  const fetchUserReviews = useCallback(async () => {
    try {
      const res = await apiClient.get('/customer/reviews');
      setUserReviews(res.data || []);
    } catch {
      // ignore
    }
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalApt) return;
    setReviewSubmitting(true);
    try {
      const res = await apiClient.post('/customer/reviews', {
        appointmentId: reviewModalApt.id,
        rating: reviewRating,
        reviewText: reviewText.trim() || undefined,
      });
      setUserReviews((prev) => [...prev, res.data]);
      showToast('Thank you for rating your appointment!');
      setReviewModalApt(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review.';
      showToast(msg, 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'notifications' || currentTab === 'overview') {
      fetchNotifications();
    }
    if (currentTab === 'appointments' || currentTab === 'overview') {
      fetchUserReviews();
    }
  }, [currentTab, fetchNotifications, fetchUserReviews]);

  // 5. Wishlist State
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    setWishlistLoading(true);
    setWishlistError(null);
    try {
      const res = await apiClient.get<WishlistItem[]>('/customer/wishlist');
      setWishlistItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentTab === 'wishlist' || currentTab === 'overview') {
      fetchWishlist();
    }
  }, [currentTab, fetchWishlist]);

  useEffect(() => {
    const handleWishlistUpdate = () => {
      fetchWishlist();
    };
    window.addEventListener('wishlist-ids-updated', handleWishlistUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlist-ids-updated', handleWishlistUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, [fetchWishlist]);

  // 6. Articles State (Recommended Health Tips)
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setArticlesLoading(true);
    setArticlesError(null);
    try {
      const res = await apiClient.get<ArticleItem[]>('/articles');
      setArticles(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load health tips.';
      setArticlesError(msg);
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentTab === 'overview') {
      fetchArticles();
    }
  }, [currentTab, fetchArticles]);

  // 7. Security State (Change Password)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const isPasswordLengthValid = newPassword.length >= 8;
  const isPasswordMatching = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmitPassword = currentPassword.length > 0 && isPasswordLengthValid && isPasswordMatching;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitPassword) return;

    setPasswordSubmitting(true);
    try {
      await apiClient.post('/customer/change-password', {
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully! 🔒');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password. Please check your current password.';
      showToast(msg, 'error');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // 8. Preferences State
  interface NotificationPreferenceData {
    newsletter: boolean;
    appointmentReminders: boolean;
    orderUpdates: boolean;
    healthAlerts: boolean;
  }

  const [preferences, setPreferences] = useState<NotificationPreferenceData>({
    newsletter: true,
    appointmentReminders: true,
    orderUpdates: true,
    healthAlerts: true,
  });
  const [togglingPreference, setTogglingPreference] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await apiClient.get<NotificationPreferenceData>('/customer/preferences');
      if (res.data) {
        setPreferences({
          newsletter: res.data.newsletter ?? true,
          appointmentReminders: res.data.appointmentReminders ?? true,
          orderUpdates: res.data.orderUpdates ?? true,
          healthAlerts: res.data.healthAlerts ?? true,
        });
      }
    } catch {
      // Use defaults if fetch fails
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleTogglePreference = async (key: keyof NotificationPreferenceData) => {
    if (key === 'healthAlerts') {
      showToast('Health & Vaccination Alerts coming soon!', 'error');
      return;
    }
    if (togglingPreference) return;

    const prevValue = preferences[key];
    const newValue = !prevValue;
    setPreferences((prev) => ({ ...prev, [key]: newValue }));
    setTogglingPreference(key);

    try {
      await apiClient.put('/customer/preferences', { [key]: newValue });
      showToast('Preferences updated.');
    } catch (err: unknown) {
      setPreferences((prev) => ({ ...prev, [key]: prevValue }));
      const msg = err instanceof Error ? err.message : 'Failed to update preferences.';
      showToast(msg, 'error');
    } finally {
      setTogglingPreference(null);
    }
  };

  // Cart State (In Profile)
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchCartItems = useCallback(async () => {
    setCartLoading(true);
    setCartError(null);
    try {
      const res = await apiClient.get<CartItemData[]>('/customer/cart');
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load cart.';
      setCartError(msg);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentTab === 'cart' || currentTab === 'overview') {
      fetchCartItems();
    }
  }, [currentTab, fetchCartItems]);

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartItems();
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [fetchCartItems]);

  const handleUpdateCartQuantity = async (itemId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item)));
    try {
      const res = await apiClient.put<CartItemData>(`/customer/cart/${itemId}?quantity=${newQty}`);
      setCartItems((prev) => prev.map((item) => (item.id === itemId ? res.data : item)));
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      fetchCartItems();
      showToast('Failed to update quantity.', 'error');
    }
  };

  const handleRemoveCartItem = async (itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    try {
      await apiClient.delete(`/customer/cart/${itemId}`);
      showToast('Item removed from cart.');
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      fetchCartItems();
      showToast('Failed to remove item.', 'error');
    }
  };

  const handleClearCart = async () => {
    setCartItems([]);
    try {
      await apiClient.delete('/customer/cart');
      showToast('Cart cleared.');
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      fetchCartItems();
      showToast('Failed to clear cart.', 'error');
    }
  };

  const handleCheckoutCart = async () => {
    if (cartItems.length === 0) return;
    setCheckoutLoading(true);
    try {
      await apiClient.post('/customer/orders/checkout');
      setCartItems([]);
      showToast('Order placed successfully! 🎉');
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('admin-notifications-updated'));
      fetchOrders();
      setSearchParams({ tab: 'orders' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };



  const navTabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'pets', label: 'My Pets', icon: PawPrint },
    { id: 'cart', label: 'My Cart', icon: ShoppingBag },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  const getStatusBadge = (status?: string) => {
    if (!status) return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    const s = status.toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') {
      return 'bg-[#E6F9EC] text-[#009E66] border-[#C3ECD0]';
    } else if (s === 'READY_FOR_PICKUP' || s === 'SHIPPED' || s === 'PROCESSING') {
      return 'bg-[#FFF0E6] text-[#EF7C3C] border-[#FED7AA]';
    } else if (s === 'PLACED') {
      return 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]';
    } else if (s === 'CANCELLED') {
      return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
    }
    return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
  };

  const getAptStatusBadge = (status: AppointmentItem['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-[#E6F9EC] text-[#009E66] border-[#C3ECD0]';
      case 'PENDING':
        return 'bg-[#FEF9C3] text-[#B45309] border-[#FDE047]';
      case 'COMPLETED':
        return 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]';
      case 'CANCELLED':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      default:
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

  // Card summary calculations
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  const activeOrders = orders.filter((o) => {
    const st = (o.orderStatus || o.status || '').toUpperCase();
    return st !== 'COMPLETED' && st !== 'DELIVERED' && st !== 'CANCELLED';
  });
  const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;

  // Recent Prescriptions calculation
  const appointmentsWithPrescriptions = appointments.filter(
    (a) => (a.prescription && a.prescription.trim() !== '') || (a.diagnosis && a.diagnosis.trim() !== '')
  );
  const recentPrescriptions = appointmentsWithPrescriptions.slice(0, 4);

  // Recommended Health Tips calculation — strictly filtered by customer's pet species
  const userPetSpeciesList = pets.map((p) => (p.species || '').trim().toLowerCase()).filter(Boolean);

  const isSpeciesMatch = (articlePetType?: string, speciesList: string[] = []): boolean => {
    if (!speciesList || speciesList.length === 0) return true;
    const type = (articlePetType || '').trim().toLowerCase();
    if (!type || type === 'all' || type === 'general' || type === 'both' || type === 'pets') {
      return true;
    }

    return speciesList.some((species) => {
      const s = species.trim().toLowerCase();
      if (s.startsWith('dog') || s === 'canine') {
        return type.startsWith('dog') || type === 'canine';
      }
      if (s.startsWith('cat') || s === 'feline') {
        return type.startsWith('cat') || type === 'feline';
      }
      return type.includes(s) || s.includes(type);
    });
  };

  const recommendedArticles = articles
    .filter((a) => isSpeciesMatch(a.petType, userPetSpeciesList))
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen lg:h-screen bg-white text-[#16241B] font-sans flex flex-col lg:overflow-hidden">
      {/* 1. Navbar */}
      <Navbar activePage="profile" />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 transition-all ${
            toastType === 'success' ? 'bg-[#16241B] text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toastType === 'success' ? (
            <Check className="w-4 h-4 text-[#009E66]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:h-[calc(100vh-80px)] lg:flex lg:flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch lg:h-full lg:min-h-0">
          {/* =========================================================================
              LEFT SIDEBAR CARD
              ========================================================================= */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#009E66]/20 shadow-[0_10px_35px_rgba(0,158,102,0.12)] relative flex flex-col justify-between overflow-hidden lg:h-full lg:min-h-0">
            <div className="space-y-4 z-10">
              {/* Profile Summary Header with Paw Avatar Badge */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-[#E8E4D8]">
                <div className="w-12 h-12 rounded-full bg-[#E6F9EC] border border-[#C3ECD0] flex items-center justify-center text-[#009E66] shrink-0 shadow-2xs">
                  <PawPrint className="w-6 h-6 fill-[#009E66] text-[#009E66]" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-base font-black text-[#16241B] truncate tracking-tight font-sans">
                    {userProfile.name || 'Pawfectly Member'}
                  </h2>
                  <p className="text-xs text-[#556658] font-medium truncate mt-0.5 font-sans">
                    {userProfile.email || 'user@pawfectly.com'}
                  </p>
                </div>
              </div>

              {/* Vertical Navigation List */}
              <nav className="space-y-1">
                {navTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = currentTab === tab.id || (tab.id === 'settings' && (currentTab === 'security' || currentTab === 'preferences'));
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSearchParams({ tab: tab.id })}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer font-sans ${
                        isActive
                          ? 'bg-[#009E66] text-white shadow-xs'
                          : 'text-[#16241B]/85 hover:bg-[#E6F9EC]/50 hover:text-[#009E66]'
                      }`}
                    >
                      <TabIcon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-[#556658]'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Linework Pet Illustration */}
            <div className="pt-2 z-0 pointer-events-none flex justify-start items-end -mb-5 -ml-1">
              <img
                src={getCloudinaryImageUrl('profile_dog_cat_watermark')}
                alt="Dog & Cat Linework Illustration"
                className="w-full max-w-[250px] sm:max-w-[270px] xl:max-w-[290px] h-auto object-contain mix-blend-multiply opacity-95"
              />
            </div>
          </aside>

          {/* =========================================================================
              RIGHT MAIN CARD (Active Tab)
              ========================================================================= */}
          <section className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-7 border border-[#009E66]/20 shadow-[0_10px_35px_rgba(0,158,102,0.12)] lg:h-full lg:min-h-0 overflow-y-auto">
            {/* 1. OVERVIEW TAB */}
            {currentTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#16241B] font-sans tracking-tight">
                    Account Overview
                  </h1>
                  <p className="text-xs sm:text-sm text-[#556658] font-medium font-sans mt-1">
                    Quick snapshot of your upcoming appointments, active orders, registered pets, and saved items.
                  </p>
                </div>

                {/* Dashboard 4 Summary Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1 — Next Appointment */}
                  <div
                    onClick={() => setSearchParams({ tab: 'appointments' })}
                    className="bg-[#EFF8F0] border border-[#D5EAD9] hover:border-[#009E66]/50 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between min-h-[110px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wider text-[#009E66] uppercase">
                        NEXT APPOINTMENT
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/90 border border-[#C3ECD0] flex items-center justify-center text-[#009E66] shadow-2xs group-hover:scale-105 transition-transform">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="mt-3 space-y-0.5">
                      {appointmentsLoading ? (
                        <>
                          <Skeleton className="h-4 w-28 bg-[#D5EAD9]" />
                          <Skeleton className="h-3 w-20 mt-1 bg-[#D5EAD9]" />
                        </>
                      ) : appointmentsError ? (
                        <>
                          <p className="text-xs font-bold text-red-600 truncate">Failed to load</p>
                          <p className="text-[11px] text-[#556658] truncate">Tap to check</p>
                        </>
                      ) : nextAppointment ? (
                        <>
                          <p className="text-sm font-semibold text-[#16241B] truncate">
                            {nextAppointment.vetName || 'Assigned Veterinarian'}
                          </p>
                          <p className="text-xs font-normal text-[#556658] truncate">
                            {(() => {
                              const { date, time } = formatAptDateTime(nextAppointment);
                              return `${date}${time ? ` at ${time}` : ''}`;
                            })()}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-[#16241B] truncate">No upcoming appointments</p>
                          <p className="text-xs font-normal text-[#556658] truncate">Book one with a vet</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card 2 — Active Order */}
                  <div
                    onClick={() => setSearchParams({ tab: 'orders' })}
                    className="bg-[#FFF5EE] border border-[#FED7AA] hover:border-[#EF7C3C]/50 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between min-h-[110px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wider text-[#EF7C3C] uppercase">
                        ACTIVE ORDER
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/90 border border-[#FED7AA] flex items-center justify-center text-[#EF7C3C] shadow-2xs group-hover:scale-105 transition-transform">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="mt-3 space-y-0.5">
                      {ordersLoading ? (
                        <>
                          <Skeleton className="h-4 w-28 bg-[#FED7AA]" />
                          <Skeleton className="h-3 w-20 mt-1 bg-[#FED7AA]" />
                        </>
                      ) : ordersError ? (
                        <>
                          <p className="text-xs font-bold text-red-600 truncate">Failed to load</p>
                          <p className="text-[11px] text-[#556658] truncate">Tap to check</p>
                        </>
                      ) : activeOrder ? (
                        <>
                          <p className="text-sm font-semibold text-[#16241B] truncate">
                            Order {activeOrder.orderStatus ? activeOrder.orderStatus.replace(/_/g, ' ') : (activeOrder.status || 'Placed')}
                          </p>
                          <p className="text-xs font-normal text-[#556658] truncate">
                            {activeOrder.orderNumber || `Order #${activeOrder.id}`}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-[#16241B] truncate">No active orders</p>
                          <p className="text-xs font-normal text-[#556658] truncate">Browse the pharmacy</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card 3 — Your Pets */}
                  <div
                    onClick={() => setSearchParams({ tab: 'pets' })}
                    className="bg-[#EEF2FF] border border-[#C7D2FE] hover:border-[#3B82F6]/50 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between min-h-[110px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wider text-[#3B82F6] uppercase">
                        YOUR PETS
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/90 border border-[#BFDBFE] flex items-center justify-center text-[#3B82F6] shadow-2xs group-hover:scale-105 transition-transform">
                        <PawPrint className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="mt-3 space-y-0.5">
                      {petsLoading ? (
                        <>
                          <Skeleton className="h-4 w-28 bg-[#C7D2FE]" />
                          <Skeleton className="h-3 w-20 mt-1 bg-[#C7D2FE]" />
                        </>
                      ) : petsError ? (
                        <>
                          <p className="text-xs font-bold text-red-600 truncate">Failed to load</p>
                          <p className="text-[11px] text-[#556658] truncate">Tap to check</p>
                        </>
                      ) : pets.length > 0 ? (
                        <>
                          <p className="text-sm font-semibold text-[#16241B] truncate">
                            {pets.length} {pets.length === 1 ? 'pet registered' : 'pets registered'}
                          </p>
                          <p className="text-xs font-normal text-[#556658] truncate">
                            {pets.map((p) => p.name).join(', ')}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-[#16241B] truncate">No pets added yet</p>
                          <p className="text-xs font-normal text-[#556658] truncate">Add your first pet</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card 4 — Wishlist */}
                  <div
                    onClick={() => setSearchParams({ tab: 'wishlist' })}
                    className="bg-[#FFF0F5] border border-[#FBCFE8] hover:border-[#EC4899]/50 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between min-h-[110px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wider text-[#EC4899] uppercase">
                        WISHLIST
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/90 border border-[#F9A8D4] flex items-center justify-center text-[#EC4899] shadow-2xs group-hover:scale-105 transition-transform">
                        <Heart className="w-3.5 h-3.5 fill-[#EC4899] text-[#EC4899]" />
                      </div>
                    </div>

                    <div className="mt-3 space-y-0.5">
                      {wishlistItems.length > 0 ? (
                        <>
                          <p className="text-sm font-semibold text-[#16241B] truncate">
                            {wishlistItems.length} {wishlistItems.length === 1 ? 'item saved' : 'items saved'}
                          </p>
                          <p className="text-xs font-normal text-[#556658] truncate">
                            {wishlistItems.map((i) => i.name).join(', ')}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-[#16241B] truncate">No items saved</p>
                          <p className="text-xs font-normal text-[#556658] truncate">Browse the pharmacy</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>


                {/* RECENT PRESCRIPTIONS SECTION */}
                <div className="space-y-4 pt-4 border-t border-[#E8E4D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-[#16241B] flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-[#009E66]" />
                        <span>Recent Prescriptions</span>
                      </h2>
                      <p className="text-xs text-[#556658] font-normal mt-0.5">
                        Clinical instructions & medical prescriptions issued by your veterinarians.
                      </p>
                    </div>
                  </div>

                  {appointmentsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-20 rounded-2xl" />
                      <Skeleton className="h-20 rounded-2xl" />
                    </div>
                  ) : appointmentsError ? (
                    <ErrorState
                      title="Could not load prescriptions"
                      description={appointmentsError}
                      onRetry={fetchAppointments}
                    />
                  ) : recentPrescriptions.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="No Prescriptions Yet"
                      description="Prescriptions, treatment plans, and medical records from your completed vet visits will appear here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentPrescriptions.map((apt) => {
                        const { date } = formatAptDateTime(apt);
                        return (
                          <div
                            key={apt.id}
                            className="bg-[#F8F6F0] rounded-2xl p-4 sm:p-5 border border-[#EAE3D4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F9EC] text-[#009E66] text-[11px] font-semibold border border-[#C3ECD0]">
                                  {apt.petName || 'Pet'}
                                </span>
                                <span className="text-xs text-[#88998C] font-normal">
                                  • {date}
                                </span>
                              </div>

                              {apt.prescription && (
                                <p className="text-sm font-medium text-[#16241B] whitespace-pre-line">
                                  {apt.prescription}
                                </p>
                              )}

                              {apt.diagnosis && (
                                <p className="text-xs font-normal text-[#556658]">
                                  <span className="font-semibold text-[#16241B]">Diagnosis:</span> {apt.diagnosis}
                                </p>
                              )}

                              <p className="text-xs text-[#88998C] font-normal">
                                Prescribed by <span className="font-semibold text-[#16241B]">{apt.vetName || 'Veterinarian'}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* RECOMMENDED HEALTH TIPS SECTION */}
                <div className="space-y-4 pt-4 border-t border-[#E8E4D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-[#16241B] flex items-center gap-2">
                        <BookOpen className="w-4.5 h-4.5 text-[#009E66]" />
                        <span>
                          {pets.length > 0
                            ? `Health Tips for ${pets.map((p) => p.name).join(' & ')}`
                            : 'Recommended Health Tips'}
                        </span>
                      </h2>
                      <p className="text-xs text-[#556658] font-normal mt-0.5">
                        Veterinary articles and wellness guides curated for your companion animals.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const petSpecies = pets.length > 0 && pets[0].species ? `?petType=${encodeURIComponent(pets[0].species)}` : '';
                        navigate(`/health-tips/by-pet-type${petSpecies}`);
                      }}
                      className="text-xs font-bold text-[#009E66] hover:text-[#EF7C3C] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <span>View All</span>
                    </button>
                  </div>

                  {articlesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Skeleton className="h-40 rounded-2xl" />
                      <Skeleton className="h-40 rounded-2xl" />
                    </div>
                  ) : articlesError ? (
                    <ErrorState
                      title="Could not load health tips"
                      description={articlesError}
                      onRetry={fetchArticles}
                    />
                  ) : recommendedArticles.length === 0 ? (
                    <EmptyState
                      icon={BookOpen}
                      title="No Health Tips Found"
                      description="Explore our complete pet care knowledge base for expert guides and medical tips."
                      actionLabel="Explore Health Tips"
                      actionLink="/health-tips"
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendedArticles.map((article) => (
                        <div
                          key={article.id}
                          onClick={() => navigate(`/health-tips/${article.id}`)}
                          className="bg-[#F8F6F0] rounded-2xl p-4 border border-[#EAE3D4] hover:border-[#009E66]/40 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
                        >
                          <div className="space-y-2">
                            {article.imageUrl && (
                              <div className="h-32 rounded-xl overflow-hidden bg-white border border-[#E5DFCE] mb-3">
                                <img
                                  src={getArticleImageUrl(article.title, article.imageUrl)}
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              {article.petType && (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F9EC] text-[#009E66] text-[10px] font-semibold uppercase border border-[#CBDAC6]">
                                  {article.petType}
                                </span>
                              )}
                              {article.isFeatured && (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#EF7C3C] text-[10px] font-semibold uppercase border border-[#FED7AA]">
                                  Featured
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-semibold text-[#16241B] group-hover:text-[#009E66] transition-colors line-clamp-2">
                              {article.title}
                            </h3>

                            {article.content && (
                              <p className="text-xs text-[#556658] line-clamp-2 font-normal">
                                {article.content.replace(/<[^>]*>?/gm, '')}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-[#EAE3D4] mt-3 flex items-center justify-between text-xs font-semibold text-[#009E66] group-hover:text-[#EF7C3C] transition-colors">
                            <span>Read Article</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MY CART TAB */}
            {currentTab === 'cart' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight">My Shopping Cart</h1>
                    <p className="text-xs sm:text-sm text-[#67796B] font-normal mt-1">
                      Review selected pharmacy items and proceed to instant checkout.
                    </p>
                  </div>
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                {cartLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                  </div>
                )}

                {cartError && !cartLoading && (
                  <ErrorState
                    title="Could not load your cart"
                    description={cartError}
                    onRetry={fetchCartItems}
                  />
                )}

                {!cartLoading && !cartError && cartItems.length === 0 && (
                  <EmptyState
                    icon={ShoppingBag}
                    title="Your Cart is Empty"
                    description="Browse our verified pet pharmacy for food, toys, supplements, and health essentials."
                    actionLabel="Pharmacy"
                    actionLink="/pharmacy#popular-products"
                    secondaryActionLabel="Paw Store"
                    secondaryActionLink="/pet-essentials"
                  />
                )}

                {!cartLoading && !cartError && cartItems.length > 0 && (
                  <div className="space-y-6">
                    <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {cartItems.map((item) => {
                          const itemTotal = (item.price || 0) * (item.quantity || 1);
                          const thumbUrl = getProductImageUrl(item.productName, item.imageUrl, item.productId);
                          return (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, y: 15, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{
                                opacity: 0,
                                x: -50,
                                scale: 0.92,
                                height: 0,
                                marginBottom: 0,
                                paddingTop: 0,
                                paddingBottom: 0,
                                borderWidth: 0,
                                overflow: 'hidden',
                                transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                              }}
                              transition={{
                                layout: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                                opacity: { duration: 0.2 },
                              }}
                              className="bg-[#F8F6F0] rounded-2xl p-4 border border-[#EAE3D4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-[#D5CCBA]"
                            >
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <img
                                  src={thumbUrl}
                                  alt={item.productName}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white object-contain p-2 border border-[#EAE3D4] shadow-2xs shrink-0"
                                />
                                <div className="min-w-0">
                                  <h3 className="text-sm sm:text-base font-bold text-[#16241B] line-clamp-1">
                                    {item.productName}
                                  </h3>
                                  <p className="text-xs font-semibold text-[#009E66] mt-0.5">
                                    ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}{' '}
                                    <span className="text-[11px] text-[#88998C] font-normal">/ unit</span>
                                  </p>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3FA65C] bg-[#E6F9EC] px-2 py-0.5 rounded-md mt-1.5">
                                    Free In-Store Pickup
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE3D4]/60">
                                <div className="flex items-center gap-1.5 bg-white border border-[#EAE3D4] rounded-xl p-1 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCartQuantity(item.id, item.quantity - 1)}
                                    aria-label="Decrease quantity"
                                    className="w-7 h-7 rounded-lg bg-[#F8F6F0] hover:bg-[#E6F9EC] text-[#16241B] hover:text-[#009E66] flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                                  >
                                    {item.quantity <= 1 ? (
                                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    ) : (
                                      <Minus className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <span className="text-xs font-black text-[#16241B] px-2 min-w-[20px] text-center select-none">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={item.stockQuantity ? item.quantity >= item.stockQuantity : false}
                                    onClick={() => handleUpdateCartQuantity(item.id, item.quantity + 1)}
                                    aria-label="Increase quantity"
                                    className="w-7 h-7 rounded-lg bg-[#F8F6F0] hover:bg-[#E6F9EC] disabled:opacity-40 text-[#16241B] hover:text-[#009E66] flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <span className="text-sm sm:text-base font-black text-[#16241B] min-w-[75px] text-right">
                                  ₹{itemTotal.toLocaleString('en-IN')}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveCartItem(item.id)}
                                  aria-label="Remove item"
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Cart Summary Card */}
                    <div className="bg-[#FAF8F3] rounded-3xl p-6 border border-[#E8E4D8] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-medium text-[#556658]">
                        <span>Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)}):</span>
                        <span className="font-bold text-[#16241B]">
                          ₹{cartItems.reduce((acc, i) => acc + (i.price || 0) * i.quantity, 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium text-[#556658]">
                        <span>Pickup Method:</span>
                        <span className="font-bold text-[#009E66]">Free In-Store Pickup</span>
                      </div>
                      <div className="pt-3 border-t border-[#E8E4D8] flex items-center justify-between text-base font-bold text-[#16241B]">
                        <span>Total Amount:</span>
                        <span className="text-xl font-black text-[#009E66]">
                          ₹{cartItems.reduce((acc, i) => acc + (i.price || 0) * i.quantity, 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="pt-2 space-y-2">
                        <button
                          onClick={handleCheckoutCart}
                          disabled={checkoutLoading}
                          className="w-full py-4 bg-[#009E66] hover:bg-[#008757] text-white font-bold rounded-2xl shadow-lg shadow-[#009E66]/20 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm active:scale-98"
                        >
                          {checkoutLoading ? (
                            <>
                              <Loader2 className="w-4.5 h-4.5 animate-spin" /> Placing Your Order...
                            </>
                          ) : (
                            'Proceed to Checkout'
                          )}
                        </button>
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => navigate('/pharmacy')}
                            className="py-1.5 px-3.5 rounded-full bg-[#16241B] hover:bg-[#253d2e] text-white border border-[#16241B] text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                          >
                            <span>←</span> <span>Pharmacy</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/pet-essentials')}
                            className="py-1.5 px-3.5 rounded-full bg-white hover:bg-[#16241B] text-[#16241B] hover:text-white border border-[#16241B]/20 hover:border-[#16241B] text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                          >
                            <span>Paw Store</span> <span>→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. MY PETS TAB */}
            {currentTab === 'pets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight">My Pets</h1>
                    <p className="text-xs sm:text-sm text-[#67796B] font-normal mt-1">
                      Add, edit, or remove your registered family pets.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingPetId(null);
                      setPetFormData({ name: '', species: 'Dog', breed: '', age: 1, medicalNotes: '' });
                      setIsAddPetModalOpen(true);
                    }}
                    className="px-6 py-3 bg-[#548B60] hover:bg-[#437750] text-white font-semibold rounded-full text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Pet</span>
                  </button>
                </div>

                {/* State: Loading */}
                {petsLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                  </div>
                )}

                {/* State: Error */}
                {petsError && !petsLoading && (
                  <ErrorState
                    title="Could not load your pets"
                    description={petsError}
                    onRetry={fetchPets}
                  />
                )}

                {/* State: Empty */}
                {!petsLoading && !petsError && pets.length === 0 && (
                  <EmptyState
                    icon={PawPrint}
                    title="No Pets Registered Yet"
                    description="Add your companion animals to quickly book appointments and manage their health history."
                  />
                )}

                {/* State: Pets List */}
                {!petsLoading && !petsError && pets.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {pets.map((pet) => (
                        <motion.div
                          key={pet.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
                          className="bg-[#F8F6F0] rounded-2xl p-5 border border-[#EAE3D4] flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-[#E5DFCE] shrink-0">
                              <img
                                src={getPetSpeciesImage(pet.species, pet.imageUrl)}
                                alt={`${pet.name} (${pet.species})`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = getPetSpeciesImage(pet.species);
                                }}
                              />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-[#16241B]">{pet.name}</h3>
                              <p className="text-xs text-[#67796B] font-normal">
                                {pet.breed || pet.species} • {pet.age ?? 0} {(pet.age ?? 0) === 1 ? 'year' : 'years'} old
                              </p>
                              {pet.medicalNotes && (
                                <p className="text-[11px] text-[#88998C] truncate max-w-[150px] mt-0.5 font-normal">
                                  {pet.medicalNotes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingPetId(pet.id);
                                setPetFormData({
                                  name: pet.name,
                                  species: pet.species,
                                  breed: pet.breed || '',
                                  age: pet.age || 1,
                                  medicalNotes: pet.medicalNotes || '',
                                });
                                setIsAddPetModalOpen(true);
                              }}
                              aria-label="Edit pet"
                              className="p-2 rounded-full hover:bg-white text-[#67796B] hover:text-[#548B60] transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setPetToDelete(pet.id)}
                              aria-label="Remove pet"
                              className="p-2 rounded-full hover:bg-white text-[#67796B] hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Remove Confirmation Modal */}
                {petToDelete !== null && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#EDE7D9] shadow-2xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#16241B]">Remove Pet?</h3>
                      <p className="text-xs text-[#67796B] font-normal">
                        Are you sure you want to remove this pet from your profile?
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => setPetToDelete(null)}
                          disabled={petDeleting}
                          className="px-5 py-2.5 rounded-full bg-[#F8F6F0] text-[#16241B] font-medium text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRemovePetConfirm(petToDelete)}
                          disabled={petDeleting}
                          className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          {petDeleting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Removing...
                            </>
                          ) : (
                            'Yes, Remove'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add/Edit Pet Modal */}
                {isAddPetModalOpen && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#EDE7D9] shadow-2xl space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#16241B]">
                          {editingPetId ? 'Edit Pet Profile' : 'Add a New Pet'}
                        </h3>
                        <button
                          onClick={() => setIsAddPetModalOpen(false)}
                          className="p-1.5 rounded-full hover:bg-[#F8F6F0] text-[#88998C] hover:text-[#16241B]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSavePet} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#16241B] mb-1.5">
                            Pet Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Milo"
                            value={petFormData.name}
                            onChange={(e) => setPetFormData({ ...petFormData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-full bg-[#F8F6F0] border border-[#EAE3D4] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#548B60]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#16241B] mb-1.5">
                              Species
                            </label>
                            <select
                              value={petFormData.species}
                              onChange={(e) => setPetFormData({ ...petFormData, species: e.target.value })}
                              className="w-full px-4 py-3 rounded-full bg-[#F8F6F0] border border-[#EAE3D4] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#548B60]"
                            >
                              <option value="Dog">Dog</option>
                              <option value="Cat">Cat</option>
                              <option value="Rabbit">Rabbit</option>
                              <option value="Bird">Bird</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#16241B] mb-1.5">
                              Age (Years)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              required
                              value={petFormData.age}
                              onChange={(e) => setPetFormData({ ...petFormData, age: Number(e.target.value) })}
                              className="w-full px-4 py-3 rounded-full bg-[#F8F6F0] border border-[#EAE3D4] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#548B60]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#16241B] mb-1.5">
                            Breed
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Golden Retriever"
                            value={petFormData.breed}
                            onChange={(e) => setPetFormData({ ...petFormData, breed: e.target.value })}
                            className="w-full px-4 py-3 rounded-full bg-[#F8F6F0] border border-[#EAE3D4] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#548B60]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#16241B] mb-1.5">
                            Medical Notes / Allergies
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Optional health conditions or notes"
                            value={petFormData.medicalNotes}
                            onChange={(e) => setPetFormData({ ...petFormData, medicalNotes: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl bg-[#F8F6F0] border border-[#EAE3D4] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#548B60]"
                          />
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setIsAddPetModalOpen(false)}
                            className="px-5 py-2.5 rounded-full bg-[#F8F6F0] text-[#16241B] font-medium text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={petSubmitting}
                            className="px-6 py-2.5 rounded-full bg-[#548B60] hover:bg-[#437750] text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            {petSubmitting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                              </>
                            ) : (
                              'Save Pet'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. MY ORDERS TAB */}
            {currentTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight">My Orders</h1>
                  <p className="text-xs sm:text-sm text-[#67796B] font-medium mt-1">
                    Track and review past pet pharmacy purchases.
                  </p>
                </div>

                {ordersLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                  </div>
                )}

                {ordersError && !ordersLoading && (
                  <ErrorState
                    title="Could not load your orders"
                    description={ordersError}
                    onRetry={fetchOrders}
                  />
                )}

                {!ordersLoading && !ordersError && orders.length === 0 && (
                  <EmptyState
                    icon={ShoppingBag}
                    title="No Orders Found"
                    description="Explore our curated pet pharmacy and supply store to get premium supplements, food, and medications."
                    actionLabel="Pharmacy"
                    actionLink="/pharmacy#popular-products"
                    secondaryActionLabel="Paw Store"
                    secondaryActionLink="/pet-essentials"
                  />
                )}

                {!ordersLoading && !ordersError && orders.length > 0 && (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const currentStatus = (order.orderStatus || order.status || 'PLACED').toUpperCase();
                      const isCancellable = currentStatus === 'PLACED' || currentStatus === 'READY_FOR_PICKUP';

                      return (
                        <div
                          key={order.id}
                          className="bg-[#F8F6F0] rounded-2xl p-5 border border-[#EAE3D4] space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[#16241B]">
                                {order.orderNumber || `ORD-${order.id}`}
                              </span>
                              {order.createdAt && (
                                <p className="text-xs text-[#88998C] font-normal">
                                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${getStatusBadge(
                                  currentStatus
                                )}`}
                              >
                                {currentStatus}
                              </span>

                              {isCancellable && (
                                <button
                                  onClick={() => setOrderToCancel(order.id)}
                                  className="px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer shrink-0"
                                >
                                  Cancel Order
                                </button>
                              )}

                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                aria-label="Toggle details"
                                className="p-1.5 rounded-full hover:bg-white text-[#67796B] transition-colors cursor-pointer"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="pt-3 border-t border-[#EAE3D4] space-y-2 text-xs">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => {
                                  const unitPrice = item.priceAtPurchase ?? item.price ?? 0;
                                  return (
                                    <div key={idx} className="flex items-center justify-between text-[#67796B]">
                                      <span>
                                        {item.quantity}x {item.productName}
                                      </span>
                                      <span className="font-normal text-[#16241B]">
                                        ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-[#88998C]">No item details available.</p>
                              )}

                              <div className="flex items-center justify-between pt-2.5 border-t border-[#EAE3D4] mt-2 text-sm font-medium text-[#16241B]">
                                <span>Total Amount:</span>
                                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Cancel Order Confirmation Modal */}
                {orderToCancel !== null && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#EDE7D9] shadow-2xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-[#16241B]">Cancel Order?</h3>
                      <p className="text-xs text-[#67796B] font-normal">
                        Are you sure you want to cancel order #{orderToCancel}? Your order will be directly cancelled and reserved items restored to store inventory.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => setOrderToCancel(null)}
                          disabled={cancellingOrder}
                          className="px-5 py-2.5 rounded-full bg-[#F8F6F0] text-[#16241B] font-medium text-xs cursor-pointer"
                        >
                          Keep Order
                        </button>
                        <button
                          onClick={() => handleCancelOrderConfirm(orderToCancel)}
                          disabled={cancellingOrder}
                          className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          {cancellingOrder ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                            </>
                          ) : (
                            'Yes, Cancel Order'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. MY APPOINTMENTS TAB */}
            {currentTab === 'appointments' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight">My Appointments</h1>
                    <p className="text-xs sm:text-sm text-[#67796B] font-normal mt-1">
                      Manage upcoming veterinary bookings and review past visit history.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      fetchVetsList();
                      if (pets.length > 0 && !petNameInput) {
                        setPetNameInput(pets[0].name);
                      }
                      setIsBookingModalOpen(true);
                    }}
                    className="px-6 py-3 bg-[#009E66] hover:bg-[#008757] text-white font-semibold rounded-full text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Book New Appointment</span>
                  </button>
                </div>

                {appointmentsLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                  </div>
                )}

                {appointmentsError && !appointmentsLoading && (
                  <ErrorState
                    title="Could not load your appointments"
                    description={appointmentsError}
                    onRetry={fetchAppointments}
                  />
                )}

                {!appointmentsLoading && !appointmentsError && (
                  <>
                    {/* Upcoming Appointments */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#16241B] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#548B60]" />
                        <span>Upcoming Visits</span>
                      </h3>

                      {appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING').length === 0 ? (
                        <div className="text-center py-8 bg-[#F8F6F0] rounded-2xl p-4 border border-[#EAE3D4]">
                          <p className="text-xs text-[#67796B] font-normal">No upcoming appointments scheduled.</p>
                        </div>
                      ) : (
                        appointments
                          .filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING')
                          .map((apt) => (
                            <div
                              key={apt.id}
                              className="bg-[#F8F6F0] rounded-2xl p-5 border border-[#EAE3D4] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-medium text-[#16241B]">
                                    {apt.vetName || 'Assigned Veterinarian'}
                                  </h4>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getAptStatusBadge(
                                      apt.status
                                    )}`}
                                  >
                                    {apt.status}
                                  </span>
                                </div>
                                <p className="text-xs font-normal text-[#EF7C3C]">
                                  {apt.serviceName || 'General Consultation'}
                                </p>
                                <p className="text-xs text-[#67796B] font-normal">
                                  {(() => {
                                    const { date, time } = formatAptDateTime(apt);
                                    return `${date}${time ? ` at ${time}` : ''}`;
                                  })()}
                                </p>
                                {apt.petName && (
                                  <p className="text-[11px] text-[#88998C] flex items-center gap-1 font-normal">
                                    <MapPin className="w-3 h-3 text-[#548B60]" /> Pet: {apt.petName}{' '}
                                    {apt.petSpecies ? `(${apt.petSpecies})` : (apt.petBreed ? `(${apt.petBreed})` : '')}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => setAppointmentToCancel(apt.id)}
                                className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer shrink-0"
                              >
                                Cancel Appointment
                              </button>
                            </div>
                          ))
                      )}
                    </div>

                    {/* Past Appointments */}
                    <div className="space-y-4 pt-4 border-t border-[#EAE3D4]">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#16241B] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#88998C]" />
                        <span>Past History</span>
                      </h3>

                      {appointments.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED').length === 0 ? (
                        <p className="text-xs text-[#88998C] italic font-normal">No past appointments recorded.</p>
                      ) : (
                        appointments
                          .filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED')
                          .map((apt) => (
                            <div
                              key={apt.id}
                              className="bg-white rounded-2xl p-4 border border-[#EAE3D4] space-y-3"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="space-y-0.5 text-left">
                                  <h4 className="text-sm font-semibold text-[#16241B]">
                                    {apt.vetName || 'Veterinary Consultation'}
                                  </h4>
                                  <p className="text-xs text-[#67796B] font-normal">
                                    {apt.serviceName || 'Consultation'} • {(() => {
                                      const { date, time } = formatAptDateTime(apt);
                                      return `${date}${time ? ` at ${time}` : ''}`;
                                    })()}
                                  </p>
                                  {apt.petName && (
                                    <p className="text-[11px] text-[#88998C] font-normal">
                                      Patient: <span className="font-semibold text-[#16241B]">{apt.petName}</span>{' '}
                                      {apt.petSpecies ? `(${apt.petSpecies})` : ''}
                                    </p>
                                  )}
                                </div>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getAptStatusBadge(
                                    apt.status
                                  )}`}
                                >
                                  {apt.status}
                                </span>
                              </div>

                              {/* Clinical Medical Record (if added by Doctor/Admin) */}
                              {(apt.diagnosis || apt.prescription || apt.notes) && (
                                <div className="pt-3 border-t border-[#F2ECE0] bg-[#FBF9F4] p-3 rounded-xl space-y-2 text-left">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#009E66]">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Medical Record</span>
                                  </div>
                                  {apt.diagnosis && (
                                    <div>
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#67796B] block">
                                        Diagnosis
                                      </span>
                                      <p className="text-xs font-medium text-[#16241B]">{apt.diagnosis}</p>
                                    </div>
                                  )}
                                  {apt.prescription && (
                                    <div>
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#67796B] block">
                                        Prescription & Treatment
                                      </span>
                                      <p className="text-xs text-[#334437] font-normal whitespace-pre-line">{apt.prescription}</p>
                                    </div>
                                  )}
                                  {apt.notes && (
                                    <div>
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#67796B] block">
                                        Clinical Notes
                                      </span>
                                      <p className="text-xs text-[#556658] italic font-normal">{apt.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Customer Rating & Review Section */}
                              {apt.status === 'COMPLETED' && (
                                <div className="pt-2 border-t border-[#F2ECE0]">
                                  {(() => {
                                    const existingRev = userReviews.find((r) => r.appointmentId === apt.id);
                                    if (existingRev) {
                                      return (
                                        <div className="flex items-center justify-between bg-[#FEFCE8] p-2.5 rounded-xl border border-[#FEF08A] text-xs">
                                          <div className="flex items-center gap-1.5 font-semibold text-[#B45309]">
                                            <Star className="w-4 h-4 fill-current text-[#F5A623]" />
                                            <span>Your Rating: {existingRev.rating} / 5</span>
                                          </div>
                                          {existingRev.reviewText && (
                                            <span className="text-[#556658] italic truncate max-w-[200px] font-normal">
                                              "{existingRev.reviewText}"
                                            </span>
                                          )}
                                          <span className="text-[10px] text-[#88998C] font-normal">Reviewed ✓</span>
                                        </div>
                                      );
                                    }

                                    return (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenReviewModal(apt)}
                                        className="px-3.5 py-1.5 bg-[#FEF9C3] hover:bg-[#FDE047] text-[#B45309] text-xs font-semibold rounded-full border border-[#FDE047] flex items-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span>Rate & Review Visit</span>
                                      </button>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </>
                )}

                {/* Cancel Confirmation Modal */}
                {appointmentToCancel !== null && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#EDE7D9] shadow-2xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#16241B]">Cancel Appointment?</h3>
                      <p className="text-xs text-[#67796B] font-normal">
                        Are you sure you want to cancel this booking?
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => setAppointmentToCancel(null)}
                          disabled={cancellingAppointment}
                          className="px-5 py-2.5 rounded-full bg-[#F8F6F0] text-[#16241B] font-medium text-xs cursor-pointer"
                        >
                          Keep Appointment
                        </button>
                        <button
                          onClick={() => handleCancelAppointmentConfirm(appointmentToCancel)}
                          disabled={cancellingAppointment}
                          className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          {cancellingAppointment ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                            </>
                          ) : (
                            'Yes, Cancel'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Appointment Booking Modal */}
                {isBookingModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#EDE7D9] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={() => setIsBookingModalOpen(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <form onSubmit={handleConfirmNewAppointment} className="space-y-4">
                        <div>
                          <span className="text-xs font-semibold text-[#EF7C3C] uppercase tracking-wider">Book an Appointment</span>
                          <h3 className="text-xl font-semibold text-[#16241B] mt-0.5">Schedule Vet Visit</h3>
                          <p className="text-xs text-[#556658] font-normal">Select your preferred veterinarian and appointment details.</p>
                        </div>

                        {bookingErrorMsg && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                            {bookingErrorMsg}
                          </div>
                        )}

                        {/* Vet Selection */}
                        <div className="space-y-1 text-left">
                          <label className="text-xs font-semibold text-[#334437]">Select Veterinarian</label>
                          <select
                            required
                            value={selectedVetId || ''}
                            onChange={(e) => setSelectedVetId(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#E5DFCE] rounded-xl text-xs font-medium text-[#16241B] focus:outline-none focus:border-[#3FA65C]"
                          >
                            <option value="">-- Choose a Veterinarian --</option>
                            {vetsList.map((vet) => (
                              <option key={vet.id} value={vet.id}>
                                {vet.name || vet.fullName} ({vet.specialization} - {formatCurrency(vet.consultationFee ?? 50)})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Service Selection */}
                        <div className="space-y-1 text-left">
                          <label className="text-xs font-semibold text-[#334437]">Select Service</label>
                          <select
                            required
                            value={selectedServiceId || (servicesList[0]?.id || '')}
                            onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#E5DFCE] rounded-xl text-xs font-medium text-[#16241B] focus:outline-none focus:border-[#3FA65C]"
                          >
                            {servicesList.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Pet Selection */}
                        <div className="space-y-1 text-left">
                          <label className="text-xs font-semibold text-[#334437]">Pet Selection</label>
                          {petsLoading ? (
                            <div className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#E5DFCE] rounded-xl text-xs font-medium text-[#67796B] flex items-center gap-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#009E66]" /> Loading your pets...
                            </div>
                          ) : pets.length > 0 ? (
                            <select
                              value={selectedPetId ?? pets[0]?.id ?? ''}
                              onChange={(e) => setSelectedPetId(Number(e.target.value))}
                              className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#E5DFCE] rounded-xl text-xs font-medium text-[#16241B] focus:outline-none focus:border-[#3FA65C] cursor-pointer"
                            >
                              {pets.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.species}{p.breed ? ` - ${p.breed}` : ''})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="p-3 bg-[#FAF6EE] border border-[#E5DFCE] rounded-xl text-xs text-[#556658]">
                              No registered pets found. Please{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsBookingModalOpen(false);
                                  setSearchParams({ tab: 'pets' });
                                }}
                                className="text-[#009E66] font-semibold underline cursor-pointer"
                              >
                                add a pet under 'My Pets' tab
                              </button>{' '}
                              first.
                            </div>
                          )}
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1 text-left">
                            <label className="text-xs font-semibold text-[#334437]">Preferred Date</label>
                            <input
                              type="date"
                              required
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              className="w-full px-3 py-2.5 bg-[#FAF6EE] border border-[#E5DFCE] rounded-xl text-xs font-medium text-[#16241B] focus:outline-none focus:border-[#3FA65C]"
                            />
                          </div>

                          <div className="space-y-1 text-left">
                            <label className="text-xs font-semibold text-[#334437]">Preferred Time</label>
                            <select
                              value={bookingTime}
                              onChange={(e) => setBookingTime(e.target.value)}
                              className="w-full px-3 py-2.5 bg-[#FAF6EE] border border-[#E5DFCE] rounded-xl text-xs font-medium text-[#16241B] focus:outline-none focus:border-[#3FA65C]"
                            >
                              <option value="09:00 AM">09:00 AM</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="11:30 AM">11:30 AM</option>
                              <option value="02:00 PM">02:00 PM</option>
                              <option value="03:30 PM">03:30 PM</option>
                              <option value="05:00 PM">05:00 PM</option>
                            </select>
                          </div>
                        </div>

                        {/* Reason / Symptoms */}
                        <div className="space-y-1 text-left">
                          <label className="text-xs font-semibold text-[#334437]">Reason / Symptoms</label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Routine vaccination and annual checkup"
                            value={bookingNotesInput}
                            onChange={(e) => setBookingNotesInput(e.target.value)}
                            className="w-full px-3.5 py-2 bg-[#FAF6EE] border border-[#E5DFCE] rounded-xl text-xs font-normal text-[#16241B] focus:outline-none focus:border-[#3FA65C]"
                          />
                        </div>

                        {selectedVetId && (
                          <div className="p-3 bg-[#EFF8F0] border border-[#D5EAD9] rounded-xl flex items-center justify-between text-xs font-medium text-[#16241B]">
                            <span>Consultation Fee:</span>
                            <span className="text-sm font-semibold text-[#009E66]">
                              {formatCurrency(vetsList.find((v) => v.id === selectedVetId)?.consultationFee ?? 50)}
                            </span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={bookingSubmitting}
                          className="w-full bg-[#009E66] hover:bg-[#008757] text-white font-semibold py-3 rounded-full shadow-xs cursor-pointer flex items-center justify-center gap-2 text-sm transition-all"
                        >
                          {bookingSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Confirming...
                            </>
                          ) : (
                            'Confirm Appointment'
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS & ANNOUNCEMENTS TAB */}
            {currentTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight">Announcements & Notifications</h1>
                  <p className="text-xs sm:text-sm text-[#67796B] font-medium mt-1">
                    System updates, appointment confirmations, and platform announcements for your account.
                  </p>
                </div>

                {notificationsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                  </div>
                ) : notifications.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="No Notifications Yet"
                    description="You're all caught up! System announcements and booking updates will appear here."
                  />
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {notifications.map((n) => {
                        const getIcon = () => {
                          if (n.type === 'APPOINTMENT_CONFIRMED') return <CheckCircle2 className="w-5 h-5 text-[#009E66]" />;
                          if (n.type === 'APPOINTMENT_REJECTED') return <AlertCircle className="w-5 h-5 text-[#DC2626]" />;
                          if (n.type === 'NEW_VET') return <Stethoscope className="w-5 h-5 text-[#0284C7]" />;
                          if (n.type && n.type.includes('ORDER')) return <ShoppingBag className="w-5 h-5 text-[#009E66]" />;
                          return <Bell className="w-5 h-5 text-[#EF7C3C]" />;
                        };

                        return (
                          <motion.div
                            key={n.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                              opacity: 0,
                              x: -40,
                              height: 0,
                              marginBottom: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              overflow: 'hidden',
                              transition: { duration: 0.25 },
                            }}
                            onClick={() => {
                              if (!n.isRead) handleMarkAsRead(n.id);
                            }}
                            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                              n.isRead
                                ? 'bg-white border-[#EAE3D4]'
                                : 'bg-[#FEFCE8] border-[#FEF08A] shadow-xs'
                            }`}
                          >
                            <div className="flex items-start gap-3.5 min-w-0">
                              <div className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-2xs shrink-0">
                                {getIcon()}
                              </div>
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-black text-[#16241B]">{n.title}</h4>
                                  {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-[#009E66] shrink-0" title="Unread" />
                                  )}
                                </div>
                                <p className="text-xs text-[#556658] font-medium leading-relaxed">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-[#88998C] font-semibold block pt-0.5">
                                  {getRelativeTimeString(n.createdAt)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(n.id);
                              }}
                              className="p-1.5 rounded-lg text-[#88998C] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {currentTab === 'wishlist' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight">Saved Items</h1>
                  <p className="text-xs sm:text-sm text-[#67796B] font-normal mt-1">
                    Your favorite pharmacy products, supplements, and bookmarked care services.
                  </p>
                </div>

                {wishlistLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="bg-[#F8F6F0] rounded-2xl p-4 border border-[#EAE3D4] flex items-center gap-3.5">
                        <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : wishlistError ? (
                  <ErrorState title="Unable to load wishlist" message={wishlistError} onRetry={fetchWishlist} />
                ) : wishlistItems.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="No Saved Items Yet"
                    description="Tap the heart icon on any pharmacy product or care service to save it to your personal wishlist."
                    actionLabel="Pharmacy"
                    actionLink="/pharmacy#popular-products"
                    secondaryActionLabel="Paw Store"
                    secondaryActionLink="/pet-essentials"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {wishlistItems.map((item) => {
                        let itemLink = '/pharmacy';
                        if (item.itemType === 'VET') {
                          itemLink = `/vets/${item.itemId}`;
                        } else if (item.itemType === 'SERVICE') {
                          itemLink = '/services';
                        }

                        let imageSrc = '';
                        if (item.itemType === 'PRODUCT') {
                          imageSrc = getProductImageUrl(item.name, item.imageUrl, item.itemId);
                        } else if (item.itemType === 'VET') {
                          imageSrc = getVetImageUrl(item.name, item.imageUrl);
                        } else if (item.itemType === 'SERVICE') {
                          imageSrc = getServiceImageUrl(item.name, item.imageUrl, item.itemId);
                        } else if (item.imageUrl) {
                          imageSrc = getCloudinaryImageUrl(item.imageUrl);
                        }

                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
                            className="bg-[#F8F6F0] rounded-2xl p-4 border border-[#EAE3D4] flex items-center justify-between gap-4 group hover:shadow-xs transition-shadow"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#E5DFCE] shrink-0 flex items-center justify-center">
                                {imageSrc ? (
                                  <img src={imageSrc} alt={item.name} className="w-full h-full object-cover" />
                                ) : item.itemType === 'VET' ? (
                                  <Stethoscope className="w-6 h-6 text-[#009E66]" />
                                ) : item.itemType === 'SERVICE' ? (
                                  <Sparkles className="w-6 h-6 text-[#7E22CE]" />
                                ) : (
                                  <ShoppingBag className="w-6 h-6 text-[#009E66]" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                    item.itemType === 'VET'
                                      ? 'bg-[#E3F3E9] text-[#009E66]'
                                      : item.itemType === 'SERVICE'
                                      ? 'bg-[#F3E8FF] text-[#7E22CE]'
                                      : 'bg-[#E6F9EC] text-[#009E66]'
                                  }`}>
                                    {item.itemType}
                                  </span>
                                </div>
                                <h3 className="text-sm font-bold text-[#16241B] truncate mt-1">{item.name}</h3>
                                {item.price !== undefined && item.price !== null && (
                                  <p className="text-xs font-semibold text-[#009E66]">{formatCurrency(item.price)}</p>
                                )}
                                {item.specialization && (
                                  <p className="text-xs text-[#EF7C3C] font-semibold truncate">{item.specialization}</p>
                                )}
                                {item.category && (
                                  <p className="text-[11px] text-[#88998C] font-normal truncate">{item.category}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <HeartToggle
                                itemType={item.itemType}
                                itemId={item.itemId}
                                isInitiallySaved={true}
                                onToggle={() => fetchWishlist()}
                              />
                              <button
                                type="button"
                                onClick={() => navigate(itemLink)}
                                className="px-3.5 py-2 rounded-full bg-[#009E66] text-white text-xs font-semibold hover:bg-[#008757] transition-colors cursor-pointer"
                              >
                                View Item
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* 5. SETTINGS TAB (Personal Details + Security & Password + Preferences) */}
            {(currentTab === 'settings' || currentTab === 'security' || currentTab === 'preferences') && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight">
                    Settings & Profile
                  </h1>
                  <p className="text-xs sm:text-sm text-[#67796B] font-normal mt-1">
                    Manage your personal details, security credentials, and communication preferences.
                  </p>
                </div>

                {/* Section 1: Personal Details */}
                <div className="space-y-4 pt-2">
                  <h2 className="text-base font-semibold text-[#16241B] flex items-center gap-2 border-b border-[#E8E4D8] pb-2">
                    <User className="w-4 h-4 text-[#009E66]" />
                    <span>Personal Details</span>
                  </h2>

                  {profileLoading ? (
                    <div className="space-y-5 max-w-2xl">
                      <Skeleton className="h-14 w-full rounded-2xl" />
                      <Skeleton className="h-14 w-full rounded-2xl" />
                      <Skeleton className="h-14 w-full rounded-2xl" />
                      <Skeleton className="h-12 w-36 rounded-full mt-4" />
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#16241B] font-sans mb-2">
                          FULL NAME
                        </label>
                        <div className="relative">
                          <User className="w-5 h-5 text-[#88998C] absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={formProfile.name}
                            onChange={(e) => setFormProfile({ ...formProfile, name: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#D3D1C7] text-sm text-[#16241B] font-normal font-sans focus:outline-none focus:ring-2 focus:ring-[#009E66] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#16241B] font-sans mb-2">
                          EMAIL ADDRESS
                        </label>
                        <div className="relative">
                          <Mail className="w-5 h-5 text-[#88998C] absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={formProfile.email}
                            onChange={(e) => setFormProfile({ ...formProfile, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#D3D1C7] text-sm text-[#16241B] font-normal font-sans focus:outline-none focus:ring-2 focus:ring-[#009E66] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#16241B] font-sans mb-2">
                          PHONE NUMBER
                        </label>
                        <div className="relative">
                          <Phone className="w-5 h-5 text-[#88998C] absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            maxLength={10}
                            value={formProfile.phone}
                            placeholder="9876543210"
                            onChange={(e) =>
                              setFormProfile({
                                ...formProfile,
                                phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                              })
                            }
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#D3D1C7] text-sm text-[#16241B] font-normal font-sans focus:outline-none focus:ring-2 focus:ring-[#009E66] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Primary Address */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#16241B] font-sans mb-2">
                          PRIMARY ADDRESS
                        </label>
                        <div className="relative">
                          <MapPin className="w-5 h-5 text-[#88998C] absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={formProfile.address}
                            placeholder="Street Address, City, Postal Code"
                            onChange={(e) => setFormProfile({ ...formProfile, address: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#D3D1C7] text-sm text-[#16241B] font-normal font-sans focus:outline-none focus:ring-2 focus:ring-[#009E66] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={!isProfileDirty || profileSaving}
                          className={`px-8 py-3.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 font-sans ${
                            isProfileDirty && !profileSaving
                              ? 'bg-[#009E66] hover:bg-[#008757] text-white shadow-md cursor-pointer'
                              : 'bg-[#009E66]/40 text-white cursor-not-allowed opacity-70'
                          }`}
                        >
                          {profileSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Section 2: Security & Password */}
                <div className="space-y-4 pt-6 border-t border-[#E8E4D8]">
                  <h2 className="text-base font-semibold text-[#16241B] flex items-center gap-2 border-b border-[#E8E4D8] pb-2">
                    <Lock className="w-4 h-4 text-[#009E66]" />
                    <span>Security & Password</span>
                  </h2>

                  <form onSubmit={handleChangePassword} className="space-y-6 max-w-2xl">
                    {/* Current Password */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#16241B] mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-[#88998C] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-3.5 rounded-full bg-[#F8F6F0] border border-[#EAE3D4] text-sm text-[#16241B] font-normal focus:outline-hidden focus:ring-2 focus:ring-[#548B60]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#88998C] hover:text-[#16241B]"
                        >
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#16241B] mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-[#88998C] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-3.5 rounded-full bg-[#F8F6F0] border border-[#EAE3D4] text-sm text-[#16241B] font-normal focus:outline-hidden focus:ring-2 focus:ring-[#548B60]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#88998C] hover:text-[#16241B]"
                        >
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-[#88998C] font-normal block mt-1.5">
                        Must be at least 8 characters long.
                      </span>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#16241B] mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-[#88998C] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPw ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-3.5 rounded-full bg-[#F8F6F0] border border-[#EAE3D4] text-sm text-[#16241B] font-normal focus:outline-hidden focus:ring-2 focus:ring-[#548B60]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#88998C] hover:text-[#16241B]"
                        >
                          {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && !isPasswordMatching && (
                        <span className="text-[11px] text-red-500 font-semibold block mt-1.5">
                          Passwords do not match.
                        </span>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!canSubmitPassword || passwordSubmitting}
                        className={`px-8 py-3.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                          canSubmitPassword && !passwordSubmitting
                            ? 'bg-[#548B60] hover:bg-[#437750] text-white shadow-md'
                            : 'bg-[#84A88C] text-white cursor-not-allowed opacity-80'
                        }`}
                      >
                        {passwordSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Section 3: Preferences & Notifications */}
                <div className="space-y-4 pt-6 border-t border-[#E8E4D8]">
                  <h2 className="text-base font-semibold text-[#16241B] flex items-center gap-2 border-b border-[#E8E4D8] pb-2">
                    <Sliders className="w-4 h-4 text-[#009E66]" />
                    <span>Preferences & Notifications</span>
                  </h2>

                  <div className="space-y-4 max-w-2xl">
                    {/* Newsletter */}
                    <div className="bg-[#F8F6F0] rounded-2xl p-4 sm:p-5 border border-[#EAE3D4] flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium text-[#16241B] flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#548B60]" />
                          <span>Pawfectly Newsletter</span>
                        </h4>
                        <p className="text-xs text-[#67796B] font-normal">
                          Receive monthly pet wellness articles, guides, and care advice.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePreference('newsletter')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          preferences.newsletter ? 'bg-[#548B60]' : 'bg-[#D1D5DB]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-0.5 ${
                            preferences.newsletter ? 'left-6.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Appointment Reminders */}
                    <div className="bg-[#F8F6F0] rounded-2xl p-4 sm:p-5 border border-[#EAE3D4] flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium text-[#16241B] flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#EF7C3C]" />
                          <span>Appointment Reminders</span>
                        </h4>
                        <p className="text-xs text-[#67796B] font-normal">
                          Email & SMS notifications 24 hours before your vet appointments.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePreference('appointmentReminders')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          preferences.appointmentReminders ? 'bg-[#548B60]' : 'bg-[#D1D5DB]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-0.5 ${
                            preferences.appointmentReminders ? 'left-6.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Order Status Updates */}
                    <div className="bg-[#F8F6F0] rounded-2xl p-4 sm:p-5 border border-[#EAE3D4] flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium text-[#16241B] flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-[#0284C7]" />
                          <span>Order & Pickup Updates</span>
                        </h4>
                        <p className="text-xs text-[#67796B] font-normal">
                          Real-time status tracking for your pet pharmacy orders.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePreference('orderUpdates')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          preferences.orderUpdates ? 'bg-[#548B60]' : 'bg-[#D1D5DB]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-0.5 ${
                            preferences.orderUpdates ? 'left-6.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Review Modal */}
      {reviewModalApt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#EDE7D9] shadow-2xl space-y-4 relative">
            <button
              onClick={() => setReviewModalApt(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-semibold text-[#EF7C3C] uppercase tracking-wider">Rate & Review Visit</span>
              <h3 className="text-xl font-semibold text-[#16241B] mt-0.5">
                How was your appointment?
              </h3>
              <p className="text-xs text-[#556658] font-normal">
                Dr. {reviewModalApt.vetName || 'Veterinarian'} • {reviewModalApt.serviceName || 'Consultation'}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#16241B] mb-2">
                  Star Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'text-[#F5A623] fill-[#F5A623]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-[#16241B]">{reviewRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#16241B] mb-1.5">
                  Written Review (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details about your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF8F3] border border-[#D3D1C7] text-xs font-normal text-[#16241B] focus:outline-none focus:ring-2 focus:ring-[#009E66]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalApt(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#67796B] hover:bg-[#FAF8F3] rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-6 py-2.5 bg-[#009E66] hover:bg-[#008757] text-white font-semibold rounded-full text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;


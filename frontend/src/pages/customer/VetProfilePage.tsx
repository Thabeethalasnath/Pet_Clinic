import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/feedback/ErrorState';
import { getVetImageUrl, formatCurrency } from '../../lib/utils';
import { apiClient } from '../../lib/axios';
import { useAuth } from '../../features/auth/AuthContext';
import {
  ChevronLeft,
  Star,
  ShieldCheck,
  Calendar,
  Award,
  MessageSquare,
  CheckCircle2,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

interface VetDoctor {
  id: number;
  name: string;
  specialization: string;
  secondarySpecialization?: string;
  petTypes?: string;
  experienceYears?: number;
  rating?: number;
  reviewsCount?: number;
  city?: string;
  address?: string;
  consultationFee?: number;
  photoUrl?: string;
  bio?: string;
  isActive?: boolean;
}

interface VetReview {
  id: number;
  appointmentId: number;
  vetId: number;
  vetName?: string;
  customerId?: number;
  customerName?: string;
  rating: number;
  reviewText?: string;
  createdAt?: string;
}

export const VetProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [vet, setVet] = useState<VetDoctor | null>(null);
  const [reviews, setReviews] = useState<VetReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVetDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [vetRes, reviewsRes] = await Promise.all([
        apiClient.get(`/vets/${id}`),
        apiClient.get(`/vets/${id}/reviews`).catch(() => ({ data: [] })),
      ]);
      setVet(vetRes.data);
      setReviews(reviewsRes.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load veterinarian profile details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVetDetails();
  }, [fetchVetDetails]);

  const handleBookAppointment = () => {
    if (!vet) return;
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/profile?tab=appointments&vetId=${vet.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex flex-col font-sans">
        <Navbar activePage="services" />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <Skeleton className="h-8 w-40 rounded-full" />
          <div className="bg-white rounded-3xl p-8 border border-[#EDE7D9] space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Skeleton className="w-32 h-32 rounded-2xl shrink-0" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-64 rounded-lg" />
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !vet) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex flex-col font-sans">
        <Navbar activePage="services" />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16 flex items-center justify-center">
          <ErrorState
            title="Veterinarian Profile Not Found"
            message={error || 'The requested veterinarian profile does not exist or is inactive.'}
            onRetry={fetchVetDetails}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const hasReviews = (vet.reviewsCount || 0) > 0;
  const photo = getVetImageUrl(vet.name, vet.photoUrl);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#1B2B1E] flex flex-col font-sans selection:bg-[#EF7C3C]/20 selection:text-[#EF7C3C]">
      <Navbar activePage="services" />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009E66] hover:text-[#1B2B1E] bg-white border border-[#D5EAD9] px-4 py-2 rounded-full shadow-2xs transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Vet Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE7D9] shadow-sm relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Vet Image */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-[#F4EFE6] border border-[#E5DFCE] shrink-0 shadow-xs">
              <img
                src={photo}
                alt={vet.name}
                className="w-full h-full object-cover object-[center_20%]"
              />
              {vet.isActive !== false && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-xs" title="Verified Practitioner">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#16241B]">{vet.name}</h1>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#009E66] bg-[#E3F3E9] px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Vet
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#EF7C3C] mt-1">{vet.specialization}</p>
                </div>

                {/* Rating Display */}
                <div className="flex items-center gap-3">
                  <div className="bg-[#FAF6EE] border border-[#EDE7D9] px-4 py-2 rounded-2xl flex items-center gap-2">
                    {hasReviews && vet.rating ? (
                      <>
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                        <div>
                          <span className="text-base font-black text-[#16241B]">{vet.rating.toFixed(1)}</span>
                          <span className="text-xs text-[#556658] font-bold block">
                            {vet.reviewsCount} review{vet.reviewsCount! > 1 ? 's' : ''}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-[#556658] block">No reviews yet</span>
                        <span className="text-[10px] text-gray-400">Be the first to review</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges / Key Specs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-[#009E66] bg-[#EFF8F0] border border-[#D5EAD9] px-3 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" /> {vet.experienceYears || 5}+ Years Experience
                </span>
                {vet.petTypes && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#7E22CE] bg-[#F3E8FF] border border-[#E9D5FF] px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" /> Treats: {vet.petTypes}
                  </span>
                )}
                {vet.secondarySpecialization && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#0284C7] bg-[#E0F2FE] border border-[#BAE6FD] px-3 py-1 rounded-full">
                    <Stethoscope className="w-3.5 h-3.5" /> {vet.secondarySpecialization}
                  </span>
                )}
              </div>

              {/* Bio Summary */}
              <div className="pt-2">
                <h3 className="text-xs font-black text-[#556658] uppercase tracking-wider mb-1">About Doctor</h3>
                <p className="text-sm text-[#445548] leading-relaxed">
                  {vet.bio || `${vet.name} is a dedicated practitioner with ${vet.experienceYears || 5}+ years of experience in ${vet.specialization.toLowerCase()}. Committed to providing compassionate, top-tier clinical care for pets.`}
                </p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="border-t border-[#EDE7D9] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#556658] block">Consultation Fee</span>
              <span className="text-2xl font-black text-[#009E66]">
                {formatCurrency(vet.consultationFee ?? 50)}
                <span className="text-xs text-[#556658] font-normal"> / in-clinic visit</span>
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleBookAppointment}
              className="w-full sm:w-auto rounded-full px-8 py-3 font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> Book Appointment
            </Button>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#16241B]">Customer Reviews</h2>
              <p className="text-xs text-[#556658] mt-0.5">Verified feedback from real completed pet appointments</p>
            </div>
            <div className="text-xs font-bold text-[#009E66] bg-[#E3F3E9] px-3 py-1 rounded-full">
              {reviews.length} Review{reviews.length === 1 ? '' : 's'} Total
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-2xl p-5 border border-[#EDE7D9] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#E3F3E9] text-[#009E66] font-black text-xs flex items-center justify-center">
                        {rev.customerName ? rev.customerName.charAt(0) : 'A'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#16241B] block">{rev.customerName || 'Anonymous'}</span>
                        <span className="text-[10px] text-[#556658]">Verified Pet Owner</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#445548] leading-relaxed italic">
                    "{rev.reviewText || 'Excellent service and great care provided!'}"
                  </p>
                  {rev.createdAt && (
                    <span className="text-[10px] text-gray-400 block text-right">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-[#EDE7D9] text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-[#16241B]">No Customer Reviews Yet</h4>
              <p className="text-xs text-[#556658] max-w-sm mx-auto">
                Appointments booked with {vet.name} will show real customer feedback here after completion.
              </p>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
};

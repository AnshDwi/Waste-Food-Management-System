import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { platformApi } from '../features/platform/platformApi';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SectionHeader } from '../components/ui/SectionHeader';
import { UploadDropzone } from '../components/ui/UploadDropzone';
import { pushToast } from '../components/ui/ToastViewport';
import { LocationPickerMap } from '../components/map/LocationPickerMap';

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
};

type SpeechRecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export const DonationFlowPage = () => {
  const queryClient = useQueryClient();
  const donationsQuery = useQuery({
    queryKey: ['donations'],
    queryFn: platformApi.getDonations
  });

  const [form, setForm] = useState({
    title: 'Prepared meals',
    quantity: 120,
    lat: 28.5708,
    lng: 77.3272
  });

  const [recentCreate, setRecentCreate] = useState<null | {
    aiAssignedDriver?: { name?: string; score?: number } | null;
    autoDelivery?: { route?: { etaMinutes?: number }; status?: string } | null;
  }>(null);

  const createMutation = useMutation({
    mutationFn: platformApi.createDonation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-trends'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      setRecentCreate(data);
      pushToast('Donation created and synced to live logistics.', 'success');
    },
    onError: () => {
      pushToast('Failed to create donation.', 'error');
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate({
      title: form.title,
      quantity: Number(form.quantity),
      expiryAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      location: {
        lat: Number(form.lat),
        lng: Number(form.lng)
      },
      batches: [
        {
          foodType: form.title,
          quantity: Number(form.quantity),
          cookedAt: new Date().toISOString(),
          expiryAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
  };

  const handleVoiceInput = () => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      const fallback = window.prompt('Voice input is unavailable here. Type the food title instead:');
      if (fallback?.trim()) {
        setForm((current) => ({ ...current, title: fallback.trim() }));
        pushToast(`Captured: "${fallback.trim()}"`, 'success');
      } else {
        pushToast('Voice input is not available in this browser.', 'error');
      }
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (!transcript) {
        pushToast('Voice input did not capture anything.', 'error');
        return;
      }

      setForm((current) => ({
        ...current,
        title: transcript
      }));
      pushToast(`Voice input captured: "${transcript}"`, 'success');
    };
    recognition.onerror = () => {
      const fallback = window.prompt('Voice input failed. Type the food title instead:');
      if (fallback?.trim()) {
        setForm((current) => ({ ...current, title: fallback.trim() }));
        pushToast(`Captured: "${fallback.trim()}"`, 'success');
        return;
      }

      pushToast('Voice input failed. Please try again.', 'error');
    };
    recognition.start();
  };

  if (donationsQuery.isError) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Fast donation" title="Unable to load donation records." description="Retry to restore the live donation queue." />
          <button onClick={() => donationsQuery.refetch()} className="mt-4 rounded-2xl bg-[image:var(--accent)] px-5 py-3 text-sm font-semibold text-white">Retry</button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
        <SectionHeader
          eyebrow="Fast donation"
          title="Create a donation in one screen and push it straight into live dispatch."
          description="Only the fields that matter remain: food name, quantity, pickup coordinates, and instant submission."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <motion.form layout onSubmit={handleSubmit} className="glass-panel-strong rounded-[34px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">Create a donation</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="panel-subtle rounded-[26px] p-4 shadow-sm">
              <span className="text-sm font-semibold text-[color:var(--muted)]">Food name</span>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-3 w-full bg-transparent text-lg font-semibold text-[color:var(--text)] outline-none" />
            </label>
            <label className="panel-subtle rounded-[26px] p-4 shadow-sm">
              <span className="text-sm font-semibold text-[color:var(--muted)]">Quantity</span>
              <input type="number" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))} className="mt-3 w-full bg-transparent text-lg font-semibold text-[color:var(--text)] outline-none" />
            </label>
            <label className="panel-subtle rounded-[26px] p-4 shadow-sm">
              <span className="text-sm font-semibold text-[color:var(--muted)]">Latitude</span>
              <input type="number" value={form.lat} onChange={(event) => setForm((current) => ({ ...current, lat: Number(event.target.value) }))} className="mt-3 w-full bg-transparent text-lg font-semibold text-[color:var(--text)] outline-none" />
            </label>
            <label className="panel-subtle rounded-[26px] p-4 shadow-sm">
              <span className="text-sm font-semibold text-[color:var(--muted)]">Longitude</span>
              <input type="number" value={form.lng} onChange={(event) => setForm((current) => ({ ...current, lng: Number(event.target.value) }))} className="mt-3 w-full bg-transparent text-lg font-semibold text-[color:var(--text)] outline-none" />
            </label>
          </div>
          <div className="mt-4">
            <p className="mb-3 text-sm font-semibold text-[color:var(--muted)]">Pickup location picker</p>
            <LocationPickerMap
              value={{ lat: Number(form.lat), lng: Number(form.lng) }}
              onChange={(next) =>
                setForm((current) => ({
                  ...current,
                  lat: next.lat,
                  lng: next.lng
                }))
              }
            />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Saving donation...' : 'Submit donation'}</PrimaryButton>
            <PrimaryButton type="button" variant="secondary" onClick={handleVoiceInput}>Use voice input</PrimaryButton>
          </div>
          {recentCreate?.aiAssignedDriver ? (
            <div className="mt-4 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              AI Assigned Driver: <span className="font-semibold">{recentCreate.aiAssignedDriver.name}</span> | score {recentCreate.aiAssignedDriver.score ?? 0} | ETA {recentCreate.autoDelivery?.route?.etaMinutes ?? 0} min
            </div>
          ) : null}
        </motion.form>

        <div className="space-y-4">
          <UploadDropzone />
          <div className="glass-panel-strong rounded-[34px] p-6">
            <h3 className="text-xl font-semibold text-[color:var(--text)]">Live donation records</h3>
            <div className="mt-4 space-y-3">
              {(donationsQuery.data?.donations ?? []).slice(0, 4).map((donation: { id: string; title: string; quantity: number; status: string }) => (
                <div key={donation.id} className="panel-subtle rounded-[24px] p-4 text-[color:var(--text)] shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{donation.title}</p>
                      <p className="text-sm text-[color:var(--muted)]">{donation.quantity} portions</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/18 dark:text-emerald-200">{donation.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

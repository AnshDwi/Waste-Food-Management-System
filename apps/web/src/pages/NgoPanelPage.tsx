import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../app/hooks';
import { platformApi } from '../features/platform/platformApi';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { pushToast } from '../components/ui/ToastViewport';

export const NgoPanelPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const ngosQuery = useQuery({
    queryKey: ['ngos'],
    queryFn: platformApi.getNgos
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    lat: 28.61,
    lng: 77.2,
    capacity: 100,
    contact: '+91-'
  });

  const createMutation = useMutation({
    mutationFn: platformApi.createNgo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
      pushToast('NGO created successfully.', 'success');
      setForm({ name: '', lat: 28.61, lng: 77.2, capacity: 100, contact: '+91-' });
    },
    onError: () => pushToast('Could not create NGO.', 'error')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) => platformApi.updateNgo(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
      pushToast('NGO updated successfully.', 'success');
      setEditingId(null);
    },
    onError: () => pushToast('Could not update NGO.', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: platformApi.deleteNgo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
      pushToast('NGO deleted.', 'success');
    },
    onError: () => pushToast('Could not delete NGO.', 'error')
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (user?.role !== 'ADMIN') {
      pushToast('Only admins can modify NGO records.', 'error');
      return;
    }

    const payload = {
      name: form.name,
      location: { lat: Number(form.lat), lng: Number(form.lng) },
      capacity: Number(form.capacity),
      contact: form.contact
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
        <SectionHeader
          eyebrow="NGO module"
          title="Full CRUD NGO management backed by real APIs."
          description="Create, edit, and delete NGO records with live capacity, location, and contact data."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
        <form onSubmit={handleSubmit} className="glass-panel-strong space-y-4 rounded-[34px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">{editingId ? 'Edit NGO' : 'Add NGO'}</h3>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="NGO name" className="theme-input w-full rounded-[22px] px-4 py-4 text-slate-950 dark:text-white" />
          <div className="grid gap-4 md:grid-cols-2">
            <input type="number" value={form.lat} onChange={(event) => setForm((current) => ({ ...current, lat: Number(event.target.value) }))} placeholder="Latitude" className="theme-input w-full rounded-[22px] px-4 py-4 text-slate-950 dark:text-white" />
            <input type="number" value={form.lng} onChange={(event) => setForm((current) => ({ ...current, lng: Number(event.target.value) }))} placeholder="Longitude" className="theme-input w-full rounded-[22px] px-4 py-4 text-slate-950 dark:text-white" />
          </div>
          <input type="number" value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: Number(event.target.value) }))} placeholder="Capacity" className="theme-input w-full rounded-[22px] px-4 py-4 text-slate-950 dark:text-white" />
          <input value={form.contact} onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))} placeholder="Contact" className="theme-input w-full rounded-[22px] px-4 py-4 text-slate-950 dark:text-white" />
          <PrimaryButton type="submit" disabled={user?.role !== 'ADMIN' || createMutation.isPending || updateMutation.isPending}>{editingId ? 'Save NGO' : 'Create NGO'}</PrimaryButton>
        </form>

        <div className="glass-panel-strong rounded-[34px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">NGO records</h3>
          <div className="panel-subtle mt-5 overflow-hidden rounded-[28px]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100/90 text-[color:var(--text)] dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(ngosQuery.data?.ngos ?? []).map((ngo: { id: string; name: string; capacity: number; contact: string; location: { lat: number; lng: number } }) => (
                  <tr key={ngo.id} className="border-t border-slate-200/70 dark:border-white/10">
                    <td className="px-4 py-4 text-[color:var(--text)]">{ngo.name}</td>
                    <td className="px-4 py-4 text-[color:var(--text)]">{ngo.capacity}</td>
                    <td className="px-4 py-4 text-[color:var(--text)]">{ngo.contact}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          disabled={user?.role !== 'ADMIN'}
                          onClick={() => {
                            setEditingId(ngo.id);
                            setForm({
                              name: ngo.name,
                              lat: ngo.location.lat,
                              lng: ngo.location.lng,
                              capacity: ngo.capacity,
                              contact: ngo.contact
                            });
                          }}
                          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
                        >
                          Edit
                        </button>
                        <button disabled={user?.role !== 'ADMIN'} onClick={() => deleteMutation.mutate(ngo.id)} className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

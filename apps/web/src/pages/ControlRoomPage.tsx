import { useQuery } from '@tanstack/react-query';
import { SectionHeader } from '../components/ui/SectionHeader';
import { platformApi } from '../features/platform/platformApi';

export const ControlRoomPage = () => {
  const controlRoomQuery = useQuery({ queryKey: ['control-room'], queryFn: platformApi.getControlRoom, refetchInterval: 4000 });
  const digitalTwinQuery = useQuery({ queryKey: ['digital-twin'], queryFn: platformApi.getDigitalTwin, refetchInterval: 6000 });
  const predictiveQuery = useQuery({ queryKey: ['predictive-failures'], queryFn: platformApi.getPredictiveFailures, refetchInterval: 6000 });
  const optimizationQuery = useQuery({ queryKey: ['global-optimization'], queryFn: platformApi.getGlobalOptimization, refetchInterval: 6000 });
  const assistantQuery = useQuery({ queryKey: ['assistant'], queryFn: platformApi.getAssistant, refetchInterval: 6000 });
  const impactQuery = useQuery({ queryKey: ['impact'], queryFn: platformApi.getImpact, refetchInterval: 6000 });
  const leaderboardQuery = useQuery({ queryKey: ['leaderboards'], queryFn: platformApi.getLeaderboards, refetchInterval: 10000 });

  if (
    controlRoomQuery.isLoading ||
    digitalTwinQuery.isLoading ||
    predictiveQuery.isLoading ||
    optimizationQuery.isLoading ||
    assistantQuery.isLoading ||
    impactQuery.isLoading ||
    leaderboardQuery.isLoading
  ) {
    return (
      <div className="space-y-6">
        <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
          <SectionHeader eyebrow="Control room" title="Loading autonomous network intelligence..." description="Pulling predictive, optimization, digital twin, and impact signals." />
        </section>
      </div>
    );
  }

  const controlRoom = controlRoomQuery.data;
  const digitalTwin = digitalTwinQuery.data;
  const predictive = predictiveQuery.data;
  const optimization = optimizationQuery.data;
  const assistant = assistantQuery.data;
  const impact = impactQuery.data;
  const leaderboards = leaderboardQuery.data;
  const predictiveAlerts = (predictive?.alerts ?? []).slice(0, 6);
  const twinRuns = digitalTwin?.twinRuns ?? [];

  return (
    <div className="space-y-6">
      <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
        <SectionHeader
          eyebrow="Autonomous command"
          title="Self-optimizing orchestration, digital twin simulation, and predictive logistics in one control room."
          description="This surface blends live fleet state, proactive risk scoring, simulation runs, assistant recommendations, environmental impact, and gamified performance."
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel-strong rounded-[28px] p-5">
          <p className="text-sm text-[color:var(--muted)]">Active deliveries</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{controlRoom?.networkLoad?.activeDeliveries ?? 0}</p>
        </div>
        <div className="glass-panel-strong rounded-[28px] p-5">
          <p className="text-sm text-[color:var(--muted)]">Predicted failures</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{controlRoom?.networkLoad?.predictedFailures ?? 0}</p>
        </div>
        <div className="glass-panel-strong rounded-[28px] p-5">
          <p className="text-sm text-[color:var(--muted)]">CO2 saved</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{impact?.co2SavedKg ?? 0} kg</p>
        </div>
        <div className="glass-panel-strong rounded-[28px] p-5">
          <p className="text-sm text-[color:var(--muted)]">Meals delivered</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--text)]">{impact?.mealsDelivered ?? 0}</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="glass-panel-strong rounded-[34px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">Predictive failure engine</h3>
          <div className="mt-5 grid gap-3">
            {predictiveAlerts.length > 0 ? predictiveAlerts.map((alert: { id: string; type: string; score: number; action: string; message: string }) => (
              <div key={alert.id} className="panel-subtle rounded-[24px] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500 dark:text-rose-300">{alert.type.replace(/_/g, ' ')}</p>
                    <p className="mt-2 font-semibold text-[color:var(--text)]">{alert.message}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">Autonomous action: {alert.action}</p>
                  </div>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-800 dark:bg-rose-500/15 dark:text-rose-200">
                    {(alert.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )) : (
              <div className="panel-subtle rounded-[24px] p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">System clear</p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--text)]">No active predictive failures right now.</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">The engine is still evaluating delay, driver, and NGO overload risk in real time. This panel will fill automatically when a threshold is crossed.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel-strong rounded-[34px] p-6">
            <h3 className="text-2xl font-semibold text-[color:var(--text)]">AI assistant</h3>
            <div className="mt-5 space-y-3">
              {(assistant?.suggestions ?? []).map((suggestion: { id: string; title: string; message: string }) => (
                <div key={suggestion.id} className="panel-subtle rounded-[22px] p-4 shadow-sm">
                  <p className="font-semibold text-[color:var(--text)]">{suggestion.title}</p>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{suggestion.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel-strong rounded-[34px] p-6">
            <h3 className="text-2xl font-semibold text-[color:var(--text)]">Optimization engine</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="status-tint rounded-[22px] p-4">Food in flight: {optimization?.objective?.foodInFlight ?? 0}</div>
              <div className="status-tint rounded-[22px] p-4">Remaining route distance: {optimization?.objective?.totalRemainingDistanceKm ?? 0} km</div>
              <div className="status-tint rounded-[22px] p-4">Projected meals saved if optimized: {optimization?.objective?.estimatedMealsSavedIfOptimized ?? 0}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <div className="glass-panel-strong rounded-[34px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">Digital twin simulation</h3>
          <div className="mt-5 grid gap-3">
            {twinRuns.length > 0 ? twinRuns.map((run: { deliveryId: string; donationTitle: string; scenario: string; simulatedEtaMinutes: number; failureProbability: number; recommendedAction: string }) => (
              <div key={run.deliveryId} className="panel-subtle rounded-[24px] p-4 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">{run.scenario}</p>
                <p className="mt-2 font-semibold text-[color:var(--text)]">{run.donationTitle}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Simulated ETA: {run.simulatedEtaMinutes} min</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Failure probability: {(run.failureProbability * 100).toFixed(0)}%</p>
                <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">{run.recommendedAction}</p>
              </div>
            )) : (
              <div className="panel-subtle rounded-[24px] p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Twin standby</p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--text)]">No active runs to simulate.</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">Create or assign a delivery and the digital twin will generate scenario playback, reroute recommendations, and failure probabilities here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel-strong rounded-[34px] p-6">
          <h3 className="text-2xl font-semibold text-[color:var(--text)]">Leaderboards</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">Drivers</p>
              {(leaderboards?.topDrivers ?? []).map((driver: { id: string; name: string; score: number; rating: number }) => (
                <div key={driver.id} className="panel-subtle rounded-[20px] p-3 text-sm shadow-sm">
                  <p className="font-semibold text-[color:var(--text)]">{driver.name}</p>
                  <p className="text-[color:var(--muted)]">Score {driver.score} | Rating {driver.rating}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">NGOs</p>
              {(leaderboards?.topNgos ?? []).map((ngo: { id: string; name: string; score: number; rating: number }) => (
                <div key={ngo.id} className="panel-subtle rounded-[20px] p-3 text-sm shadow-sm">
                  <p className="font-semibold text-[color:var(--text)]">{ngo.name}</p>
                  <p className="text-[color:var(--muted)]">Score {ngo.score} | Rating {ngo.rating}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Donors</p>
              {(leaderboards?.topDonors ?? []).map((donor: { id: string; name: string; score: number; badge: string }) => (
                <div key={donor.id} className="panel-subtle rounded-[20px] p-3 text-sm shadow-sm">
                  <p className="font-semibold text-[color:var(--text)]">{donor.name}</p>
                  <p className="text-[color:var(--muted)]">Score {donor.score} | {donor.badge}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

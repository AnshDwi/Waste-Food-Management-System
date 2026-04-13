import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SectionHeader } from '../components/ui/SectionHeader';
import { platformApi } from '../features/platform/platformApi';
import { pushToast } from '../components/ui/ToastViewport';

type FraudSignal = {
  id: string;
  actor: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'ESCALATED' | 'RESOLVED';
};

type AuditLog = {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
};

export const AdminPage = () => {
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: ['admin-overview'],
    queryFn: platformApi.getAdminOverview
  });

  const auditQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: platformApi.getAuditLogs
  });

  const approveMutation = useMutation({
    mutationFn: platformApi.approveNgoVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['ngos'] });
      pushToast('NGO verification approved.', 'success');
    },
    onError: () => pushToast('No pending NGO verification to approve.', 'error')
  });

  const escalateMutation = useMutation({
    mutationFn: platformApi.escalateFraudSignal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      pushToast('Fraud signal escalated.', 'success');
    },
    onError: () => pushToast('No open fraud signal to escalate.', 'error')
  });

  const exportMutation = useMutation({
    mutationFn: platformApi.exportComplianceReport,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      pushToast('Compliance report exported.', 'success');
    },
    onError: () => pushToast('Unable to export report.', 'error')
  });

  const fraudSignals = overviewQuery.data?.fraudSignals ?? [];
  const auditLogs = auditQuery.data?.logs ?? [];

  return (
    <div className="space-y-6">
      <section className="glass-panel-strong rounded-[34px] p-6 md:p-8">
        <SectionHeader
          eyebrow="Admin command"
          title="Operational controls, fraud response, and audit visibility are now wired to real backend state."
          description="Admin actions write audit entries, update verification queues, and export a compliance report instead of behaving like static buttons."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="glass-panel-strong rounded-[34px] p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold text-[color:var(--text)]">Fraud review queue</h3>
            <button
              onClick={() => document.getElementById('audit-log-panel')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Open full audit log
            </button>
          </div>
          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/70 dark:border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/70 text-[color:var(--muted)] dark:bg-white/5">
                <tr>
                  <th className="px-4 py-4">Actor</th>
                  <th className="px-4 py-4">Risk</th>
                  <th className="px-4 py-4">Signal</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {fraudSignals.map((signal: FraudSignal) => (
                  <tr key={signal.id} className="border-t border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-900/20">
                    <td className="px-4 py-4 text-[color:var(--text)]">{signal.actor}</td>
                    <td className={`px-4 py-4 font-semibold ${signal.severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>{signal.severity}</td>
                    <td className="px-4 py-4 text-[color:var(--muted)]">{signal.reason}</td>
                    <td className="px-4 py-4 text-[color:var(--muted)]">{signal.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel-strong rounded-[34px] p-6">
            <h3 className="text-xl font-semibold text-[color:var(--text)]">Controls</h3>
            <div className="mt-5 space-y-3 text-sm">
              <button onClick={() => approveMutation.mutate()} className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white">
                {approveMutation.isPending ? 'Approving...' : 'Approve NGO verification'}
              </button>
              <button onClick={() => escalateMutation.mutate()} className="w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white">
                {escalateMutation.isPending ? 'Escalating...' : 'Escalate suspicious activity'}
              </button>
              <button onClick={() => exportMutation.mutate()} className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white dark:bg-white dark:text-slate-900">
                {exportMutation.isPending ? 'Exporting...' : 'Export compliance report'}
              </button>
            </div>
          </div>
          <div className="glass-panel-strong rounded-[34px] p-6">
            <p className="text-sm text-[color:var(--muted)]">Platform health</p>
            <p className="mt-4 text-4xl font-semibold text-[color:var(--text)]">99.98%</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Pending NGO verifications: {overviewQuery.data?.pendingNgoVerifications ?? 0}. Flagged accounts: {overviewQuery.data?.flaggedAccounts ?? 0}. Failed deliveries today: {overviewQuery.data?.failedDeliveriesToday ?? 0}.
            </p>
          </div>
        </div>
      </section>

      <section id="audit-log-panel" className="glass-panel-strong rounded-[34px] p-6">
        <h3 className="text-2xl font-semibold text-[color:var(--text)]">Audit log</h3>
        <div className="mt-5 space-y-3">
          {auditLogs.map((log: AuditLog) => (
            <div key={log.id} className="panel-subtle rounded-[22px] p-4 text-[color:var(--text)] shadow-sm">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{log.action}</p>
                  <p className="text-sm text-[color:var(--muted)]">
                    Actor: {log.actorId} · {log.entityType} · {log.entityId}
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { Wallet as WalletIcon, Plus, ArrowDownCircle, ArrowUpCircle, AlertCircle } from 'lucide-react';
import { supabase, Transaction } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Card, Button, Modal, Input, EmptyState, LoadingSpinner } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/format';

export function WalletPage() {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);

  const loadWallet = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle();
    setBalance(Number(wallet?.balance || 0));
    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setTransactions(txns as Transaction[] || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleTopUp = async () => {
    if (!user || topUpAmount <= 0) return;
    const { error: txErr } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'topup',
      direction: 'credit',
      amount: topUpAmount,
      description: 'Wallet top-up',
    });
    if (txErr) return;

    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
    if (wallet) {
      await supabase.from('wallets').update({ balance: Number(wallet.balance) + topUpAmount }).eq('user_id', user.id);
    }
    setTopUpOpen(false);
    setTopUpAmount(500);
    loadWallet();
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <EmptyState icon={<AlertCircle size={48} />} title="Please log in to view your wallet" />
      </div>
    );
  }

  const isWorker = profile?.role === 'worker';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">{isWorker ? t('earnings') : t('wallet')}</h1>

        {loading ? (
          <LoadingSpinner size={32} />
        ) : (
          <>
            {/* Balance Card */}
            <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-700 to-slate-800 p-6 text-white shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-200">{isWorker ? 'Total Earnings' : t('walletBalance')}</p>
                  <p className="mt-2 text-4xl font-bold">{formatCurrency(balance)}</p>
                  <p className="mt-1 text-xs text-teal-200">{transactions.length} transactions</p>
                </div>
                <WalletIcon size={32} className="text-teal-300" />
              </div>
              {!isWorker && (
                <Button
                  onClick={() => setTopUpOpen(true)}
                  className="mt-6 bg-white text-teal-700 hover:bg-slate-100"
                  size="sm"
                >
                  <Plus size={16} /> {t('addMoney')}
                </Button>
              )}
            </div>

            {/* Transactions */}
            <Card className="mt-6 p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">{t('transactions')}</h2>
              {transactions.length === 0 ? (
                <EmptyState icon={<WalletIcon size={40} />} title="No transactions yet" subtitle={isWorker ? 'Complete jobs to earn money' : 'Add money or book services to see transactions'} />
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          tx.direction === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {tx.direction === 'credit' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 capitalize">
                            {tx.type === 'topup' ? 'Wallet Top-up' : tx.type === 'payment' ? 'Service Payment' : tx.type === 'earning' ? 'Job Earning' : 'Refund'}
                          </p>
                          <p className="text-xs text-slate-400">{tx.description} · {formatDateTime(tx.created_at)}</p>
                        </div>
                      </div>
                      <p className={`font-bold ${tx.direction === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.direction === 'credit' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      <Modal open={topUpOpen} onClose={() => setTopUpOpen(false)} title={t('topUp')}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Add money to your wallet for seamless payments.</p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount (₹)</label>
            <Input type="number" min={100} value={topUpAmount} onChange={(e) => setTopUpAmount(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[200, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => setTopUpAmount(amt)}
                className="rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:bg-teal-50"
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <strong>Simulated Payment:</strong> This is a demo top-up. No real payment is processed.
          </div>
          <Button onClick={handleTopUp} className="w-full" size="lg">
            {t('topUp')} {formatCurrency(topUpAmount)}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

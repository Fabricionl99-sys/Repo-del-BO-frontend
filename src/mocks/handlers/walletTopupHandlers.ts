import { delay, http, HttpResponse } from 'msw';

import { billingSnapshot } from '@/mocks/data/billing';
import { walletTransactions } from '@/mocks/data/billing';
import {
  advanceTopupStatus,
  seedWalletTopup,
  walletTopupsStore,
} from '@/mocks/data/walletTopups';
import type { WalletCryptoTopupRequest } from '@/types/walletTopup';
import type { WalletTopupRequest } from '@/types/billing';

const wait = () =>
  import.meta.env.MODE === 'test' ? Promise.resolve() : delay(120 + Math.random() * 200);

export const walletTopupHandlers = [
  http.post('*/admin/wallet/topup', async ({ request }) => {
    await wait();
    const body = (await request.json()) as WalletCryptoTopupRequest | WalletTopupRequest;
    if ('crypto' in body && body.crypto) {
      const topup = seedWalletTopup({
        amount_usd: body.amount_usd,
        crypto: body.crypto,
        network: body.network ?? 'TRC20',
      });
      return HttpResponse.json({ data: topup }, { status: 201 });
    }
    const legacy = body as WalletTopupRequest;
    billingSnapshot.wallet_balance_usd += legacy.amount_usd;
    const tx = {
      id: `tx_${Date.now()}`,
      transaction_type: 'topup' as const,
      amount_usd: legacy.amount_usd,
      reason: `Recarga ${legacy.payment_method}`,
      notes: legacy.payment_reference ?? null,
      balance_after_usd: billingSnapshot.wallet_balance_usd,
      created_at: new Date().toISOString(),
    };
    walletTransactions.unshift(tx);
    return HttpResponse.json({ data: tx }, { status: 201 });
  }),

  http.get('*/admin/wallet/topup/:id', async ({ params }) => {
    await wait();
    const id = params.id as string;
    advanceTopupStatus(id);
    const topup = walletTopupsStore.find((t) => t.id === id);
    if (!topup) return HttpResponse.json({ error: 'not_found' }, { status: 404 });

    if (topup.status === 'completed') {
      const exists = walletTransactions.some((tx) => tx.notes === topup.id);
      if (!exists) {
        billingSnapshot.wallet_balance_usd += topup.amount_usd;
        walletTransactions.unshift({
          id: `tx_${topup.id}`,
          transaction_type: 'topup',
          amount_usd: topup.amount_usd,
          reason: `Recarga ${topup.crypto} ${topup.network}`,
          notes: topup.id,
          balance_after_usd: billingSnapshot.wallet_balance_usd,
          created_at: topup.completed_at ?? new Date().toISOString(),
        });
      }
    }

    return HttpResponse.json({ data: topup });
  }),

  http.get('*/admin/wallet/topups', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? undefined;
    const crypto = url.searchParams.get('crypto') ?? undefined;
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const offset = Number(url.searchParams.get('offset') ?? 0);

    let items = [...walletTopupsStore];
    if (status) items = items.filter((t) => t.status === status);
    if (crypto) items = items.filter((t) => t.crypto === crypto);

    const slice = items.slice(offset, offset + limit);
    return HttpResponse.json({
      data: { items: slice, total: items.length, limit, offset },
    });
  }),
];

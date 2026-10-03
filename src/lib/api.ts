/** A stand-in for the operator's backend. Deterministic, so a demo behaves the same way twice. */

export interface Account {
  msisdn: string;
  balance: number;
  tariff: string;
  dataLeftGb: number;
}

const WAIT = 900;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export async function requestOtp(msisdn: string): Promise<void> {
  await sleep(WAIT);
  if (msisdn.replace(/\D/g, '').length < 9) throw new Error('short_number');
}

export async function verifyOtp(code: string): Promise<Account> {
  await sleep(WAIT);
  if (code !== '0000') throw new Error('wrong_code');
  return { msisdn: '+995 555 01 02 03', balance: 4.2, tariff: 'Mobilo S', dataLeftGb: 1.8 };
}

export interface TopUpResult {
  ok: boolean;
  /** Set when the card issuer refused it. */
  declineCode?: 'insufficient_funds' | 'do_not_honour' | 'expired_card';
}

/** Cards ending 00 are declined, so the failure path is reachable on demand. */
export async function topUp(amount: number, cardNumber: string): Promise<TopUpResult> {
  await sleep(WAIT * 2);
  if (cardNumber.replace(/\D/g, '').endsWith('00')) {
    return { ok: false, declineCode: 'insufficient_funds' };
  }
  if (amount <= 0) return { ok: false, declineCode: 'do_not_honour' };
  return { ok: true };
}

export async function tariffs(): Promise<{ name: string; price: number; data: string }[]> {
  await sleep(WAIT);
  return [
    { name: 'Mobilo S', price: 9, data: '5 GB' },
    { name: 'Mobilo M', price: 14, data: '20 GB' },
    { name: 'Mobilo L', price: 19, data: 'Unlimited' },
  ];
}

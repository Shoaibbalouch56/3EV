'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleCheck, Loader2 } from 'lucide-react';
import { BricklinCar } from './BricklinCar';
import { useToast } from '@/components/ui/Toast';
import { currency } from '@/lib/format';

const TRIMS = [
  { name: '3EV Launch Edition', price: 39980, range: '275 mi' },
  { name: '3EV Touring', price: 43500, range: '288 mi' },
  { name: '3EV Sport', price: 46900, range: '262 mi' },
];

const COLORS = [
  { name: 'Visionary Pearl', hex: '#EEF1F5' },
  { name: 'Safety Orange', hex: '#FF6A1F' },
  { name: 'Signal Red', hex: '#E11D2E' },
  { name: 'Obsidian', hex: '#15171C' },
  { name: 'Pacific Blue', hex: '#1E5FA8' },
  { name: 'Titanium', hex: '#8D95A3' },
];

const DEPOSITS = [500, 1000, 2500];

const STEPS = ['Configuration', 'Your details', 'Deposit'];

export function ReservationForm() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [trim, setTrim] = useState(TRIMS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [deposit, setDeposit] = useState(DEPOSITS[0]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const detailsValid = form.name.trim().length > 1 && /.+@.+\..+/.test(form.email);

  const submit = async () => {
    setSubmitting(true);
    // Demo build: no payment processor is wired up. A production build posts to
    // POST /api/orders and hands the deposit off to the payment provider.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
    toast.success(
      'Reservation received',
      `${trim.name} in ${color.name} · ${currency(deposit)} deposit. Demo only — no payment was taken.`,
    );
  };

  if (done) {
    return (
      <div className="panel relative overflow-hidden p-8 text-center sm:p-14">
        <div className="pointer-events-none absolute inset-0 bg-radial-brand opacity-70" />
        <div className="relative">
          <CircleCheck className="mx-auto h-12 w-12 text-volt" />
          <h2 className="heading-md mt-6 text-white">Reservation received</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-chalk-400">
            Demo confirmation — no payment was taken. In production this creates an order in the
            management platform, assigns the nearest dealer and emails a confirmation.
          </p>

          <div className="mx-auto mt-8 max-w-sm space-y-3 text-left">
            {[
              ['Reference', 'VV-3EV-DEMO-0001'],
              ['Trim', trim.name],
              ['Finish', color.name],
              ['Deposit', currency(deposit)],
              ['Assigned dealer', `Nearest dealer to ${form.city || 'your location'}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-white/[0.07] pb-2 text-sm">
                <span className="text-chalk-500">{k}</span>
                <span className="font-medium text-white">{v}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setDone(false);
              setStep(0);
            }}
            className="btn-ghost btn-sm mt-8"
          >
            Start another reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
      <div className="panel p-6 sm:p-8">
        {/* Stepper */}
        <ol className="flex items-center gap-3">
          {STEPS.map((label, i) => {
            const active = i === step;
            const complete = i < step;
            return (
              <li key={label} className="flex flex-1 items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                      complete
                        ? 'bg-volt text-ink-950'
                        : active
                          ? 'bg-brand text-white'
                          : 'border border-white/15 text-chalk-500'
                    }`}
                  >
                    {complete ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span
                    className={`hidden text-xs font-medium sm:block ${
                      active ? 'text-white' : 'text-chalk-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-white/10" />}
              </li>
            );
          })}
        </ol>

        <div className="mt-8">
          {step === 0 && (
            <div className="animate-fade-in space-y-7">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-500">Trim</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {TRIMS.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setTrim(t)}
                      className={`rounded-xl border px-4 py-4 text-left transition ${
                        t.name === trim.name
                          ? 'border-brand/60 bg-brand/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                      }`}
                    >
                      <p className="font-display text-sm font-semibold text-white">{t.name}</p>
                      <p className="mt-1 text-xs text-chalk-500">{t.range}</p>
                      <p className="mt-2 text-sm text-chalk-200">{currency(t.price)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-500">Finish</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={c.name}
                      className={`h-10 w-10 rounded-full border transition ${
                        c.name === color.name ? 'scale-110 border-white' : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in grid gap-4 sm:grid-cols-2">
              {[
                { key: 'name', label: 'Full name', type: 'text', placeholder: 'Alex Morgan' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'alex@example.com' },
                { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 010-2244' },
                { key: 'city', label: 'City', type: 'text', placeholder: 'Austin, TX' },
              ].map((field) => (
                <label key={field.key} className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-500">
                    {field.label}
                  </span>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-chalk-600 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25"
                  />
                </label>
              ))}
              <p className="sm:col-span-2 text-xs text-chalk-600">
                Demo form — details stay in your browser and are never transmitted.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-500">
                Refundable deposit
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {DEPOSITS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDeposit(d)}
                    className={`rounded-xl border px-4 py-5 text-center transition ${
                      d === deposit
                        ? 'border-brand/60 bg-brand/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    <p className="font-display text-2xl font-semibold text-white">{currency(d)}</p>
                    <p className="mt-1 text-xs text-chalk-500">
                      {d === 500 ? 'Standard queue' : d === 1000 ? 'Priority queue' : 'Launch Edition slot'}
                    </p>
                  </button>
                ))}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-chalk-600">
                Deposits are fully refundable until you confirm your build with a dealer. No payment
                is processed in this demonstration build.
              </p>
            </div>
          )}
        </div>

        <div className="mt-9 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-ghost btn-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !detailsValid) {
                  toast.warning('Check your details', 'A name and a valid email address are required.');
                  return;
                }
                setStep((s) => s + 1);
                if (step === 0) {
                  toast.info('Configuration saved', `${trim.name} · ${color.name}`);
                }
              }}
              className="btn-primary btn-sm"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="btn-primary btn-sm">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {submitting ? 'Processing' : `Reserve for ${currency(deposit)}`}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <aside className="panel h-fit overflow-hidden p-6 sm:p-7 lg:sticky lg:top-28">
        <div
          className="-mx-6 -mt-6 mb-6 px-6 pt-6 transition-colors duration-500 sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7"
          style={{ background: `radial-gradient(ellipse 80% 70% at 50% 0%, ${color.hex}22, transparent 70%)` }}
        >
          <BricklinCar id="reserve" body={color.hex} className="w-full" showShadow={false} />
        </div>

        <h3 className="font-display text-lg font-semibold text-white">{trim.name}</h3>
        <p className="mt-1 text-sm text-chalk-500">
          {color.name} · {trim.range} targeted range
        </p>

        <dl className="mt-6 space-y-3 text-sm">
          {[
            ['Vehicle', currency(trim.price)],
            ['Destination & handling', currency(1395)],
            ['Deposit due today', currency(deposit)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <dt className="text-chalk-500">{k}</dt>
              <dd className="font-medium text-white">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex items-end justify-between">
          <span className="text-xs uppercase tracking-[0.16em] text-chalk-500">Estimated total</span>
          <span className="font-display text-2xl font-semibold text-white">
            {currency(trim.price + 1395)}
          </span>
        </div>
      </aside>
    </div>
  );
}

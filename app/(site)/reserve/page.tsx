import type { Metadata } from 'next';
import { ReservationForm } from '@/components/site/ReservationForm';
import { SectionHeading } from '@/components/site/Sections';

export const metadata: Metadata = {
  title: 'Reserve',
  description: 'Reserve your Bricklin 3EV with a fully refundable deposit from $500.',
};

const FAQ = [
  {
    q: 'Is the deposit refundable?',
    a: 'Yes. Reservations are fully refundable until you confirm your final build with your assigned dealer and the order moves into production.',
  },
  {
    q: 'When do deliveries start?',
    a: 'First customer deliveries are targeted for 2027, prioritised by reservation date and deposit tier. Your dealer confirms your build slot once production scheduling opens.',
  },
  {
    q: 'Who delivers and services my 3EV?',
    a: 'A franchised Visionary Vehicles dealer. They complete the pre-delivery inspection, hand over the vehicle and handle warranty and service for its lifetime.',
  },
  {
    q: 'Can I change my configuration later?',
    a: 'Yes — trim, colour and packs stay editable with your dealer until your build slot is locked for production.',
  },
  {
    q: 'Do you sell to fleets?',
    a: 'Fleet and commercial orders are handled by the same platform, with volume allocation and consolidated delivery managed through your regional dealer.',
  },
];

export default function ReservePage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-10 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-dark bg-[size:64px_64px] opacity-40 mask-fade-b" />
          <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(225,29,46,0.22),transparent_60%)] blur-3xl" />
        </div>
        <div className="container-vv">
          <SectionHeading
            eyebrow="Reservations open"
            title="Reserve your Bricklin 3EV"
            copy="Three steps, fully refundable, and routed straight to the dealer nearest you."
            align="center"
          />
        </div>
      </section>

      <section className="pb-16">
        <div className="container-vv">
          <ReservationForm />
        </div>
      </section>

      <section id="faq" className="py-16 sm:py-24">
        <div className="container-vv">
          <SectionHeading eyebrow="FAQ" title="Questions before you reserve" align="center" />
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-[15px] font-medium text-white">
                  {item.q}
                  <span className="relative h-4 w-4 shrink-0">
                    <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-chalk-400" />
                    <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-chalk-400 transition group-open:rotate-90 group-open:opacity-0" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-chalk-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

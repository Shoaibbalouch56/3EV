import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Handshake, MapPin, Phone, Search, Wrench } from 'lucide-react';
import { getLocator } from '@/lib/api';
import { ReserveBand, SectionHeading } from '@/components/site/Sections';
import { Reveal } from '@/components/site/Reveal';

export const metadata: Metadata = {
  title: 'Dealers',
  description: 'Find a Visionary Vehicles dealer for Bricklin 3EV sales, delivery and service.',
};

interface DealerPoint {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  status: string;
}

export default async function DealersPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams.search ?? '';
  const { data, live } = await getLocator(search);
  const dealers: DealerPoint[] = Array.isArray(data) ? data : [];

  const regions = dealers.reduce<Record<string, DealerPoint[]>>((acc, d) => {
    const key = d.country === 'Canada' ? 'Canada' : d.state;
    (acc[key] ||= []).push(d);
    return acc;
  }, {});

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-10 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-dark bg-[size:64px_64px] opacity-40 mask-fade-b" />
        <div className="container-vv">
          <SectionHeading
            eyebrow="Sales & service network"
            title="Find your dealer"
            copy="Your dealer handles configuration, delivery, warranty and service — backed by the Visionary Vehicles management platform."
            align="center"
          />

          <form action="/dealers" className="mx-auto mt-10 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-chalk-500" />
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search by city, state or dealer name"
                className="w-full rounded-full border border-white/[0.12] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-chalk-600 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25"
              />
            </div>
            <button type="submit" className="btn-primary btn-sm px-6">
              Search
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-chalk-600">
            {dealers.length} dealer point{dealers.length === 1 ? '' : 's'}
            {search ? ` matching “${search}”` : ' in the network'}
            {!live && ' · showing bundled demo data (API offline)'}
          </p>
        </div>
      </section>

      <section className="pb-8">
        <div className="container-vv space-y-12">
          {Object.keys(regions).length === 0 && (
            <div className="panel p-10 text-center">
              <p className="text-chalk-300">No dealers matched that search.</p>
              <Link href="/dealers" className="btn-ghost btn-sm mt-5">
                Show all dealers
              </Link>
            </div>
          )}

          {Object.entries(regions).map(([region, list], idx) => (
            <Reveal key={region} delay={idx * 50}>
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="font-display text-lg font-semibold text-white">{region}</h2>
                  <span className="h-px flex-1 bg-white/[0.08]" />
                  <span className="text-xs text-chalk-600">{list.length}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((d) => (
                    <article key={d.id} className="panel panel-hover group p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-base font-semibold leading-snug text-white">
                          {d.name}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
                            d.status === 'active'
                              ? 'border border-volt/30 bg-volt/10 text-volt'
                              : 'border border-ember/30 bg-ember/10 text-ember'
                          }`}
                        >
                          {d.status === 'active' ? 'Open' : 'Opening soon'}
                        </span>
                      </div>
                      <p className="mt-3 flex items-center gap-2 text-sm text-chalk-400">
                        <MapPin className="h-4 w-4 text-brand" />
                        {d.city}, {d.state}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm text-chalk-400">
                        <Phone className="h-4 w-4 text-brand" />
                        {d.phone}
                      </p>
                      <Link
                        href="/reserve"
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-chalk-200 transition group-hover:text-brand"
                      >
                        Book a consultation
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="service" className="py-20 sm:py-24">
        <div className="container-vv grid gap-4 lg:grid-cols-2">
          <div className="panel p-8 sm:p-10">
            <Wrench className="h-6 w-6 text-brand" />
            <h2 className="heading-md mt-5 text-white">Service & warranty</h2>
            <p className="mt-4 text-sm leading-relaxed text-chalk-400">
              Certified 3EV technicians, mobile service for common jobs and remote diagnostics that
              open a ticket before you notice a problem. Coverage: 4 years / 50,000 miles vehicle,
              8 years / 100,000 miles battery.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-chalk-400">
              {['Mobile service units', 'Loaner programme', 'OTA diagnostics', 'Parts availability tracked per region'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-brand" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div id="partner" className="panel relative overflow-hidden p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-radial-brand opacity-70" />
            <div className="relative">
              <Handshake className="h-6 w-6 text-ember" />
              <h2 className="heading-md mt-5 text-white">Become a dealer</h2>
              <p className="mt-4 text-sm leading-relaxed text-chalk-400">
                Franchise partners get allocation, a delivery playbook, technician certification and
                full access to the Visionary Vehicles management platform — orders, inventory, CRM,
                service and warranty in one system.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/admin" className="btn-primary btn-sm">
                  Preview the platform
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/reserve#faq" className="btn-ghost btn-sm">
                  Partnership FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReserveBand />
    </>
  );
}

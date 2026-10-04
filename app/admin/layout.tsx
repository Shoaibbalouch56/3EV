import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: {
    default: 'Management platform',
    template: '%s | VV Platform',
  },
  description:
    'Visionary Vehicles executive platform: orders, dealer network, inventory, customers, service and analytics.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

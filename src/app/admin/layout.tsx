'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader } from '@/components/loader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Allow access to the login page itself
    if (pathname === '/admin') {
      setIsVerified(true);
      return;
    }

    const isAdmin = sessionStorage.getItem('admin-auth') === 'true';
    if (!isAdmin) {
      router.replace('/admin');
    } else {
      setIsVerified(true);
    }
  }, [router, pathname]);

  if (!isVerified) {
    return <Loader />;
  }

  return <>{children}</>;
}

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_COOKIE_NAME, isValidAdminSession } from '../lib/admin-auth';
import AdminAttendanceClient from './AdminAttendanceClient';

export default function AdminAttendancePage() {
  const session = cookies().get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSession(session)) {
    redirect('/admin/login');
  }

  return <AdminAttendanceClient />;
}

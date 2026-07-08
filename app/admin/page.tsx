'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import type { AttendanceRecord, AttendanceResponse } from '../lib/definitions';

function todayInKampalaISO() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kampala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === 'year')?.value || '';
  const month = parts.find((part) => part.type === 'month')?.value || '';
  const day = parts.find((part) => part.type === 'day')?.value || '';

  return `${year}-${month}-${day}`;
}

function displayDate(value: string) {
  const parsed = new Date(`${value}T12:00:00+03:00`);

  if (Number.isNaN(parsed.getTime())) return value || 'Selected day';

  return new Intl.DateTimeFormat('en-UG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

function displayTime(value?: string) {
  if (!value) return '—';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';

  return new Intl.DateTimeFormat('en-UG', {
    timeZone: 'Africa/Kampala',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function recordID(record: AttendanceRecord) {
  return record.ID || record.id || `${record.email}-${record.phone}-${record.submittedAt}`;
}

export default function AdminAttendancePage() {
  const [date, setDate] = useState(todayInKampalaISO());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const rotarians = useMemo(
    () => records.filter((record) => record.classification && record.classification !== 'Guest').length,
    [records],
  );

  async function loadAttendance(selectedDate = date) {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/attendance?date=${encodeURIComponent(selectedDate)}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      let data: AttendanceResponse | null = null;

      try {
        data = (await response.json()) as AttendanceResponse;
      } catch {
        data = null;
      }

      if (!response.ok || !data?.success) {
        setError(data?.message || 'Could not load attendance.');
        setRecords([]);
        return;
      }

      setRecords(data.records || []);
    } catch {
      setError('Could not load attendance. Check the backend connection.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAttendance(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-topbar">
          <div className="admin-brand">
            <div>
              <span>Rotary Club of</span>
              <strong>Kitende Breeze</strong>
            </div>
          </div>

          <Link className="admin-back" href="/">
            Back to check-in
          </Link>
        </div>

        <section className="admin-hero">
          <div className="admin-panel">
            <p>Attendance dashboard</p>
            <h1>{displayDate(date)}</h1>
            <span>
              View fellowship and event check-ins by day. Returning visitors are saved as fresh attendance rows,
              while duplicate same-day check-ins are avoided.
            </span>
          </div>

          <div className="admin-stat">
            <span>Total attendees</span>
            <strong>{loading ? '…' : records.length}</strong>
            <span>{rotarians} Rotary-family guests</span>
          </div>
        </section>

        <section className="admin-controls" aria-label="Attendance filters">
          <label>
            Attendance date
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>

          <button type="button" onClick={() => loadAttendance(date)} disabled={loading}>
            {loading ? 'Loading...' : 'View Day'}
          </button>
        </section>

        {error && <p className="admin-error">{error}</p>}

        <section className="attendance-table-card">
          <div className="attendance-table-head">
            <div>
              <strong>Attendance list</strong>
              <span>{records.length} check-ins for {displayDate(date)}</span>
            </div>
          </div>

          {records.length > 0 ? (
            <div className="attendance-table-wrap">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Contact</th>
                    <th>Club</th>
                    <th>Classification</th>
                    <th>Purpose</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={recordID(record)}>
                      <td>
                        <strong>{record.fullName || 'Unnamed guest'}</strong>
                        <span>{record.event || 'Kitende Breeze event'}</span>
                      </td>
                      <td>
                        {record.phone || '—'}
                        <span>{record.email || 'No email'}</span>
                      </td>
                      <td>{record.rotaryClub || '—'}</td>
                      <td>{record.classification || 'Guest'}</td>
                      <td>
                        {record.purpose || 'Club Fellowship'}
                        {record.otherPurpose && <span>{record.otherPurpose}</span>}
                      </td>
                      <td>{displayTime(record.submittedAt || record.CreatedAt || record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="attendance-empty">
              {loading ? 'Loading attendance…' : 'No attendance records found for this date.'}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

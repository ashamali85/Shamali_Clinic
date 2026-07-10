'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { deletePatientAction } from '@/lib/actions';
import { SubmitButton } from '@/components/SubmitButton';

export type PatientRow = {
  id: string;
  fileNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  civilId: string;
  mobile1: string;
  nationality: string;
  area: string;
  governorate: string;
  email: string | null;
};

type SortKey = 'fileNumber' | 'name' | 'gender' | 'nationality' | 'area' | 'mobile1';

function fullName(p: PatientRow) {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
}

export function PatientTable({ patients }: { patients: PatientRow[] }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fileNumber');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [pendingDelete, setPendingDelete] = useState<PatientRow | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = patients;
    if (q) {
      list = patients.filter((p) =>
        [
          fullName(p),
          p.fileNumber,
          p.civilId,
          p.mobile1,
          p.area,
          p.governorate,
          p.nationality,
          p.email ?? ''
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      const va = sortKey === 'name' ? fullName(a).toLowerCase() : String(a[sortKey]).toLowerCase();
      const vb = sortKey === 'name' ? fullName(b).toLowerCase() : String(b[sortKey]).toLowerCase();
      return va < vb ? -sortDir : va > vb ? sortDir : 0;
    });
    return sorted;
  }, [patients, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  const arrow = (key: SortKey) =>
    key === sortKey ? <span className="arw">{sortDir === 1 ? '▲' : '▼'}</span> : null;

  return (
    <>
      <div className="row wrap" style={{ marginBottom: 16 }}>
        <div className="searchbar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            placeholder="Search by name, file no, Civil ID, mobile, area…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search patients"
          />
        </div>
        <span className="muted small">
          {patients.length === 0
            ? ''
            : `${rows.length} of ${patients.length} patient${patients.length === 1 ? '' : 's'}`}
        </span>
      </div>

      <div className="table-card">
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('fileNumber')}>File No {arrow('fileNumber')}</th>
                <th className="sortable" onClick={() => toggleSort('name')}>Patient {arrow('name')}</th>
                <th className="sortable" onClick={() => toggleSort('gender')}>Gender {arrow('gender')}</th>
                <th className="sortable" onClick={() => toggleSort('nationality')}>Nationality {arrow('nationality')}</th>
                <th className="sortable" onClick={() => toggleSort('area')}>Area / Governorate {arrow('area')}</th>
                <th className="sortable" onClick={() => toggleSort('mobile1')}>Mobile {arrow('mobile1')}</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td><span className="fileno">{p.fileNumber}</span></td>
                  <td>
                    <div className="nm">{fullName(p)}</div>
                    <div className="muted small">Civil ID {p.civilId}</div>
                  </td>
                  <td>
                    <span className={`badge ${p.gender === 'FEMALE' ? 'badge-female' : 'badge-male'}`}>
                      {p.gender === 'FEMALE' ? 'Female' : 'Male'}
                    </span>
                  </td>
                  <td>{p.nationality}</td>
                  <td>
                    {p.area}
                    <div className="muted small">{p.governorate}</div>
                  </td>
                  <td>{p.mobile1}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/patients/${p.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => setPendingDelete(p)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="empty-lg">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            <div>
              {patients.length === 0
                ? 'No patients yet. Add your first patient to get started.'
                : 'No patients match your search.'}
            </div>
          </div>
        )}
      </div>

      {pendingDelete && (
        <div className="modal-back" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-body">
              <h3>Delete patient?</h3>
              <p className="muted" style={{ margin: 0 }}>
                This permanently removes {fullName(pendingDelete)} ({pendingDelete.fileNumber}). This cannot be undone.
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setPendingDelete(null)}>Cancel</button>
              <form action={deletePatientAction}>
                <input type="hidden" name="id" value={pendingDelete.id} />
                <SubmitButton className="btn btn-danger" pendingText="Deleting…">
                  Delete patient
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

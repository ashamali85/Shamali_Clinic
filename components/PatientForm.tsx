'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { SubmitButton } from '@/components/SubmitButton';

export type AreaOption = { id: string; name: string; governorate: string };
export type GovernorateGroup = { governorate: string; areas: AreaOption[] };
export type NationalityOption = { id: string; name: string };

export type PatientFormValues = {
  id?: string;
  fileNumber?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string; // yyyy-mm-dd
  nationalityId: string;
  mobile1: string;
  mobile2: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  areaId: string;
  civilId: string;
  paciNumber: string;
};

type ActionState = { error?: string } | null;
type ServerAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const EMPTY: PatientFormValues = {
  firstName: '', middleName: '', lastName: '', gender: '', dateOfBirth: '',
  nationalityId: '', mobile1: '', mobile2: '', email: '', addressLine1: '',
  addressLine2: '', areaId: '', civilId: '', paciNumber: ''
};

export function PatientForm({
  mode,
  action,
  governorates,
  nationalities,
  areaToGovernorate,
  initial
}: {
  mode: 'create' | 'edit';
  action: ServerAction;
  governorates: GovernorateGroup[];
  nationalities: NationalityOption[];
  areaToGovernorate: Record<string, string>;
  initial?: PatientFormValues;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  const start = initial ?? EMPTY;
  const [areaId, setAreaId] = useState(start.areaId);

  const governorate = areaId ? areaToGovernorate[areaId] ?? '' : '';
  const isEdit = mode === 'edit';

  return (
    <form action={formAction} className="card card-pad-lg" noValidate>
      {isEdit && initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {state?.error && <div className="alert alert-error">{state.error}</div>}

      {/* Identity ---------------------------------------------------------- */}
      <div className="form-section">
        <div className="form-section-title">Identity</div>
        <div className="grid-3">
          <div className="field">
            <label htmlFor="firstName">First name <span className="req">*</span></label>
            <input id="firstName" name="firstName" defaultValue={start.firstName} required />
          </div>
          <div className="field">
            <label htmlFor="middleName">Middle name</label>
            <input id="middleName" name="middleName" defaultValue={start.middleName} />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name <span className="req">*</span></label>
            <input id="lastName" name="lastName" defaultValue={start.lastName} required />
          </div>
          <div className="field">
            <label htmlFor="gender">Gender <span className="req">*</span></label>
            <select id="gender" name="gender" defaultValue={start.gender} required>
              <option value="">Select…</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="dateOfBirth">Date of birth <span className="req">*</span></label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={start.dateOfBirth} required />
          </div>
          <div className="field">
            <label htmlFor="nationalityId">Nationality <span className="req">*</span></label>
            <select id="nationalityId" name="nationalityId" defaultValue={start.nationalityId} required>
              <option value="">Select…</option>
              {nationalities.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact ----------------------------------------------------------- */}
      <div className="form-section">
        <div className="form-section-title">Contact</div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="mobile1">Mobile number 1 <span className="req">*</span></label>
            <input id="mobile1" name="mobile1" inputMode="tel" placeholder="+965 …" defaultValue={start.mobile1} required />
          </div>
          <div className="field">
            <label htmlFor="mobile2">Mobile number 2</label>
            <input id="mobile2" name="mobile2" inputMode="tel" placeholder="+965 …" defaultValue={start.mobile2} />
          </div>
          <div className="field field-full">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="name@example.com" defaultValue={start.email} />
          </div>
        </div>
      </div>

      {/* Address ----------------------------------------------------------- */}
      <div className="form-section">
        <div className="form-section-title">Address</div>
        <div className="grid-2">
          <div className="field field-full">
            <label htmlFor="addressLine1">Address line 1</label>
            <input id="addressLine1" name="addressLine1" placeholder="Block, street, building" defaultValue={start.addressLine1} />
          </div>
          <div className="field field-full">
            <label htmlFor="addressLine2">Address line 2</label>
            <input id="addressLine2" name="addressLine2" placeholder="Floor, apartment, landmark" defaultValue={start.addressLine2} />
          </div>
          <div className="field">
            <label htmlFor="areaId">Area <span className="req">*</span></label>
            <select
              id="areaId"
              name="areaId"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              required
            >
              <option value="">Select…</option>
              {governorates.map((g) => (
                <optgroup key={g.governorate} label={`${g.governorate} Governorate`}>
                  {g.areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="governorate">Governorate</label>
            <input
              id="governorate"
              className="readonly-field"
              value={governorate}
              readOnly
              placeholder="Set automatically from area"
            />
          </div>
        </div>
      </div>

      {/* Official identifiers --------------------------------------------- */}
      <div className="form-section">
        <div className="form-section-title">Official Identifiers</div>
        <div className="grid-3">
          <div className="field">
            <label htmlFor="civilId">Civil ID number <span className="req">*</span></label>
            <input id="civilId" name="civilId" inputMode="numeric" maxLength={12} placeholder="12 digits" defaultValue={start.civilId} required />
          </div>
          <div className="field">
            <label htmlFor="paciNumber">PACI number</label>
            <input id="paciNumber" name="paciNumber" inputMode="numeric" placeholder="Unified address no." defaultValue={start.paciNumber} />
          </div>
          <div className="field">
            <label>File number</label>
            <div className="fileno-box">
              <span className="fileno">{start.fileNumber ?? '—'}</span>
              <span className="note">
                {start.fileNumber ? '(assigned — locked)' : 'generated on save'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', gap: 12, marginTop: 22 }}>
        <Link href="/patients" className="btn btn-ghost">Cancel</Link>
        <SubmitButton className="btn btn-primary" pendingText="Saving…">
          {isEdit ? 'Save changes' : 'Save patient'}
        </SubmitButton>
      </div>
    </form>
  );
}

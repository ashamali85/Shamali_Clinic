'use client';

import { useActionState, useEffect, useState } from 'react';
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

type ActionState = { error?: string; ok?: true; fileNumber?: string } | null;
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
  initial,
  variant = 'page',
  onSuccess,
  onCancel
}: {
  mode: 'create' | 'edit';
  action: ServerAction;
  governorates: GovernorateGroup[];
  nationalities: NationalityOption[];
  areaToGovernorate: Record<string, string>;
  initial?: PatientFormValues;
  /** 'page' wraps the form in a card; 'modal' renders bare for a dialog body. */
  variant?: 'page' | 'modal';
  /** Called after a successful save (used by the modal to close + refresh). */
  onSuccess?: (result: { fileNumber?: string }) => void;
  /** Cancel handler for the modal footer; falls back to a /patients link. */
  onCancel?: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  const start = initial ?? EMPTY;
  const [areaId, setAreaId] = useState(start.areaId);

  // Collapsible sections. All open by default; collapsing only hides a section
  // visually — its inputs stay in the DOM so every field is still submitted.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identity: true,
    contact: true,
    address: true,
    identifiers: true
  });
  const toggleSection = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  // When the server action reports success, notify the parent.
  useEffect(() => {
    if (state?.ok) onSuccess?.({ fileNumber: state.fileNumber });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const governorate = areaId ? areaToGovernorate[areaId] ?? '' : '';
  const isEdit = mode === 'edit';
  const inModal = variant === 'modal';

  const fields = (
    <>
      {isEdit && initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {state?.error && <div className="alert alert-error">{state.error}</div>}

      {/* Identity ---------------------------------------------------------- */}
      <section className={`form-section collapsible ${openSections.identity ? 'open' : 'collapsed'}`}>
        <button
          type="button"
          className="form-section-header"
          onClick={() => toggleSection('identity')}
          aria-expanded={openSections.identity}
        >
          <span className="form-section-title">Identity</span>
          <span className="chevron" aria-hidden="true" />
        </button>
        <div className="form-section-body">
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
      </section>

      {/* Contact ----------------------------------------------------------- */}
      <section className={`form-section collapsible ${openSections.contact ? 'open' : 'collapsed'}`}>
        <button
          type="button"
          className="form-section-header"
          onClick={() => toggleSection('contact')}
          aria-expanded={openSections.contact}
        >
          <span className="form-section-title">Contact</span>
          <span className="chevron" aria-hidden="true" />
        </button>
        <div className="form-section-body">
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
      </section>

      {/* Address ----------------------------------------------------------- */}
      <section className={`form-section collapsible ${openSections.address ? 'open' : 'collapsed'}`}>
        <button
          type="button"
          className="form-section-header"
          onClick={() => toggleSection('address')}
          aria-expanded={openSections.address}
        >
          <span className="form-section-title">Address</span>
          <span className="chevron" aria-hidden="true" />
        </button>
        <div className="form-section-body">
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
      </section>

      {/* Official identifiers --------------------------------------------- */}
      <section className={`form-section collapsible ${openSections.identifiers ? 'open' : 'collapsed'}`}>
        <button
          type="button"
          className="form-section-header"
          onClick={() => toggleSection('identifiers')}
          aria-expanded={openSections.identifiers}
        >
          <span className="form-section-title">Official Identifiers</span>
          <span className="chevron" aria-hidden="true" />
        </button>
        <div className="form-section-body">
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
      </section>
    </>
  );

  const footer = (
    <div
      className="row"
      style={{
        justifyContent: 'flex-end',
        gap: 12,
        ...(inModal ? {} : { marginTop: 22 })
      }}
    >
      {onCancel ? (
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      ) : (
        <Link href="/patients" className="btn btn-ghost">Cancel</Link>
      )}
      <SubmitButton className="btn btn-primary" pendingText="Saving…">
        {isEdit ? 'Save changes' : 'Save patient'}
      </SubmitButton>
    </div>
  );

  // In a modal, the scrollable body and sticky footer are laid out here so the
  // long form scrolls inside the dialog while the actions stay visible.
  if (inModal) {
    return (
      <form action={formAction} noValidate className="modal-form">
        <div className="modal-form-body">{fields}</div>
        <div className="modal-form-foot">{footer}</div>
      </form>
    );
  }

  return (
    <form action={formAction} className="card card-pad-lg" noValidate>
      {fields}
      {footer}
    </form>
  );
}

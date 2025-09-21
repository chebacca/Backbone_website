import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Stack, TextField, Tabs, Tab, Grid, Chip, Divider, Alert, FormControl, InputLabel, Select, MenuItem, ButtonGroup, ToggleButton, ToggleButtonGroup, IconButton, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import api, { endpoints } from '@/services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Print, PictureAsPdf, Refresh, Download, Save, Restore, Public, Map, Launch, Receipt, OpenInNew, Visibility, MoreVert, Payment } from '@mui/icons-material';

interface PaymentRow {
  id: string;
  createdAt: string;
  amount: number;
  currency: string;
  status: string;
  stripeInvoiceId?: string;
  taxAmount?: number;
  taxRate?: number;
  taxJurisdiction?: string;
  billingAddress?: {
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
  user?: {
    id: string;
    email: string;
    isEmailVerified: boolean;
    taxInformation?: any;
    businessProfile?: any;
  }
}

const AccountingDashboard: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [tab, setTab] = useState<number>(0);
  const hashToTabIndex: Record<string, number> = useMemo(() => ({
    '#overview': 0,
    '#payments': 1,
    '#tax': 2,
    '#filings': 3,
    '#compliance': 4,
    '#terms': 5,
  }), []);
  const tabIndexToHash: Record<number, string> = useMemo(() => ({
    0: 'overview',
    1: 'payments',
    2: 'tax',
    3: 'filings',
    4: 'compliance',
    5: 'terms',
  }), []);

  // Sync tab with URL hash
  useEffect(() => {
    const h = (location.hash || '').toLowerCase();
    if (h && Object.prototype.hasOwnProperty.call(hashToTabIndex, h)) {
      const idx = hashToTabIndex[h];
      if (idx !== tab) setTab(idx);
    } else if (!h) {
      // Default to overview if no hash
      if (tab !== 0) setTab(0);
      if (location.pathname.startsWith('/accounting')) {
        navigate('/accounting#overview', { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
    const nextHash = tabIndexToHash[newValue];
    const desired = `#${nextHash}`;
    if ((location.hash || '').toLowerCase() !== desired) {
      navigate(`/accounting${desired}`, { replace: true });
    }
  };
  const [overview, setOverview] = useState<any>(null);
  const [taxSummary, setTaxSummary] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [termsRows, setTermsRows] = useState<Array<{ id: string; email: string; termsVersionAccepted?: string; termsAcceptedAt?: string; privacyPolicyVersionAccepted?: string; privacyPolicyAcceptedAt?: string }>>([]);
  // Filing packet state
  const [filingFrom, setFilingFrom] = useState<string>('');
  const [filingTo, setFilingTo] = useState<string>('');
  const [filingScheme, setFilingScheme] = useState<'US_SALES_TAX' | 'EU_OSS'>('US_SALES_TAX');
  const [company, setCompany] = useState({
    legalName: '',
    taxId: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'US',
    contactEmail: '',
  });
  const [filingPayments, setFilingPayments] = useState<PaymentRow[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState<string>('NY');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');
  const [preset, setPreset] = useState<string | null>(null);

  const US_STATES: Array<{ code: string; name: string; portal?: string }> = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California', portal: 'https://onlineservices.cdtfa.ca.gov' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida', portal: 'https://floridarevenue.com/taxes/Pages/return_drt.aspx' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York', portal: 'https://www.tax.ny.gov/online/' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas', portal: 'https://comptroller.texas.gov/taxes/file-pay/' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington', portal: 'https://secure.dor.wa.gov/' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ];

  // Load defaults for company and sensible initial period (last full month)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('filing_company_default');
      if (stored) setCompany(JSON.parse(stored));
    } catch {}
    const today = new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setFilingFrom(fmt(firstDayLastMonth));
    setFilingTo(fmt(lastDayLastMonth));
  }, []);

  const applyPeriodPreset = (preset: 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'LAST_QUARTER' | 'YTD' | 'LAST_YEAR') => {
    const today = new Date();
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const startOfMonth = (y: number, m: number) => new Date(y, m, 1);
    const endOfMonth = (y: number, m: number) => new Date(y, m + 1, 0);
    const startOfQuarter = (y: number, q: number) => new Date(y, q * 3, 1);
    const endOfQuarter = (y: number, q: number) => new Date(y, q * 3 + 3, 0);

    if (preset === 'THIS_MONTH') {
      const from = startOfMonth(today.getFullYear(), today.getMonth());
      const to = endOfMonth(today.getFullYear(), today.getMonth());
      setFilingFrom(fmt(from)); setFilingTo(fmt(to)); return;
    }
    if (preset === 'LAST_MONTH') {
      const from = startOfMonth(today.getFullYear(), today.getMonth() - 1);
      const to = endOfMonth(today.getFullYear(), today.getMonth() - 1);
      setFilingFrom(fmt(from)); setFilingTo(fmt(to)); return;
    }
    if (preset === 'THIS_QUARTER') {
      const q = Math.floor(today.getMonth() / 3);
      const from = startOfQuarter(today.getFullYear(), q);
      const to = endOfQuarter(today.getFullYear(), q);
      setFilingFrom(fmt(from)); setFilingTo(fmt(to)); return;
    }
    if (preset === 'LAST_QUARTER') {
      let q = Math.floor(today.getMonth() / 3) - 1; let y = today.getFullYear();
      if (q < 0) { q = 3; y -= 1; }
      const from = startOfQuarter(y, q);
      const to = endOfQuarter(y, q);
      setFilingFrom(fmt(from)); setFilingTo(fmt(to)); return;
    }
    if (preset === 'YTD') {
      const from = new Date(today.getFullYear(), 0, 1);
      const to = today;
      setFilingFrom(fmt(from)); setFilingTo(fmt(to)); return;
    }
    if (preset === 'LAST_YEAR') {
      const y = today.getFullYear() - 1;
      const from = new Date(y, 0, 1);
      const to = new Date(y, 11, 31);
      setFilingFrom(fmt(from)); setFilingTo(fmt(to)); return;
    }
  };

  const saveCompanyAsDefault = async () => {
    try { localStorage.setItem('filing_company_default', JSON.stringify(company)); } catch {}
    try { await api.post(endpoints.admin.companyFilingSave(), company); } catch {}
  };
  const loadCompanyDefault = () => {
    try {
      const stored = localStorage.getItem('filing_company_default');
      if (stored) setCompany(JSON.parse(stored));
    } catch {}
  };

  const fetchPayments = async () => {
    const res = await api.get(endpoints.accounting.payments(), { params: { limit: 50 } });
    setPayments(res.data?.data?.payments || []);
  };

  useEffect(() => {
    const load = async () => {
      fetchPayments();
      const [ov, tax, ev, consentsLatest] = await Promise.all([
        api.get('accounting/overview'),
        api.get('accounting/tax/summary'),
        api.get('accounting/compliance-events'),
        api.get(endpoints.accounting.consentsLatest()),
      ]);
      setOverview(ov.data?.data || null);
      setTaxSummary(tax.data?.data || null);
      setEvents(ev.data?.data?.events || []);
      setTermsRows(consentsLatest.data?.data?.users || []);
      // Load company filing defaults from backend if available
      try {
        const resCompany = await api.get(endpoints.admin.companyFilingGet());
        const c = resCompany.data?.data?.company;
        if (c) setCompany((prev) => ({ ...prev, ...c }));
      } catch {}
    };
    load();
  }, []);

  const exportPayments = async () => {
    const body: any = { from, to, includePII: false };
    const res = await api.post(endpoints.accounting.exportPayments(), body);
    const rows = res.data?.data?.rows || [];
    const header = Object.keys(rows[0] || {}).join(',');
    const csv = [header, ...rows.map((r: any) => Object.values(r).map((v: any) => JSON.stringify(v ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${from || 'all'}_${to || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPaymentsForFiling = async () => {
    const body: any = { from: filingFrom, to: filingTo, includePII: false };
    const res = await api.post(endpoints.accounting.exportPayments(), body);
    const rows = res.data?.data?.rows || [];
    const header = Object.keys(rows[0] || {}).join(',');
    const csv = [header, ...rows.map((r: any) => Object.values(r).map((v: any) => JSON.stringify(v ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${filingFrom || 'all'}_${filingTo || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshFilingSummary = async () => {
    const res = await api.get('accounting/tax/summary', { params: { from: filingFrom || undefined, to: filingTo || undefined } });
    setTaxSummary(res.data?.data || null);
    // Also load payments scoped to period to compute state-level totals
    const pay = await api.get(endpoints.accounting.payments(), { params: { from: filingFrom || undefined, to: filingTo || undefined, limit: 500 } });
    setFilingPayments(pay.data?.data?.payments || []);
  };

  const downloadJurisdictionCSV = () => {
    if (!taxSummary) return;
    const rows: Array<Record<string, any>> = [];
    if (filingScheme === 'US_SALES_TAX') {
      const byJurisdiction = taxSummary?.byJurisdiction || {};
      for (const [jurisdiction, v] of Object.entries<any>(byJurisdiction)) {
        rows.push({
          jurisdiction,
          tax_cents: (v as any).tax_cents ?? 0,
          taxable_cents: (v as any).taxable_cents ?? 0,
          count: (v as any).count ?? 0,
        });
      }
    } else {
      const byCountry = taxSummary?.byCountry || {};
      for (const [country, v] of Object.entries<any>(byCountry)) {
        rows.push({
          country,
          tax_cents: (v as any).tax_cents ?? 0,
          taxable_cents: (v as any).taxable_cents ?? 0,
          count: (v as any).count ?? 0,
        });
      }
    }
    const header = Object.keys(rows[0] || {}).join(',');
    const csv = [header, ...rows.map((r) => Object.values(r).map((v) => JSON.stringify(v ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filing_summary_${filingScheme}_${filingFrom || 'all'}_${filingTo || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printFilingCoverSheet = () => {
    const win = window.open('', 'PRINT', 'height=800,width=800');
    if (!win) return;
    const period = `${filingFrom || 'Start'} to ${filingTo || 'End'}`;
    const values = filingScheme === 'US_SALES_TAX' ? (taxSummary?.byJurisdiction || {}) : (taxSummary?.byCountry || {});
    const totals = Object.values<any>(values).reduce((acc, v: any) => ({ tax: acc.tax + ((v?.tax_cents) || 0), taxable: acc.taxable + ((v?.taxable_cents) || 0), count: acc.count + ((v?.count) || 0) }), { tax: 0, taxable: 0, count: 0 });
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Filing Cover Sheet</title>
      <style>body{font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding:24px;} h1,h2{margin:0 0 8px;} table{border-collapse: collapse; width:100%; margin-top:16px;} th,td{border:1px solid #ccc; padding:8px; text-align:left;} small{color:#666}</style>
    </head><body>
      <h1>Tax Filing Cover Sheet</h1>
      <small>Generated by Accounting Dashboard</small>
      <h2>Company</h2>
      <div>${company.legalName || '-'}</div>
      <div>${company.addressLine1 || ''} ${company.addressLine2 || ''}</div>
      <div>${company.city || ''} ${company.region || ''} ${company.postalCode || ''} ${company.country || ''}</div>
      <div>Tax ID: ${company.taxId || '-'}</div>
      <div>Contact: ${company.contactEmail || '-'}</div>
      <h2>Filing</h2>
      <div>Scheme: ${filingScheme}</div>
      <div>Period: ${period}</div>
      <table>
        <tr><th>Total Taxable</th><th>Total Tax</th><th>Transactions</th></tr>
        <tr><td>${(totals.taxable/100).toLocaleString()}</td><td>${(totals.tax/100).toLocaleString()}</td><td>${totals.count}</td></tr>
      </table>
      <p style=\"margin-top:16px\">Attach the jurisdiction/member-state summary CSV and payments CSV for the filing period when submitting via your tax portal or provider.</p>
      <script>window.onload=function(){window.print(); setTimeout(()=>window.close(), 300);}</script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  // EU OSS member-state mapping for nicer labels
  const EU_MEMBER_STATES: Record<string, string> = {
    AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus',
    CZ: 'Czechia', DK: 'Denmark', EE: 'Estonia', FI: 'Finland', FR: 'France',
    DE: 'Germany', GR: 'Greece', HU: 'Hungary', IE: 'Ireland', IT: 'Italy',
    LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands',
    PL: 'Poland', PT: 'Portugal', RO: 'Romania', SK: 'Slovakia', SI: 'Slovenia',
    ES: 'Spain', SE: 'Sweden'
  };

  const printJurisdictionWorksheet = () => {
    if (!taxSummary) return;
    const win = window.open('', 'PRINT', 'height=900,width=1000');
    if (!win) return;
    const period = `${filingFrom || 'Start'} to ${filingTo || 'End'}`;
    const values = filingScheme === 'US_SALES_TAX' ? (taxSummary?.byJurisdiction || {}) : (taxSummary?.byCountry || {});
    const rowsHtml = Object.entries<any>(values)
      .map(([k, v]) => {
        const labelText = filingScheme === 'EU_OSS' ? `${EU_MEMBER_STATES[k] || k} (${k})` : k;
        return `<tr><td>${labelText}</td><td>${((v?.taxable_cents || 0)/100).toLocaleString()}</td><td>${((v?.tax_cents || 0)/100).toLocaleString()}</td><td>${v?.count || 0}</td></tr>`;
      }) 
      .join('');
    const totals = Object.values<any>(values).reduce((acc, v: any) => ({ tax: acc.tax + ((v?.tax_cents) || 0), taxable: acc.taxable + ((v?.taxable_cents) || 0), count: acc.count + ((v?.count) || 0) }), { tax: 0, taxable: 0, count: 0 });
    const label = filingScheme === 'US_SALES_TAX' ? 'Jurisdiction' : 'Member State';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Filing Worksheet</title>
      <style>body{font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding:24px;} h1,h2{margin:0 0 8px;} table{border-collapse: collapse; width:100%; margin-top:16px;} th,td{border:1px solid #ccc; padding:8px; text-align:left;} small{color:#666} tfoot td{font-weight:600}</style>
    </head><body>
      <h1>Filing Worksheet</h1>
      <small>Generated by Accounting Dashboard</small>
      <h2>Company</h2>
      <div>${company.legalName || '-'}</div>
      <div>${company.addressLine1 || ''} ${company.addressLine2 || ''}</div>
      <div>${company.city || ''} ${company.region || ''} ${company.postalCode || ''} ${company.country || ''}</div>
      <div>Tax ID: ${company.taxId || '-'}</div>
      <div>Contact: ${company.contactEmail || '-'}</div>
      <h2>Period: ${period} — Scheme: ${filingScheme}</h2>
      <table>
        <thead><tr><th>${label}</th><th>Taxable</th><th>Tax</th><th>Count</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot><tr><td>Total</td><td>${(totals.taxable/100).toLocaleString()}</td><td>${(totals.tax/100).toLocaleString()}</td><td>${totals.count}</td></tr></tfoot>
      </table>
      <p style="margin-top:16px">Use this worksheet to transcribe totals into your state portal (e-file) or retain for records.</p>
      <script>window.onload=function(){window.print(); setTimeout(()=>window.close(), 300);}</script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const computeStateTotals = () => {
    const totals: Record<string, { taxable_cents: number; tax_cents: number; count: number }> = {};
    for (const p of filingPayments) {
      if (String(p.status).toUpperCase() !== 'SUCCEEDED') continue;
      const state = p.billingAddress?.state || 'UNKNOWN';
      const tax = p.taxAmount ?? 0;
      const taxable = (p.amount ?? 0) - tax;
      totals[state] = totals[state] || { taxable_cents: 0, tax_cents: 0, count: 0 };
      totals[state].taxable_cents += taxable;
      totals[state].tax_cents += tax;
      totals[state].count += 1;
    }
    return totals;
  };









  const printGenericStateWorksheet = (stateCode: string) => {
    const stateTotals = computeStateTotals();
    const st = stateTotals[stateCode] || { taxable_cents: 0, tax_cents: 0, count: 0 };
    const period = `${filingFrom || 'Start'} to ${filingTo || 'End'}`;
    const meta = US_STATES.find(s => s.code === stateCode);
    const win = window.open('', 'PRINT', 'height=900,width=1000');
    if (!win) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${stateCode} Sales Tax Worksheet</title>
      <style>body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;} h1{margin:0 0 8px} table{border-collapse:collapse;width:100%;margin-top:16px;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} small{color:#666}</style>
    </head><body>
      <h1>${meta?.name || stateCode} Sales and Use Tax Return (Worksheet)</h1>
      <small>For reference only. Most states require e-filing via their tax portal.</small>
      <h2>Company</h2>
      <div>${company.legalName || '-'}</div>
      <div>${company.addressLine1 || ''} ${company.addressLine2 || ''}</div>
      <div>${company.city || ''} ${company.region || ''} ${company.postalCode || ''} ${company.country || ''}</div>
      <div>Tax ID: ${company.taxId || '-'}</div>
      <div>Contact: ${company.contactEmail || '-'}</div>
      <h2>Period: ${period}</h2>
      <table>
        <tr><th>Taxable sales (${stateCode})</th><td>${(st.taxable_cents/100).toLocaleString()}</td></tr>
        <tr><th>Sales and use tax due (${stateCode})</th><td>${(st.tax_cents/100).toLocaleString()}</td></tr>
        <tr><th>Transactions</th><td>${st.count}</td></tr>
      </table>
      ${meta?.portal ? `<p style=\"margin-top:16px\">Portal: <a href=\"${meta.portal}\" target=\"_blank\" rel=\"noreferrer\">${meta.portal}</a></p>` : ''}
      <script>window.onload=function(){window.print(); setTimeout(()=>window.close(), 300);}</script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const printCountryWorksheet = (countryCode: string) => {
    const period = `${filingFrom || 'Start'} to ${filingTo || 'End'}`;
    const values = (taxSummary?.byCountry || {}) as Record<string, { tax_cents: number; taxable_cents: number; count: number }>;
    const v = values[countryCode] || { tax_cents: 0, taxable_cents: 0, count: 0 } as any;
    const win = window.open('', 'PRINT', 'height=900,width=1000');
    if (!win) return;
    const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>${countryCode} VAT/Sales Worksheet</title>
      <style>body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;} h1{margin:0 0 8px} table{border-collapse:collapse;width:100%;margin-top:16px;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} small{color:#666}</style>
    </head><body>
      <h1>${countryCode} Indirect Tax Worksheet</h1>
      <small>For reference only. File via your national portal (e.g., EU OSS, CRA GST/HST).</small>
      <h2>Company</h2>
      <div>${company.legalName || '-'}</div>
      <div>${company.addressLine1 || ''} ${company.addressLine2 || ''}</div>
      <div>${company.city || ''} ${company.region || ''} ${company.postalCode || ''} ${company.country || ''}</div>
      <div>Tax ID: ${company.taxId || '-'}</div>
      <div>Contact: ${company.contactEmail || '-'}</div>
      <h2>Period: ${period}</h2>
      <table>
        <tr><th>Taxable amount (${countryCode})</th><td>${((v as any).taxable_cents/100).toLocaleString()}</td></tr>
        <tr><th>Tax due (${countryCode})</th><td>${((v as any).tax_cents/100).toLocaleString()}</td></tr>
        <tr><th>Transactions</th><td>${(v as any).count || 0}</td></tr>
      </table>
      <script>window.onload=function(){window.print(); setTimeout(()=>window.close(), 300);}</script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Accounting & Compliance
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Financial reporting, tax, and regulatory oversight snapshot.
      </Typography>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="Payments" />
        <Tab label="Tax" />
        <Tab label="Filings" />
        <Tab label="Compliance" />
        <Tab label="Terms" />
      </Tabs>
      {tab === 3 && (
        <Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Filing Packet</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="overline">Filing Period</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <TextField label="From (YYYY-MM-DD)" placeholder="2025-01-01" value={filingFrom} onChange={(e) => setFilingFrom(e.target.value)} size="small" />
                  <TextField label="To (YYYY-MM-DD)" placeholder="2025-12-31" value={filingTo} onChange={(e) => setFilingTo(e.target.value)} size="small" />
                </Stack>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={preset}
                  onChange={(_, v) => {
                    setPreset(v);
                    if (!v) return;
                    const map: any = {
                      THIS_MONTH: 'THIS_MONTH',
                      LAST_MONTH: 'LAST_MONTH',
                      THIS_QUARTER: 'THIS_QUARTER',
                      LAST_QUARTER: 'LAST_QUARTER',
                      YTD: 'YTD',
                      LAST_YEAR: 'LAST_YEAR',
                    };
                    applyPeriodPreset(map[v]);
                  }}
                  sx={{ mb: 2, flexWrap: 'wrap' }}
                >
                  <ToggleButton value="THIS_MONTH">This Month</ToggleButton>
                  <ToggleButton value="LAST_MONTH">Last Month</ToggleButton>
                  <ToggleButton value="THIS_QUARTER">This Quarter</ToggleButton>
                  <ToggleButton value="LAST_QUARTER">Last Quarter</ToggleButton>
                  <ToggleButton value="YTD">YTD</ToggleButton>
                  <ToggleButton value="LAST_YEAR">Last Year</ToggleButton>
                </ToggleButtonGroup>
                <FormControl size="small" sx={{ minWidth: 240 }}>
                  <InputLabel id="scheme-label">Scheme</InputLabel>
                  <Select labelId="scheme-label" id="scheme" value={filingScheme} label="Scheme" onChange={(e) => setFilingScheme(e.target.value as any)}>
                    <MenuItem value={'US_SALES_TAX'}>US Sales Tax (state/county)</MenuItem>
                    <MenuItem value={'EU_OSS'}>EU OSS VAT (member state)</MenuItem>
                  </Select>
                </FormControl>
                <ButtonGroup variant="contained" size="small" sx={{ mt: 2, flexWrap: 'wrap' }}>
                  <Button color="inherit" startIcon={<Refresh />} onClick={refreshFilingSummary}>Refresh</Button>
                  <Button color="primary" startIcon={<Download />} onClick={downloadJurisdictionCSV}>Summary CSV</Button>
                  <Button color="secondary" startIcon={<Download />} onClick={exportPaymentsForFiling}>Payments CSV</Button>
                </ButtonGroup>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="overline">Company Info (for cover sheet)</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Legal Name" value={company.legalName} onChange={(e) => setCompany({ ...company, legalName: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Tax ID / VAT" value={company.taxId} onChange={(e) => setCompany({ ...company, taxId: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Contact Email" value={company.contactEmail} onChange={(e) => setCompany({ ...company, contactEmail: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Address Line 1" value={company.addressLine1} onChange={(e) => setCompany({ ...company, addressLine1: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Address Line 2" value={company.addressLine2} onChange={(e) => setCompany({ ...company, addressLine2: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth size="small" label="City" value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth size="small" label="Region/State" value={company.region} onChange={(e) => setCompany({ ...company, region: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth size="small" label="Postal Code" value={company.postalCode} onChange={(e) => setCompany({ ...company, postalCode: e.target.value })} />
                  </Grid>
                </Grid>
                <ButtonGroup variant="outlined" size="small" sx={{ mt: 2, flexWrap: 'wrap' }}>
                  <Button startIcon={<Print />} onClick={printFilingCoverSheet}>Cover Sheet</Button>
                  <Button startIcon={<Save />} onClick={saveCompanyAsDefault}>Save Defaults</Button>
                  <Button startIcon={<Restore />} onClick={loadCompanyDefault}>Load Defaults</Button>
                </ButtonGroup>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="overline">US State Worksheets</Typography>
                    <Autocomplete
                      options={US_STATES}
                      getOptionLabel={(o) => `${o.code} — ${o.name}`}
                      value={US_STATES.find(s => s.code === selectedStateCode) || null}
                      onChange={(_, v) => setSelectedStateCode(v?.code || 'NY')}
                      renderInput={(params) => <TextField {...params} label="Select State" size="small" />}
                      sx={{ maxWidth: 400, mt: 1 }}
                    />
                    <ButtonGroup size="small" sx={{ mt: 2, flexWrap: 'wrap' }}>
                      <Button variant="contained" startIcon={<Map />} onClick={() => printGenericStateWorksheet(selectedStateCode)}>Print State Worksheet</Button>
                      {US_STATES.find(s => s.code === selectedStateCode)?.portal && (
                        <Button variant="outlined" startIcon={<Launch />} onClick={() => window.open(US_STATES.find(s => s.code === selectedStateCode)!.portal!, '_blank', 'noreferrer')}>Open Portal</Button>
                      )}
                    </ButtonGroup>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="overline">International (Country) Worksheets</Typography>
                    <TextField label="Country Code (ISO alpha-2)" size="small" value={selectedCountryCode} onChange={(e) => setSelectedCountryCode(e.target.value.toUpperCase())} sx={{ maxWidth: 240, mt: 1 }} />
                    <ButtonGroup size="small" sx={{ mt: 2, flexWrap: 'wrap' }}>
                      <Button variant="contained" startIcon={<Public />} onClick={() => printCountryWorksheet(selectedCountryCode)}>Print Country Worksheet</Button>
                    </ButtonGroup>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      For EU OSS, use scheme EU_OSS and the jurisdiction summary CSV; for Canada, file GST/HST per CRA portal.
                    </Alert>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Alert severity="info" sx={{ mt: 2 }}>
              This packet mirrors common filings used by SaaS: US Sales Tax returns (state/county totals) and EU OSS VAT returns (member-state totals). Attach the CSV summaries and payments export when filing via your tax portal or provider.
            </Alert>
          </Paper>
        </Box>
      )}

      {tab === 0 && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline">Revenue (USD)</Typography>
                <Typography variant="h5">{((overview?.totals?.revenue_cents || 0) / 100).toLocaleString()}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline">Tax Collected</Typography>
                <Typography variant="h5">{((overview?.totals?.tax_cents || 0) / 100).toLocaleString()}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline">Payments</Typography>
                <Typography variant="h5">{overview?.totals?.paymentsCount || 0}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Recent Payments</Typography>
            <Divider sx={{ mb: 1 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Tax</TableCell>
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(overview?.recentPayments || []).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{p.stripeInvoiceId}</TableCell>
                    <TableCell align="right">{(p.amount ?? 0) / 100}</TableCell>
                    <TableCell>{((p.taxAmount ?? 0) / 100).toFixed(2)} ({((p.taxRate ?? 0) * 100).toFixed(2)}%)</TableCell>
                    <TableCell>{p.jurisdiction}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {p.stripeInvoiceId && (
                          <Tooltip title="View in Stripe Dashboard">
                            <IconButton 
                              size="small"
                              color="primary"
                              onClick={() => window.open(`https://dashboard.stripe.com/invoices/${p.stripeInvoiceId}`, '_blank')}
                            >
                              <Receipt fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Tax by Jurisdiction</Typography>
            <Divider sx={{ mb: 1 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {overview?.taxByJurisdiction && Object.entries(overview.taxByJurisdiction).map(([j, v]: any) => (
                <Chip key={j} label={`${j}: ${((v as number) / 100).toLocaleString()}`} />
              ))}
            </Stack>
          </Paper>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField label="From (YYYY-MM-DD)" placeholder="2025-01-01" value={from} onChange={(e) => setFrom(e.target.value)} size="small" />
            <TextField label="To (YYYY-MM-DD)" placeholder="2025-12-31" value={to} onChange={(e) => setTo(e.target.value)} size="small" />
            <Button variant="contained" onClick={exportPayments}>Export CSV</Button>
            <Button variant="outlined" onClick={fetchPayments}>Refresh</Button>
          </Stack>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tax</TableCell>
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Residency</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{p.stripeInvoiceId}</TableCell>
                    <TableCell align="right">{(p.amount ?? 0) / 100}</TableCell>
                    <TableCell>{p.currency}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{((p.taxAmount ?? 0) / 100).toFixed(2)} ({((p.taxRate ?? 0) * 100).toFixed(2)}%)</TableCell>
                    <TableCell>{p.taxJurisdiction}</TableCell>
                    <TableCell>{p.user?.email}</TableCell>
                    <TableCell>{p.user?.taxInformation?.taxResidency}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {p.stripeInvoiceId && (
                          <Tooltip title="View in Stripe Dashboard">
                            <IconButton 
                              size="small"
                              color="primary"
                              onClick={() => window.open(`https://dashboard.stripe.com/invoices/${p.stripeInvoiceId}`, '_blank')}
                              sx={{
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              <Receipt />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Payment Details">
                          <IconButton 
                            size="small"
                            color="info"
                            onClick={() => {
                              // Show payment details in a modal or navigate to details page
                              alert(`Payment Details for ${p.id}`);
                            }}
                            sx={{
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              },
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Tax Summary</Typography>
            <Divider sx={{ mb: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="overline">By Jurisdiction</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Jurisdiction</TableCell>
                      <TableCell align="right">Tax</TableCell>
                      <TableCell align="right">Taxable</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {taxSummary?.byJurisdiction && Object.entries(taxSummary.byJurisdiction).map(([k, v]: any) => (
                      <TableRow key={k}>
                        <TableCell>{k}</TableCell>
                        <TableCell align="right">{((v.tax_cents || 0) / 100).toLocaleString()}</TableCell>
                        <TableCell align="right">{((v.taxable_cents || 0) / 100).toLocaleString()}</TableCell>
                        <TableCell align="right">{v.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="overline">By Country</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Country</TableCell>
                      <TableCell align="right">Tax</TableCell>
                      <TableCell align="right">Taxable</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {taxSummary?.byCountry && Object.entries(taxSummary.byCountry).map(([k, v]: any) => (
                      <TableRow key={k}>
                        <TableCell>{k}</TableCell>
                        <TableCell align="right">{((v.tax_cents || 0) / 100).toLocaleString()}</TableCell>
                        <TableCell align="right">{((v.taxable_cents || 0) / 100).toLocaleString()}</TableCell>
                        <TableCell align="right">{v.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {tab === 4 && (
        <Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Compliance Events</Typography>
            <Divider sx={{ mb: 1 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.eventType}</TableCell>
                    <TableCell>{e.severity}</TableCell>
                    <TableCell>{e.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {tab === 5 && (
        <Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Terms & Privacy Acceptance</Typography>
            <Divider sx={{ mb: 1 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Terms Version</TableCell>
                  <TableCell>Terms Accepted At</TableCell>
                  <TableCell>Privacy Version</TableCell>
                  <TableCell>Privacy Accepted At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {termsRows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.termsVersionAccepted || '-'}</TableCell>
                    <TableCell>{r.termsAcceptedAt ? new Date(r.termsAcceptedAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>{r.privacyPolicyVersionAccepted || '-'}</TableCell>
                    <TableCell>{r.privacyPolicyAcceptedAt ? new Date(r.privacyPolicyAcceptedAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={async () => {
                        const res = await api.get(endpoints.accounting.userConsentHistory(r.id), { params: { includePII: false } });
                        const rows = res.data?.data?.consents || [];
                        const header = Object.keys(rows[0] || {}).join(',');
                        const csv = [header, ...rows.map((x: any) => Object.values(x).map((v: any) => JSON.stringify(v ?? '')).join(','))].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `consent_history_${r.email}.csv`; a.click();
                        URL.revokeObjectURL(url);
                      }}>Export History</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AccountingDashboard;



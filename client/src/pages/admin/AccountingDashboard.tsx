import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Stack, TextField } from '@mui/material';
import api, { endpoints } from '@/services/api';

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
    kycStatus?: string;
    taxInformation?: any;
    businessProfile?: any;
  }
}

const AccountingDashboard: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const fetchPayments = async () => {
    const res = await api.get(endpoints.accounting.payments(), { params: { limit: 50 } });
    setPayments(res.data?.data?.payments || []);
  };

  useEffect(() => {
    fetchPayments();
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Accounting Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Restricted to Accounting role. Shows payments with tax and KYC context only.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="From (YYYY-MM-DD)"
          placeholder="2025-01-01"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          size="small"
        />
        <TextField
          label="To (YYYY-MM-DD)"
          placeholder="2025-12-31"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          size="small"
        />
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AccountingDashboard;



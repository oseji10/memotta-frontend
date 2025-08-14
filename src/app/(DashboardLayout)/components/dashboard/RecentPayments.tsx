'use client';
import { useEffect, useState } from 'react';
import {
  Typography, Box,
  Table, TableBody, TableCell, TableHead, TableRow, Chip
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import api from '@/lib/api';

const statusColorMap: Record<string, string> = {
  payment_pending: 'warning.main',
  payment_completed: 'success.main',
  failed: 'error.main',
  refunded: 'info.main',
};

interface PaymentUser {
  firstName: string;
  lastName: string;
  otherNames: string;
  applicationType: number;
}

interface Payment {
  id: number;
  rrr: string;
  amount: string;
  status: string;
  users: PaymentUser;
}

const RecentPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/all-payments');
        setPayments(response.data);
      } catch (err) {
        console.error('Failed to fetch recent payments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <DashboardCard title="Recent Payments" sx={{ p: 2 }}>
      <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
        <Table
          aria-label="recent payments table"
          sx={{ whiteSpace: 'nowrap', mt: 2 }}
        >
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="subtitle2" fontWeight={600}>SN</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight={600}>Name</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight={600}>RRR</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight={600}>Application Type</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight={600}>Status</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Amount</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2">No recent payments found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment, index) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {`${payment.users.firstName} ${payment.users.lastName}  ${payment.users.otherNames}`}
                        </Typography>
                        <Typography color="textSecondary" sx={{ fontSize: '13px' }}>
                          {payment.applicationId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {payment.rrr}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {
  payment.users.applicationType === 1
    ? 'ND Nursing'
    : payment.users.applicationType === 2
    ? 'Basic Midwifery'
    : payment.users.applicationType === 3
    ? 'Post-Basic Nursing'
    : 'Other'
}

                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      sx={{
                        px: '4px',
                        backgroundColor: statusColorMap[payment.status] || 'grey.500',
                        color: '#fff',
                        textTransform: 'capitalize',
                      }}
                      size="small"
                      label={payment.status.replace('_', ' ')}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6">
                      ₦{Number(payment.amount).toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </DashboardCard>
  );
};

export default RecentPayments;

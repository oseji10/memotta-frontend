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

const UpcomingAssessments = () => {
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
    <DashboardCard title="Available Assessments" sx={{ p: 2 }}>
      <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
        <Table
          aria-label="recent payments table"
          sx={{ whiteSpace: 'nowrap', mt: 2 }}
        >
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="subtitle2" fontWeight={600}>SN</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight={600}>Assessment Type</Typography></TableCell>
              {/* <TableCell><Typography variant="subtitle2" fontWeight={600}>RRR</Typography></TableCell> */}
              {/* <TableCell><Typography variant="subtitle2" fontWeight={600}>Application Type</Typography></TableCell> */}
              <TableCell><Typography variant="subtitle2" fontWeight={600}>Status</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Action</Typography></TableCell>
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
                  <Typography variant="body2">No recent upcoming assignments assessments found.</Typography>
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
                 
                  
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </DashboardCard>
  );
};

export default UpcomingAssessments;

import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    IconButton,
    CircularProgress,
    Pagination,
    Alert,
    Chip,
    LinearProgress
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PaidIcon from '@mui/icons-material/Paid';
import VerifiedIcon from '@mui/icons-material/Verified';

interface Payment {
    paymentId: number;
    studentId: string;
    courseId: number;
    courseCost: string | null;
    amountPaid: string | null;
    transactionReference: string | null;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
    paymentMethod: string;
    created_at: string;
    updated_at: string;
    course: {
        courseId: number;
        courseName: string;
        cost: string;
        duration: string;
    };
}

const MyPayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const perPage = 10;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/my-payments');
            const data = Array.isArray(response.data) ? response.data : [response.data];
            setPayments(data);
            setTotalPages(Math.ceil(data.length / perPage));
            setTotalRecords(data.length);
            setError(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch payments');
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const downloadCourseReceipt = async (paymentId: number) => {
        setIsDownloading(true);
        setDownloadProgress(0);
        
        try {
            const response = await api.get(`/payment/receipt/${paymentId}`, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setDownloadProgress(percentCompleted);
                    }
                }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `CourseReceipt-${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to download receipt'
            );
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    const handlePayOnline = (paymentId: number) => {
        // Open payment page in a new tab
        window.open(`${process.env.NEXT_PUBLIC_API_PAYMENT_GATEWAY}/${paymentId}`, '_blank');
    };

    const handleVerifyPayment = async (paymentId: number) => {
        setIsVerifying(true);
        
        try {
            await api.post('/payment/verify', {
                paymentId: paymentId
            });
            // Refresh payments data after verification
            await fetchData();
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to verify payment'
            );
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <DashboardCard title="My Course Payments">
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                        <Table
                            aria-label="Payments table"
                            sx={{
                                whiteSpace: "nowrap",
                                mt: 2
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Course
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Amount
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Reference
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Payment Status
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Date
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Actions
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payments && payments.length > 0 ? (
                                    payments.slice((currentPage - 1) * perPage, currentPage * perPage).map((payment) => (
                                        <TableRow key={payment.paymentId}>
                                            <TableCell>
                                                <Typography>
                                                    {payment.course.courseName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {payment.course.duration}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    ₦{payment.amountPaid || payment.course.cost}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    {payment.transactionReference || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={payment.paymentStatus}
                                                    color={
                                                        payment.paymentStatus === 'PAID' ? 'success' : 
                                                        payment.paymentStatus === 'FAILED' ? 'error' : 'warning'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    {formatDate(payment.created_at)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {payment.paymentStatus === 'PAID' && (
                                                    
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<PictureAsPdfIcon />}
                                                        onClick={() => downloadCourseReceipt(payment.paymentId)}
                                                        disabled={isDownloading}
                                                    >
                                                        Receipt
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No payment records found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                    
                    {isDownloading && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress 
                                variant={downloadProgress > 0 ? "determinate" : "indeterminate"}
                                value={downloadProgress}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {downloadProgress > 0 ? `${downloadProgress}% downloaded` : 'Preparing download...'}
                            </Typography>
                        </Box>
                    )}

                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                        <Typography variant="body2">
                            Showing {Math.min(payments.length, perPage)} of {totalRecords} payments
                        </Typography>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </>
            )}
        </DashboardCard>
    );
};

export default MyPayments;
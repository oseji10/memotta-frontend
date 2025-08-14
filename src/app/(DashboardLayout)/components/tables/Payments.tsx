import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    CircularProgress,
    Pagination,
    Alert,
    Chip,
    LinearProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Stack
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VerifiedIcon from '@mui/icons-material/Verified';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Payment {
    paymentId: number;
    studentId: string;
    courseId: number;
    courseCost: string | null;
    amountPaid: string | null;
    transactionReference: string | null;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CONFIRMED';
    paymentMethod: string;
    created_at: string;
    updated_at: string;
    course: {
        courseId: number;
        courseName: string;
        cost: string;
        duration: string;
    };
    users: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
}

const Payments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [filters, setFilters] = useState({
        courseId: '',
        paymentStatus: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/payments/all');
            const data = Array.isArray(response.data) ? response.data : [response.data];
            setPayments(data);
            setFilteredPayments(data);
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
    }, []);

    useEffect(() => {
        // Apply filters whenever payments or filters change
        let result = [...payments];
        
        if (filters.courseId) {
            result = result.filter(payment => payment.courseId.toString() === filters.courseId);
        }
        
        if (filters.paymentStatus) {
            result = result.filter(payment => payment.paymentStatus === filters.paymentStatus);
        }
        
        setFilteredPayments(result);
        setTotalPages(Math.ceil(result.length / perPage));
        setTotalRecords(result.length);
        setCurrentPage(1); // Reset to first page when filters change
    }, [filters, payments, perPage]);

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
            link.setAttribute('download', `PaymentReceipt-${paymentId}.pdf`);
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

    const handleConfirmPayment = async (paymentId: number) => {
        setIsConfirming(true);
        try {
            await api.put('/payment/confirm', {
                paymentId: paymentId
            });
            // Refresh payments data after confirmation
            await fetchData();
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to confirm payment'
            );
        } finally {
            setIsConfirming(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name as string]: value
        }));
    };

    const handlePerPageChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Export to Excel
    const exportToExcel = () => {
        const data = filteredPayments.map(payment => ({
            'Student': `${payment.users.firstName} ${payment.users.lastName}`,
            'Phone': payment.users.phoneNumber || 'N/A',
            'Email': payment.users.email,
            'Course': payment.course.courseName,
            'Amount': payment.amountPaid || payment.course.cost,
            'Reference': payment.transactionReference || 'N/A',
            'Status': payment.paymentStatus,
            'Date': formatDate(payment.created_at)
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        XLSX.writeFile(workbook, "Payments.xlsx");
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        
        // Title
        doc.text('Payments Report', 14, 15);
        
        // Table data
        const data = filteredPayments.map(payment => [
            `${payment.users.firstName} ${payment.users.lastName}`,
            payment.users.phoneNumber || 'N/A',
            payment.users.email,
            payment.course.courseName,
            payment.amountPaid || payment.course.cost,
            payment.transactionReference || 'N/A',
            payment.paymentStatus,
            formatDate(payment.created_at)
        ]);

        // Table headers
        const headers = [
            'Student', 
            'Phone', 
            'Email', 
            'Course', 
            'Amount', 
            'Reference', 
            'Status', 
            'Date'
        ];

        // Add table
        (doc as any).autoTable({
            head: [headers],
            body: data,
            startY: 20,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        doc.save('Payments.pdf');
    };

    // Get unique courses for filter dropdown
    const uniqueCourses = Array.from(new Set(payments.map(payment => payment.course.courseId)))
        .map(id => {
            const payment = payments.find(p => p.course.courseId === id);
            return {
                id,
                name: payment?.course.courseName || `Course ${id}`
            };
        });

    return (
        <DashboardCard title="Payments Management">
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Filters Section */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="course-filter-label">Course</InputLabel>
                            <Select
                                labelId="course-filter-label"
                                id="course-filter"
                                name="courseId"
                                value={filters.courseId}
                                label="Course"
                                onChange={handleFilterChange}
                            >
                                <MenuItem value="">All Courses</MenuItem>
                                {uniqueCourses.map(course => (
                                    <MenuItem key={course.id} value={course.id.toString()}>
                                        {course.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="status-filter-label">Payment Status</InputLabel>
                            <Select
                                labelId="status-filter-label"
                                id="status-filter"
                                name="paymentStatus"
                                value={filters.paymentStatus}
                                label="Payment Status"
                                onChange={handleFilterChange}
                            >
                                <MenuItem value="">All Statuses</MenuItem>
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="PAID">Paid</MenuItem>
                                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                                <MenuItem value="FAILED">Failed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Export Buttons */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={exportToExcel}
                    color="success"
                >
                    Export to Excel
                </Button>
                <Button
                    variant="contained"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={exportToPDF}
                    color="error"
                >
                    Export to PDF
                </Button>
            </Stack>

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
                                            Student
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Phone
                                        </Typography>
                                    </TableCell>
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
                                {filteredPayments && filteredPayments.length > 0 ? (
                                    filteredPayments.slice((currentPage - 1) * perPage, currentPage * perPage).map((payment) => (
                                        <TableRow key={payment.paymentId}>
                                            <TableCell>
                                                <Typography>
                                                    {payment.users.firstName} {payment.users.lastName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {payment.users.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    {payment.users.phoneNumber || 'N/A'}
                                                </Typography>
                                            </TableCell>
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
                                                    {payment.amountPaid || payment.course.cost}
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
                                                        payment.paymentStatus === 'CONFIRMED' ? 'success' : 
                                                        payment.paymentStatus === 'PAID' ? 'primary' : 
                                                        payment.paymentStatus === 'PENDING' ? 'warning' : 'error'
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
                                                {payment.paymentStatus === 'PENDING' && (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<VerifiedIcon />}
                                                        onClick={() => handleConfirmPayment(payment.paymentId)}
                                                        disabled={isConfirming}
                                                        color="success"
                                                    >
                                                        Confirm
                                                    </Button>
                                                )}
                                                {(payment.paymentStatus === 'PAID' || payment.paymentStatus === 'CONFIRMED') && (
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
                                        <TableCell colSpan={8} align="center">
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
                        <Box display="flex" alignItems="center">
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                Rows per page:
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 60 }}>
                                <Select
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                    displayEmpty
                                    inputProps={{ 'aria-label': 'Rows per page' }}
                                >
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                    <MenuItem value={50}>50</MenuItem>
                                </Select>
                            </FormControl>
                            <Typography variant="body2" sx={{ ml: 2 }}>
                                Showing {Math.min((currentPage - 1) * perPage + 1, totalRecords)}-
                                {Math.min(currentPage * perPage, totalRecords)} of {totalRecords} payments
                            </Typography>
                        </Box>
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

export default Payments;
import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    TextField,
    IconButton,
    CircularProgress,
    Pagination,
    Alert,
    Chip,
    Avatar,
    Paper,
    Grid,
    LinearProgress
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import DownloadIcon from '@mui/icons-material/Download';
import ClearIcon from '@mui/icons-material/Clear';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface ExamSlip {
    id: number;
    applicationId: string;
    jambId: string;
    dateOfBirth: string;
    gender: string;
    batch: string;
    status: string;
    created_at: string | null;
    updated_at: string | null;
    users: {
        firstName: string;
        lastName: string;
        otherNames: string | null;
        email: string;
        phoneNumber: string;
    };
}

const MyExamSlips = () => {
const [examSlips, setExamSlips] = useState<ExamSlip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const perPage = 10;

    const statusOptions = [
        { value: 'pending_payment', label: 'Pending Payment', color: 'warning' },
        { value: 'payment_verified', label: 'Payment Verified', color: 'info' },
        { value: 'admitted', label: 'Admitted', color: 'success' },
        { value: 'rejected', label: 'Rejected', color: 'error' }
    ];

   const fetchData = async () => {
    setIsLoading(true);
    try {
        const response = await api.get('/my-slips');
        // Handle both array and single object responses
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setExamSlips(data);
        setTotalPages(1);
        setTotalRecords(data.length);
        setError(null);
    } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch exam slips');
        console.error('Fetch error:', error);
    } finally {
        setIsLoading(false);
    }
};

    useEffect(() => {
        fetchData();
    }, [currentPage, searchQuery]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatFullName = (user: any) => {
        return `${user.firstName} ${user.lastName}${user.otherNames ? ' ' + user.otherNames : ''}`;
    };

    const getStatusColor = (status: string) => {
        const foundStatus = statusOptions.find(option => option.value === status);
        return foundStatus ? foundStatus.color : 'default';
    };

    const getStatusLabel = (status: string) => {
        const foundStatus = statusOptions.find(option => option.value === status);
        return foundStatus ? foundStatus.label : status;
    };

    const downloadExamSlip = async (applicationId: string) => {
        setIsDownloading(true);
        setDownloadProgress(0);
        
        try {
            const response = await api.get(`/application/slip/${applicationId}`, {
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
            link.setAttribute('download', `ExamSlip-${applicationId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Update print count in local state
            setExamSlips(prevSlips => prevSlips.map(slip => 
                slip.applicationId === applicationId 
                    ? { ...slip, slipPrintCount: (parseInt(slip.slipPrintCount) + 1).toString() } 
                    : slip
            ));
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to download exam slip'
            );
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    return (
        <DashboardCard title="My Exam Slips">
            <Box mb={2} display="flex" justifyContent="flex-end">
                <Box display="flex" gap={2} alignItems="center">
                    <TextField
                        variant="outlined"
                        placeholder="Search by application ID..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        size="small"
                        InputProps={{
                            endAdornment: searchQuery && (
                                <IconButton 
                                    size="small" 
                                    onClick={() => setSearchQuery("")}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            ),
                        }}
                    />
                    <Button 
                        variant="outlined" 
                        onClick={() => fetchData()}
                        disabled={isLoading}
                    >
                        Search
                    </Button>
                </Box>
            </Box>

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
                            aria-label="Exam slips table"
                            sx={{
                                whiteSpace: "nowrap",
                                mt: 2
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Application ID
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Candidate
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Batch
                                        </Typography>
                                    </TableCell>
                                    {/* <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Status
                                        </Typography>
                                    </TableCell> */}
                                    {/* <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Last Updated
                                        </Typography>
                                    </TableCell> */}
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Actions
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                
    {examSlips && examSlips.length > 0 ? (
        examSlips.map((slip) => (
                                        <TableRow key={slip.id}>
                                            <TableCell>
                                                <Typography>
                                                    {slip.applicationId}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    {formatFullName(slip.users)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    {slip.batch}
                                                </Typography>
                                            </TableCell>
                                            {/* <TableCell>
                                                <Chip 
                                                    label={getStatusLabel(slip.status)}
                                                    color={getStatusColor(slip.status) as any}
                                                    size="small"
                                                />
                                            </TableCell> */}
                                            {/* <TableCell>
                                                <Typography>
                                                    {formatDate(slip.updated_at)}
                                                </Typography>
                                            </TableCell> */}
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<PictureAsPdfIcon />}
                                                    onClick={() => downloadExamSlip(slip.applicationId)}
                                                    disabled={isDownloading}
                                                >
                                                    Download
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                 ))
    ) : (
        <TableRow>
            <TableCell colSpan={6} align="center">
                No exam slips found
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
                            Showing {examSlips.length} of {totalRecords} exam slips
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

export default MyExamSlips;
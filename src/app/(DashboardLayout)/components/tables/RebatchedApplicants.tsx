import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    TextField,
    Modal,
    IconButton,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Pagination,
    LinearProgress,
    Alert,
    Chip,
    Avatar,
    Collapse,
    Paper,
    Grid,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface RebatchedApplication {
    id: number;
    applicationId: string;
    oldBatchId: string;
    newBatchId: string;
    rebatchedBy: number;
    created_at: string;
    updated_at: string;
    applicant: {
        id: number;
        applicationId: string;
        jambId: string;
        dateOfBirth: string;
        gender: string;
        alternatePhoneNumber: string | null;
        licenceId: string | null;
        batch: string;
        applicationType: number;
        userId: number;
        isActive: string;
        slipPrintCount: string;
        admissionPrintCount: string;
        isPresent: string;
        status: string;
        created_at: string | null;
        updated_at: string;
        deleted_at: string | null;
        users: {
            id: number;
            firstName: string;
            lastName: string;
            otherNames: string | null;
            email: string;
            phoneNumber: string;
            email_verified_at: string | null;
            role: number;
            applicationType: number;
            jambId: string;
            remember_token: string | null;
            created_at: string;
            updated_at: string;
            deleted_at: string | null;
        };
    };
}

const RebatchedApplicants = () => {
    const [applications, setApplications] = useState<RebatchedApplication[]>([]);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [currentApplication, setCurrentApplication] = useState<RebatchedApplication | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const perPage = 10;

   const fetchData = async () => {
    setIsLoading(true);
    try {
        const response = await api.get('/rebatched', {
            params: { 
                page: currentPage, 
                per_page: perPage,
                search: searchQuery || undefined,
            }
        });

        setApplications(response.data?.data || []);
        setTotalPages(response.data?.last_page || 1);
        setTotalRecords(response.data?.total || 0);
        setError(null);
    } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch rebatched applications');
        console.error('Fetch error:', error);
        setApplications([]);
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

    const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchData(); // Trigger the search
};

    const handleOpenViewModal = (application: RebatchedApplication) => {
        setCurrentApplication(application);
        setViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setViewModalOpen(false);
        setCurrentApplication(null);
    };

    const handleRowExpand = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'not_submitted':
                return 'default';
            case 'payment_pending':
                return 'warning';
            case 'payment_completed':
                return 'success';
            default:
                return 'default';
        }
    };

    const formatFullName = (user: any) => {
        return `${user.firstName} ${user.lastName}${user.otherNames ? ' ' + user.otherNames : ''}`;
    };

    return (
        <DashboardCard title="Rebatched Candidates">
            <Box mb={2}>
<form onSubmit={handleSearch}>
    <Box display="flex" alignItems="center" gap={2}>
        <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by application ID, JAMB ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
                endAdornment: searchQuery && (
                    <IconButton onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                        fetchData();
                    }}>
                        <ClearIcon />
                    </IconButton>
                ),
            }}
        />
        <Button 
            type="submit"
            variant="contained" 
            disabled={isLoading}
            sx={{ height: '56px' }}
        >
            Search
        </Button>
    </Box>
</form>
            </Box>

            {error && (
                <Box mb={2}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                        <Table
                            aria-label="Rebatched applications table"
                            sx={{
                                whiteSpace: "nowrap",
                                mt: 2
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell />
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
                                            JAMB ID
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Old Batch
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            New Batch
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Rebatched By
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
                                {applications.length > 0 ? (
                                    applications.map((application) => (
                                        <>
                                            <TableRow key={application.id}>
                                                <TableCell>
                                                    <IconButton
                                                        aria-label="expand row"
                                                        size="small"
                                                        onClick={() => handleRowExpand(application.id)}
                                                    >
                                                        {expandedRow === application.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {application.applicant.applicationId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {formatFullName(application.applicant.users)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {application.applicant.jambId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {application.oldBatchId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {application.newBatchId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {/* <Chip 
                                                        label={application.applicant.status.replace('_', ' ')} 
                                                        color={getStatusColor(application.applicant.status)}
                                                        size="small"
                                                    /> */}
                                                    {application.rebatched_by?.firstName} {application.rebatched_by?.lastName}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleOpenViewModal(application)}>
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                                                    <Collapse in={expandedRow === application.id} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 1 }}>
                                                            <Typography variant="h6" gutterBottom component="div">
                                                                Rebatch Details
                                                            </Typography>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12} md={6}>
                                                                    <Paper elevation={0} sx={{ p: 2 }}>
                                                                        <Typography variant="subtitle1" gutterBottom>
                                                                            Personal Information
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Full Name:</strong> {formatFullName(application.applicant.users)}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Date of Birth:</strong> {formatDate(application.applicant.dateOfBirth)}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Gender:</strong> {application.applicant.gender}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Email:</strong> {application.applicant.users.email}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Phone:</strong> {application.applicant.users.phoneNumber}
                                                                        </Typography>
                                                                    </Paper>
                                                                </Grid>
                                                                <Grid item xs={12} md={6}>
                                                                    <Paper elevation={0} sx={{ p: 2 }}>
                                                                        <Typography variant="subtitle1" gutterBottom>
                                                                            Batch Information
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Rebatch Date:</strong> {formatDate(application.created_at)}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Old Batch:</strong> {application.oldBatchId}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>New Batch:</strong> {application.newBatchId}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Status:</strong> 
                                                                            <Chip 
                                                                                label={application.applicant.status.replace('_', ' ')} 
                                                                                color={getStatusColor(application.applicant.status)}
                                                                                size="small"
                                                                                sx={{ ml: 1 }}
                                                                            />
                                                                        </Typography>
                                                                    </Paper>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No rebatched applications found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Showing {applications.length} of {totalRecords} rebatched applications
                        {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                    </Typography>
                </>
            )}

            {/* View Application Modal */}
            <Modal
                open={viewModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="view-modal-title"
                aria-describedby="view-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 800 },
                    maxWidth: '95%',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: { xs: 2, sm: 4 },
                    borderRadius: 2,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}>
                    {currentApplication && (
                        <>
                            <Typography id="view-modal-title" variant="h6" component="h2" fontWeight={600} mb={2}>
                                Rebatch Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Personal Information
                                        </Typography>
                                        <Typography>
                                            <strong>Full Name:</strong> {formatFullName(currentApplication.applicant.users)}
                                        </Typography>
                                        <Typography>
                                            <strong>Date of Birth:</strong> {formatDate(currentApplication.applicant.dateOfBirth)}
                                        </Typography>
                                        <Typography>
                                            <strong>Gender:</strong> {currentApplication.applicant.gender}
                                        </Typography>
                                        <Typography>
                                            <strong>Email:</strong> {currentApplication.applicant.users.email}
                                        </Typography>
                                        <Typography>
                                            <strong>Phone:</strong> {currentApplication.applicant.users.phoneNumber}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Batch Information
                                        </Typography>
                                        <Typography>
                                            <strong>Application ID:</strong> {currentApplication.applicant.applicationId}
                                        </Typography>
                                        <Typography>
                                            <strong>JAMB ID:</strong> {currentApplication.applicant.jambId}
                                        </Typography>
                                        <Typography>
                                            <strong>Old Batch:</strong> {currentApplication.oldBatchId}
                                        </Typography>
                                        <Typography>
                                            <strong>New Batch:</strong> {currentApplication.newBatchId}
                                        </Typography>
                                        <Typography>
                                            <strong>Rebatch Date:</strong> {formatDate(currentApplication.created_at)}
                                        </Typography>
                                        <Typography>
                                            <strong>Status:</strong> 
                                            <Chip 
                                                label={currentApplication.applicant.status.replace('_', ' ')} 
                                                color={getStatusColor(currentApplication.applicant.status)}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button 
                                    onClick={handleCloseModal} 
                                    color="primary"
                                    variant="contained"
                                >
                                    Close
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>
        </DashboardCard>
    );
};

export default RebatchedApplicants;
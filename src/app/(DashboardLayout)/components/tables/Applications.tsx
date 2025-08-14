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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

interface Application {
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
    updated_at: string | null;
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
}

interface FilterOptions {
    batches: string[];
    statuses: { value: string; label: string }[];
}

const Applications = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [batchChangeModalOpen, setBatchChangeModalOpen] = useState(false);
    const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [batchFilter, setBatchFilter] = useState<string>("");
const [availableBatches, setAvailableBatches] = useState<string[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>("");
    const perPage = 10;

    const filterOptions: FilterOptions = {
        batches: ['1A', '1B'], // Updated based on API response and edit modal options
        statuses: [
            { value: 'not_submitted', label: 'Account Created' },
            { value: 'payment_pending', label: 'Submitted, Payment Pending' },
            { value: 'payment_completed', label: 'Payment Completed' }
        ]
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/applications', {
                params: { 
                    page: currentPage, 
                    per_page: perPage,
                    search: searchQuery || undefined,
                    status: statusFilter || undefined,
                    batch: batchFilter || undefined
                }
            });

            if (Array.isArray(response.data)) {
                setApplications(response.data);
                setTotalPages(1);
                setTotalRecords(response.data.length);
                
                // Update filter options with unique batches from response
                const batches = [...new Set(response.data.map((app: Application) => app.batch).filter(b => b))] as string[];
                filterOptions.batches = batches.length > 0 ? batches : filterOptions.batches;
            } else {
                setApplications(response.data?.data || []);
                setTotalPages(response.data?.last_page || 1);
                setTotalRecords(response.data?.total || 0);
                
                // Update filter options with unique batches from response
                const batches = [...new Set(response.data?.data?.map((app: Application) => app.batch).filter(b => b))] as string[];
                filterOptions.batches = batches.length > 0 ? batches : filterOptions.batches;
            }
            setError(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch applications');
            console.error('Fetch error:', error);
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    };

   const fetchAvailableBatches = async () => {
    try {
        const response = await api.get('/all-batches');
        if (response.data && Array.isArray(response.data)) {
            // Extract just the batchId values from the response
            const batchIds = response.data.map(batch => batch.batchId);
            setAvailableBatches(batchIds);
        }
    } catch (error) {
        console.error('Error fetching batches:', error);
    }
};


const fetchAvailableBatchesMain = async () => {
    try {
        const response = await api.get('/batches'); // Or your specific endpoint
        if (response.data && Array.isArray(response.data)) {
            // If response is an array of batch objects with batchId property
            const batchIds = response.data.map(batch => batch.batchId);
            setAvailableBatches(batchIds);
            
            // Also update the filterOptions.batches
            filterOptions.batches = batchIds.length > 0 ? batchIds : [];
        } else if (response.data && response.data.data) {
            // If response is paginated
            const batchIds = response.data.data.map(batch => batch.batchId);
            setAvailableBatches(batchIds);
            filterOptions.batches = batchIds.length > 0 ? batchIds : [];
        }
    } catch (error) {
        console.error('Error fetching batches:', error);
        // Optionally set some default batches if the API fails
        setAvailableBatches([]);
        filterOptions.batches = [];
    }
};

    useEffect(() => {
        fetchData();
        fetchAvailableBatches();
        fetchAvailableBatchesMain();
    }, [currentPage]); // Only trigger fetch on page change

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page on new search
        fetchData();
    };

    const handleOpenEditModal = (application: Application) => {
        setCurrentApplication(application);
        setOpenModal(true);
    };

    const handleOpenViewModal = (application: Application) => {
        setCurrentApplication(application);
        setViewModalOpen(true);
    };

    const handleOpenBatchChangeModal = (application: Application) => {
        setCurrentApplication(application);
        setSelectedBatch(application.batch);
        setBatchChangeModalOpen(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setViewModalOpen(false);
        setBatchChangeModalOpen(false);
        setCurrentApplication(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (!currentApplication) return;
        
        setIsSubmitting(true);
        try {
            const payload = {
                batch: currentApplication.batch,
                status: currentApplication.status,
                dateOfBirth: currentApplication.dateOfBirth,
                gender: currentApplication.gender,
                alternatePhoneNumber: currentApplication.alternatePhoneNumber,
                licenceId: currentApplication.licenceId,
                isActive: currentApplication.isActive,
                isPresent: currentApplication.isPresent,
            };
            
            const response = await api.put(`/applications/${currentApplication.id}`, payload);
            if (response.status >= 200 && response.status < 300) {
                const updatedApplications = applications.map(a => 
                    a.id === currentApplication.id ? response.data : a
                );
                setApplications(updatedApplications);
                setError(null);
                handleCloseModal();
            } else {
                throw new Error(response.data?.message || 'Update failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to update application'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBatchChangeSubmit = async () => {
        if (!currentApplication || !selectedBatch) return;
        
        setIsSubmitting(true);
        try {
            const response = await api.put(`/application/${currentApplication.applicationId}/change-batch`, {
                batch: selectedBatch
            });
            
            if (response.status >= 200 && response.status < 300) {
                const updatedApplications = applications.map(a => 
                    a.id === currentApplication.id ? response.data : a
                );
                setApplications(updatedApplications);
                setError(null);
                handleCloseModal();
                 window.location.reload();
            } else {
                throw new Error(response.data?.message || 'Batch change failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to change batch'
            );
        } finally {
            setIsSubmitting(false);
        }
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
        return `${user?.firstName} ${user?.lastName}${user?.otherNames ? ' ' + user?.otherNames : ''}`;
    };

    return (
        <DashboardCard title="Applications">
            <Box mb={2} display="flex"  alignItems="left">
                <Box mb={2} display="flex" justifyContent="space-between" alignItems="left" gap={2}>
                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>Filter by Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Filter by Status"
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            {filterOptions.statuses.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                                  <FormControl sx={{ minWidth: 200, flex: 1 }}>
    <InputLabel>Filter by Batch</InputLabel>
    <Select
        value={batchFilter}
        onChange={(e) => setBatchFilter(e.target.value)}
        label="Filter by Batch"
    >
        <MenuItem value="">All Batches</MenuItem>
        {availableBatches.map(batchId => (
            <MenuItem key={batchId} value={batchId}>
                Batch {batchId}
            </MenuItem>
        ))}
    </Select>
</FormControl>

                    <TextField
                    sx={{ minWidth: 300, flex: 1 }}
                        fullWidth
                        variant="outlined"
                        placeholder="Search by application ID, JAMB ID or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            endAdornment: searchQuery && (
                                <IconButton onClick={() => setSearchQuery("")}>
                                    <ClearIcon />
                                </IconButton>
                            ),
                        }}
                        // sx={{ flex: 2 }}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleSearch}
                        disabled={isLoading}
                        sx={{ height: '56px' }}
                    >
                        Search
                    </Button>
                </Box>
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
                            aria-label="Applications table"
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
                                            Batch
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Status
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
                                                        {application.applicationId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {formatFullName(application.users)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {application.jambId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {application.batch}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={filterOptions.statuses.find(opt => opt.value === application?.status)?.label || application?.status?.replace('_', ' ')} 
                                                        color={getStatusColor(application?.status)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleOpenViewModal(application)}>
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleOpenEditModal(application)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    {application.status === 'payment_completed' && (
                                                        <IconButton 
                                                            onClick={() => handleOpenBatchChangeModal(application)}
                                                            color="primary"
                                                        >
                                                            <SwapHorizIcon />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                    <Collapse in={expandedRow === application.id} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 1 }}>
                                                            <Typography variant="h6" gutterBottom component="div">
                                                                Application Details
                                                            </Typography>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12} md={6}>
                                                                    <Paper elevation={0} sx={{ p: 2 }}>
                                                                        <Typography variant="subtitle1" gutterBottom>
                                                                            Personal Information
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Full Name:</strong> {formatFullName(application?.users)}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Date of Birth:</strong> {formatDate(application?.dateOfBirth)}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Gender:</strong> {application?.gender}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Email:</strong> {application?.users?.email}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Phone:</strong> {application?.users?.phoneNumber}
                                                                        </Typography>
                                                                        {application.alternatePhoneNumber && (
                                                                            <Typography>
                                                                                <strong>Alternate Phone:</strong> {application?.alternatePhoneNumber}
                                                                            </Typography>
                                                                        )}
                                                                    </Paper>
                                                                </Grid>
                                                                <Grid item xs={12} md={6}>
                                                                    <Paper elevation={0} sx={{ p: 2 }}>
                                                                        <Typography variant="subtitle1" gutterBottom>
                                                                            Application Information
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Application ID:</strong> {application?.applicationId}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>JAMB ID:</strong> {application?.jambId}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Batch:</strong> {application?.batch}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Status:</strong> 
                                                                            <Chip 
                                                                                label={filterOptions.statuses.find(opt => opt.value === application?.status)?.label || application?.status?.replace('_', ' ')} 
                                                                                color={getStatusColor(application?.status)}
                                                                                size="small"
                                                                                sx={{ ml: 1 }}
                                                                            />
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Slip Prints:</strong> {application?.slipPrintCount}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Admission Prints:</strong> {application?.admissionPrintCount}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Created:</strong> {formatDate(application?.created_at)}
                                                                        </Typography>
                                                                        <Typography>
                                                                            <strong>Last Updated:</strong> {formatDate(application?.updated_at)}
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
                                        <TableCell colSpan={7} align="center">
                                            No applications found
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
                        Showing {applications.length} of {totalRecords} applications
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
                                Application Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Personal Information
                                        </Typography>
                                        <Typography>
                                            <strong>Full Name:</strong> {formatFullName(currentApplication.users)}
                                        </Typography>
                                        <Typography>
                                            <strong>Date of Birth:</strong> {formatDate(currentApplication.dateOfBirth)}
                                        </Typography>
                                        <Typography>
                                            <strong>Gender:</strong> {currentApplication.gender}
                                        </Typography>
                                        <Typography>
                                            <strong>Email:</strong> {currentApplication.users.email}
                                        </Typography>
                                        <Typography>
                                            <strong>Phone:</strong> {currentApplication.users.phoneNumber}
                                        </Typography>
                                        {currentApplication.alternatePhoneNumber && (
                                            <Typography>
                                                <strong>Alternate Phone:</strong> {currentApplication.alternatePhoneNumber}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Application Information
                                        </Typography>
                                        <Typography>
                                            <strong>Application ID:</strong> {currentApplication.applicationId}
                                        </Typography>
                                        <Typography>
                                            <strong>JAMB ID:</strong> {currentApplication.jambId}
                                        </Typography>
                                        <Typography>
                                            <strong>Batch:</strong> {currentApplication.batch}
                                        </Typography>
                                        <Typography>
                                            <strong>Status:</strong> 
                                            <Chip 
                                                label={filterOptions.statuses.find(opt => opt.value === currentApplication.status)?.label || currentApplication.status.replace('_', ' ')} 
                                                color={getStatusColor(currentApplication.status)}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        </Typography>
                                        <Typography>
                                            <strong>Slip Prints:</strong> {currentApplication.slipPrintCount}
                                        </Typography>
                                        <Typography>
                                            <strong>Admission Prints:</strong> {currentApplication.admissionPrintCount}
                                        </Typography>
                                        <Typography>
                                            <strong>Created:</strong> {formatDate(currentApplication.created_at)}
                                        </Typography>
                                        <Typography>
                                            <strong>Last Updated:</strong> {formatDate(currentApplication.updated_at)}
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

            {/* Edit Application Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="edit-modal-title"
                aria-describedby="edit-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 600 },
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
                            <Typography id="edit-modal-title" variant="h6" component="h2" fontWeight={600} mb={2}>
                                Edit Application
                            </Typography>
                            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="subtitle1">
                                    <strong>Application ID:</strong> {currentApplication.applicationId}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>Candidate:</strong> {formatFullName(currentApplication.users)}
                                </Typography>

                                <Box display="flex" gap={2}>
                                    <TextField
                                        fullWidth
                                        label="Date of Birth"
                                        type="date"
                                        value={currentApplication.dateOfBirth || ''}
                                        onChange={(e) => setCurrentApplication({
                                            ...currentApplication,
                                            dateOfBirth: e.target.value
                                        })}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                    <FormControl fullWidth>
                                        <InputLabel>Gender</InputLabel>
                                        <Select
                                            value={currentApplication.gender}
                                            onChange={(e) => setCurrentApplication({
                                                ...currentApplication,
                                                gender: e.target.value
                                            })}
                                            label="Gender"
                                        >
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Alternate Phone Number"
                                    value={currentApplication.alternatePhoneNumber || ''}
                                    onChange={(e) => setCurrentApplication({
                                        ...currentApplication,
                                        alternatePhoneNumber: e.target.value
                                    })}
                                />

                                <TextField
                                    fullWidth
                                    label="Licence ID"
                                    value={currentApplication.licenceId || ''}
                                    onChange={(e) => setCurrentApplication({
                                        ...currentApplication,
                                        licenceId: e.target.value
                                    })}
                                />

                                <Box display="flex" gap={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Batch</InputLabel>
                                        <Select
                                            value={currentApplication.batch}
                                            onChange={(e) => setCurrentApplication({
                                                ...currentApplication,
                                                batch: e.target.value
                                            })}
                                            label="Batch"
                                        >
                                            {filterOptions.batches.map(batch => (
                                                <MenuItem key={batch} value={batch}>Batch {batch}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={currentApplication.status}
                                            onChange={(e) => setCurrentApplication({
                                                ...currentApplication,
                                                status: e.target.value
                                            })}
                                            label="Status"
                                        >
                                            {filterOptions.statuses.map(option => (
                                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box display="flex" gap={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Active</InputLabel>
                                        <Select
                                            value={currentApplication.isActive}
                                            onChange={(e) => setCurrentApplication({
                                                ...currentApplication,
                                                isActive: e.target.value
                                            })}
                                            label="Active"
                                        >
                                            <MenuItem value="true">Yes</MenuItem>
                                            <MenuItem value="false">No</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Present</InputLabel>
                                        <Select
                                            value={currentApplication.isPresent}
                                            onChange={(e) => setCurrentApplication({
                                                ...currentApplication,
                                                isPresent: e.target.value
                                            })}
                                            label="Present"
                                        >
                                            <MenuItem value="true">Yes</MenuItem>
                                            <MenuItem value="false">No</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                {error && (
                                    <Alert severity="error" sx={{ mt: 1 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 2 }}>
                                    <Button 
                                        onClick={handleCloseModal} 
                                        color="secondary"
                                        disabled={isSubmitting}
                                        variant="outlined"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleSubmit} 
                                        variant="contained" 
                                        color="primary"
                                        disabled={isSubmitting}
                                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update'}
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            {/* Change Batch Modal */}
            <Dialog
                open={batchChangeModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="batch-change-dialog-title"
                aria-describedby="batch-change-dialog-description"
            >
                <DialogTitle id="batch-change-dialog-title">
                    Change Candidate Batch
                </DialogTitle>
                <DialogContent>
                    {currentApplication && (
                        <>
                            <DialogContentText id="batch-change-dialog-description" mb={2}>
                                Change batch for <strong>{formatFullName(currentApplication.users)}</strong> (Application ID: {currentApplication.applicationId})
                            </DialogContentText>
                            
                           <FormControl fullWidth>
    <InputLabel>Select New Batch</InputLabel>
    <Select
        value={selectedBatch}
        onChange={(e) => setSelectedBatch(e.target.value)}
        label="Select New Batch"
    >
        {availableBatches.map(batchId => (
            <MenuItem key={batchId} value={batchId}>
                Batch {batchId}
            </MenuItem>
        ))}
    </Select>
</FormControl>

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleCloseModal} 
                        color="secondary"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleBatchChangeSubmit} 
                        color="primary"
                        disabled={isSubmitting || !selectedBatch}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSubmitting ? 'Updating...' : 'Change Batch'}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardCard>
    );
};

export default Applications;
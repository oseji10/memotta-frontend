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
    FormControlLabel,
    Switch,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';

interface Batch {
    id: number;
    batchId: string;
    batchName: string;
    examDate: string;
    examTime: string;
    capacity: string;
    status: string;
    isVerificationActive: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

const Batches = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [batchId, setBatchId] = useState("");
    const [batchName, setBatchName] = useState("");
    const [examDate, setExamDate] = useState("");
    const [examTime, setExamTime] = useState("");
    const [capacity, setCapacity] = useState("");
    const [status, setStatus] = useState("inactive");
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const perPage = 10;

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'completed', label: 'Completed' }
    ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const response = await api.get('/batches', {
            params: { 
                page: currentPage, 
                per_page: perPage,
                search: searchQuery || undefined
            }
        });
        
        // Convert isVerificationActive to boolean
        const convertedBatches = response.data.data.map((batch: any) => ({
            ...batch,
            isVerificationActive: batch.isVerificationActive === 1
        }));
        
        setBatches(convertedBatches);
        setTotalPages(response.data.last_page);
        setTotalRecords(response.data.total);
        setError(null);
    } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch batches');
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

    const handleOpenModal = (batch?: Batch) => {
        if (batch) {
            setEditingBatch(batch);
            setBatchId(batch.batchId);
            setBatchName(batch.batchName);
            setExamDate(batch.examDate);
            setExamTime(batch.examTime);
            setCapacity(batch.capacity);
            setStatus(batch.status);
        } else {
            setEditingBatch(null);
            setBatchId("");
            setBatchName("");
            setExamDate("");
            setExamTime("");
            setCapacity("");
            setStatus("inactive");
        }
        setError(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setBatchId("");
        setBatchName("");
        setExamDate("");
        setExamTime("");
        setCapacity("");
        setStatus("inactive");
        setEditingBatch(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (!batchId.trim()) {
            setError('Batch ID is required');
            return;
        }
        if (!batchName.trim()) {
            setError('Batch name is required');
            return;
        }
        if (!examDate.trim()) {
            setError('Exam date is required');
            return;
        }
        if (!examTime.trim()) {
            setError('Exam time is required');
            return;
        }
        if (!capacity.trim()) {
            setError('Capacity is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                batchId,
                batchName,
                examDate,
                examTime,
                capacity,
                status,
            };
            
            if (editingBatch) {
                const response = await api.put(`/batches/${editingBatch.id}`, payload);
                if (response.status >= 200 && response.status < 300) {
                    const updatedBatches = batches.map(b => 
                        b.id === editingBatch.id ? response.data : b
                    );
                    setBatches(updatedBatches);
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/batches', payload);
                if (response.status >= 200 && response.status < 300) {
                    setBatches([response.data, ...batches]);
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Add failed');
                }
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                (editingBatch ? 'Failed to update batch' : 'Failed to add batch')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (batch: Batch) => {
        setBatchToDelete(batch);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setBatchToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!batchToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/batches/${batchToDelete.id}`);
            if (response.status >= 200 && response.status < 300) {
                const updatedBatches = batches.filter(b => b.id !== batchToDelete.id);
                setBatches(updatedBatches);
                setError(null);
                handleCloseDeleteDialog();
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to delete batch'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateTime = (date: string, time: string) => {
        return `${new Date(date).toLocaleDateString()} at ${time}`;
    };


const toggleVerificationStatus = async (batch: Batch) => {
    const newStatus = !batch.isVerificationActive;
    try {
        const response = await api.patch(`/batches/${batch.batchId}/verification`, {
            isVerificationActive: newStatus ? "1" : "0"
        });
        
        if (response.status >= 200 && response.status < 300) {
            // Update all batches - set current to newStatus, others to false
            const updatedBatches = batches.map(b => ({
                ...b,
                isVerificationActive: b.batchId === batch.batchId ? newStatus : false
            }));
            setBatches(updatedBatches);
        } else {
            throw new Error(response.data?.message || 'Status update failed');
        }
    } catch (error: any) {
        setError(
            error.response?.data?.message || 
            error.message || 
            'Failed to update verification status'
        );
        // Revert on error
        const revertedBatches = batches.map(b => 
            b.batchId === batch.batchId ? { ...b, isVerificationActive: batch.isVerificationActive } : b
        );
        setBatches(revertedBatches);
    }
};


    return (
        <DashboardCard title="Batches">
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        onClick={() => handleOpenModal()}
                        disableElevation
                        color="primary"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        Add Batch
                    </Button>
                </Box>
                
                <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by batch ID or name..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to first page when searching
                        }}
                        InputProps={{
                            endAdornment: searchQuery && (
                                <IconButton onClick={() => setSearchQuery("")}>
                                    <ClearIcon />
                                </IconButton>
                            ),
                        }}
                    />
                    <Button 
                        variant="contained" 
                        onClick={() => fetchData()}
                        disabled={isLoading}
                    >
                        Search
                    </Button>
                </Box>
            </Box>

            {error && (
                <Box mb={2}>
                    <Typography color="error">{error}</Typography>
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
                            aria-label="Batches table"
                            sx={{
                                whiteSpace: "nowrap",
                                mt: 2
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Batch ID
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Batch Name
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Exam Date & Time
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Capacity
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
                                {batches.map((batch) => (
                                    <TableRow key={batch.id}>
                                        <TableCell>
                                            <Typography>
                                                {batch.batchId}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {batch.batchName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {formatDateTime(batch.examDate, batch.examTime)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {batch.capacity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                            <Typography color={batch.isVerificationActive ? "success.main" : "error.main"}>
                                {batch.isVerificationActive ? "Verification Active" : "Verification Inactive"}
                            </Typography>
                        </TableCell>
                         <TableCell>
                            <IconButton onClick={() => handleOpenModal(batch)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton 
                                onClick={() => handleOpenDeleteDialog(batch)}
                                disabled={isSubmitting}
                            >
                                <DeleteIcon />
                            </IconButton>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={batch.isVerificationActive}
                                        onChange={() => toggleVerificationStatus(batch)}
                                        color="primary"
                                    />
                                }
                                label=""
                                labelPlacement="start"
                            />
                        </TableCell>
                                        
                                    </TableRow>
                                ))}
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
                        Showing {batches.length} of {totalRecords} batches
                        {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                    </Typography>
                </>
            )}

            {/* Add/Edit Batch Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
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
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" fontWeight={600}>
                        {editingBatch ? 'Edit Batch' : 'Add New Batch'}
                    </Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box display="flex" gap={2}>
                            <TextField
                                fullWidth
                                label="Batch ID"
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                            />
                            <TextField
                                fullWidth
                                label="Batch Name"
                                value={batchName}
                                onChange={(e) => setBatchName(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                            />
                        </Box>
                        <Box display="flex" gap={2}>
                            <TextField
                                fullWidth
                                label="Exam Date"
                                type="date"
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Exam Time"
                                type="time"
                                value={examTime}
                                onChange={(e) => setExamTime(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Box>
                        <Box display="flex" gap={2}>
                            <TextField
                                fullWidth
                                label="Capacity"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 1 }}
                            />
                            <FormControl fullWidth>
                                <InputLabel id="status-label">Status</InputLabel>
                                <Select
                                    labelId="status-label"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    label="Status"
                                >
                                    {statusOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
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
                                disabled={isSubmitting || !batchId.trim() || !batchName.trim() || !examDate || !examTime || !capacity.trim()}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingBatch ? 'Updating...' : 'Adding...') : (editingBatch ? 'Update' : 'Add')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the batch "{batchToDelete?.batchName}" (ID: {batchToDelete?.batchId})? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        color="error" 
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSubmitting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardCard>
    );
};

export default Batches;
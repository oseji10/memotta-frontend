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
    Pagination,
    Alert,
    Switch,
    FormControlLabel,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';

interface Hall {
    id: number;
    hallId: string;
    hallName: string;
    capacity: number;
    isActive: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

const Halls = () => {
    const [halls, setHalls] = useState<Hall[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [hallId, setHallId] = useState("");
    const [hallName, setHallName] = useState("");
    const [capacity, setCapacity] = useState<number>(0);
    const [editingHall, setEditingHall] = useState<Hall | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [hallToDelete, setHallToDelete] = useState<Hall | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const perPage = 10;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/halls', {
                params: { 
                    page: currentPage, 
                    per_page: perPage,
                    search: searchQuery || undefined
                }
            });
            const convertedHalls = response.data.data.map((hall: any) => ({
            ...hall,
            isActive: hall.isActive === "1" // Convert to boolean
        }));
        setHalls(convertedHalls);
            // setHalls(response.data.data);
            setTotalPages(response.data.last_page);
            setTotalRecords(response.data.total);
            setError(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch halls');
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

    const handleOpenModal = (hall?: Hall) => {
        if (hall) {
            setEditingHall(hall);
            setHallId(hall.hallId);
            setHallName(hall.hallName);
            setCapacity(hall.capacity);
        } else {
            setEditingHall(null);
            setHallId("");
            setHallName("");
            setCapacity(0);
        }
        setError(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setHallId("");
        setHallName("");
        setCapacity(0);
        setEditingHall(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (!hallId.trim()) {
            setError('Hall ID is required');
            return;
        }
        if (!hallName.trim()) {
            setError('Hall name is required');
            return;
        }
        if (capacity <= 0) {
            setError('Capacity must be greater than 0');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                hallId,
                hallName,
                capacity,
            };
            
            if (editingHall) {
                const response = await api.put(`/halls/${editingHall.hallId}`, payload);
                if (response.status >= 200 && response.status < 300) {
                    const updatedHalls = halls.map(h => 
                        h.hallId === editingHall.hallId ? response.data : h
                    );
                    setHalls(updatedHalls);
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/halls', payload);
                if (response.status >= 200 && response.status < 300) {
                    setHalls([response.data, ...halls]);
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
                (editingHall ? 'Failed to update hall' : 'Failed to add hall')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (hall: Hall) => {
        setHallToDelete(hall);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setHallToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!hallToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/halls/${hallToDelete.id}`);
            if (response.status >= 200 && response.status < 300) {
                const updatedHalls = halls.filter(h => h.id !== hallToDelete.id);
                setHalls(updatedHalls);
                setError(null);
                handleCloseDeleteDialog();
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to delete hall'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

const toggleHallStatus = async (hall: Hall) => {
    const newStatus = !hall.isActive;
    try {
        const response = await api.patch(`/halls/${hall.hallId}/status`, { 
            // isActive: newStatus 
            isActive: newStatus ? "1" : "0"
        });
        
        if (response.status >= 200 && response.status < 300) {
            // Update local state immediately for responsive UI
            const updatedHalls = halls.map(h => 
                h.hallId === hall.hallId ? { ...h, isActive: newStatus } : h
            );
            setHalls(updatedHalls);
            
            // Optional: Re-fetch data to ensure complete sync with backend
            // fetchData();
        } else {
            throw new Error(response.data?.message || 'Status update failed');
        }
    } catch (error: any) {
        setError(
            error.response?.data?.message || 
            error.message || 
            'Failed to update hall status'
        );
        // Revert the UI if the API call fails
        const revertedHalls = halls.map(h => 
            h.hallId === hall.hallId ? { ...h, isActive: hall.isActive } : h
        );
        setHalls(revertedHalls);
    }
};
    return (
        <DashboardCard title="Halls">
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
                        Add Hall
                    </Button>
                </Box>
                
                <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by hall ID or name..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
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
                            aria-label="Halls table"
                            sx={{
                                whiteSpace: "nowrap",
                                mt: 2
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Hall ID
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Hall Name
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
                                {halls.map((hall) => (
                                    <TableRow key={hall.id}>
                                        <TableCell>
                                            <Typography>
                                                {hall.hallId}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {hall.hallName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {hall.capacity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color={hall.isActive ? "success.main" : "error.main"}>
                                                {hall.isActive ? "Active" : "Inactive"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenModal(hall)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                onClick={() => handleOpenDeleteDialog(hall)}
                                                disabled={isSubmitting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={hall.isActive}
                                                        onChange={() => toggleHallStatus(hall)}
                                                        color="success"
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
                        Showing {halls.length} of {totalRecords} halls
                        {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                    </Typography>
                </>
            )}

            {/* Add/Edit Hall Modal */}
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
                        {editingHall ? 'Edit Hall' : 'Add New Hall'}
                    </Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box display="flex" gap={2}>
                            <TextField
                                fullWidth
                                label="Hall ID"
                                value={hallId}
                                onChange={(e) => setHallId(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                            />
                            <TextField
                                fullWidth
                                label="Hall Name"
                                value={hallName}
                                onChange={(e) => setHallName(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Capacity"
                            value={capacity}
                            onChange={(e) => setCapacity(Number(e.target.value))}
                            error={!!error}
                            disabled={isSubmitting}
                            variant="outlined"
                            type="number"
                            inputProps={{ min: 1 }}
                        />
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
                                disabled={isSubmitting || !hallId.trim() || !hallName.trim() || capacity <= 0}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingHall ? 'Updating...' : 'Adding...') : (editingHall ? 'Update' : 'Add')}
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
                        Are you sure you want to delete the hall "{hallToDelete?.hallName}" (ID: {hallToDelete?.hallId})? This action cannot be undone.
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

export default Halls;
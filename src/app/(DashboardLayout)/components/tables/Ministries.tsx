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
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Ministry {
    ministryId: string;
    ministryName: string;
}

const Ministries = () => {
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [ministryName, setMinistryName] = useState("");
    const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [ministryToDelete, setMinistryToDelete] = useState<Ministry | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/ministries');
                const sortedData = response.data.sort((a: Ministry, b: Ministry) => 
                    a.ministryName.localeCompare(b.ministryName)
                );
                setMinistries(sortedData);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch ministries');
                console.error('Fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = (ministry?: Ministry) => {
        if (ministry) {
            setEditingMinistry(ministry);
            setMinistryName(ministry.ministryName);
        } else {
            setEditingMinistry(null);
            setMinistryName("");
        }
        setError(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setMinistryName("");
        setEditingMinistry(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (!ministryName.trim()) {
            setError('Ministry name is required');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            let newMinistry: Ministry;
            const payload = { ministryName };
            if (editingMinistry) {
                const response = await api.put(`/ministries/${editingMinistry.ministryId}/edit`, payload);
                if (response.status >= 200 && response.status < 300) {
                    newMinistry = response.data;
                    if (!newMinistry.ministryId || !newMinistry.ministryName) {
                        throw new Error('Invalid response format: missing ministryId or ministryName');
                    }
                    const updatedMinistries = ministries.map(m => 
                        m.ministryId === editingMinistry.ministryId ? newMinistry : m
                    ).sort((a, b) => a.ministryName.localeCompare(b.ministryName));
                    setMinistries(updatedMinistries);
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/ministries', payload);
                if (response.status >= 200 && response.status < 300) {
                    newMinistry = response.data;
                    if (!newMinistry.ministryId || !newMinistry.ministryName) {
                        throw new Error('Invalid response format: missing ministryId or ministryName');
                    }
                    const updatedMinistries = [...ministries, newMinistry].sort((a, b) => 
                        a.ministryName.localeCompare(b.ministryName)
                    );
                    setMinistries(updatedMinistries);
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
                (editingMinistry ? 'Failed to update ministry' : 'Failed to add ministry')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (ministry: Ministry) => {
        setMinistryToDelete(ministry);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setMinistryToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!ministryToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/ministries/${ministryToDelete.ministryId}/delete`);
            if (response.status >= 200 && response.status < 300) {
                const updatedMinistries = ministries.filter(m => 
                    m.ministryId !== ministryToDelete.ministryId
                ).sort((a, b) => a.ministryName.localeCompare(b.ministryName));
                setMinistries(updatedMinistries);
                setError(null);
                handleCloseDeleteDialog();
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to delete ministry'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardCard title="Ministries List">
            <Box mb={2}>
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                    disabled={isLoading}
                >
                    Add Ministry
                </Button>
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
                <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                    <Table
                        aria-label="ministries table"
                        sx={{
                            whiteSpace: "nowrap",
                            mt: 2
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Ministry Name
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
                            {ministries.map((ministry) => (
                                <TableRow key={ministry.ministryId}>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {ministry.ministryName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenModal(ministry)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => handleOpenDeleteDialog(ministry)}
                                            disabled={isSubmitting}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}

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
                    width: { xs: '90%', sm: 400 },
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
                        {editingMinistry ? 'Edit Ministry' : 'Add New Ministry'}
                    </Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Ministry Name"
                            value={ministryName}
                            onChange={(e) => setMinistryName(e.target.value)}
                            error={!!error}
                            helperText={error}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
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
                                disabled={isSubmitting || !ministryName.trim()}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingMinistry ? 'Updating...' : 'Adding...') : (editingMinistry ? 'Update' : 'Add')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

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
                        Are you sure you want to delete the ministry "{ministryToDelete?.ministryName}"? This action cannot be undone.
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

export default Ministries;
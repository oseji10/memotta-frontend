import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Button,
    TextField,
    TablePagination,
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

interface Disease {
    cancerId: string;
    cancerName: string;
}

const Diseases = () => {
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [filteredDiseases, setFilteredDiseases] = useState<Disease[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [openModal, setOpenModal] = useState(false);
    const [cancerName, setCancerName] = useState("");
    const [editingCancer, setEditingCancer] = useState<Disease | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cancerToDelete, setCancerToDelete] = useState<Disease | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/diseases');
                // console.log('Fetch diseases response:', response.status, response.data);
                const sortedData = response.data.sort((a: Disease, b: Disease) => 
                    a.cancerName.localeCompare(b.cancerName)
                );
                setDiseases(sortedData);
                setFilteredDiseases(sortedData);
            } catch (error: any) {
                // console.error('Error fetching diseases:', error);
                setError(error.response?.data?.message || 'Failed to fetch diseases');
            }
        };
        fetchData();
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = diseases.filter((disease) =>
            disease.cancerName.toLowerCase().includes(value)
        );
        setFilteredDiseases(filtered);
        setCurrentPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRecordsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const handleOpenModal = (disease?: Disease) => {
        if (disease) {
            setEditingCancer(disease);
            setCancerName(disease.cancerName);
        } else {
            setEditingCancer(null);
            setCancerName("");
        }
        setError(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCancerName("");
        setEditingCancer(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (!cancerName.trim()) {
            setError('Cancer name is required');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            let newDisease: Disease;
            if (editingCancer) {
                const response = await api.put(`/diseases/${editingCancer.cancerId}/edit`, {
                    cancerName
                });
                // console.log('Update response:', response.status, response.data);
                
                if (response.status >= 200 && response.status < 300) {
                    newDisease = response.data;
                    if (!newDisease.cancerId || !newDisease.cancerName) {
                        throw new Error('Invalid response format: missing cancerId or cancerName');
                    }
                    const updatedDiseases = [...diseases.map(d => 
                        d.cancerId === editingCancer.cancerId ? newDisease : d
                    )].sort((a, b) => a.cancerName.localeCompare(b.cancerName));
                    
                    setDiseases(updatedDiseases);
                    setFilteredDiseases([...updatedDiseases].filter(d => 
                        d.cancerName.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/diseases', {
                    cancerName
                });
                // console.log('Add response:', response.status, response.data);
                
                if (response.status >= 200 && response.status < 300) {
                    newDisease = response.data;
                    if (!newDisease.cancerId || !newDisease.cancerName) {
                        throw new Error('Invalid response format: missing cancerId or cancerName');
                    }
                    const updatedDiseases = [...diseases, newDisease].sort((a, b) => 
                        a.cancerName.localeCompare(b.cancerName)
                    );
                    
                    setDiseases(updatedDiseases);
                    setFilteredDiseases([...updatedDiseases].filter(d => 
                        d.cancerName.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Add failed');
                }
            }
        } catch (error: any) {
            // console.error('Error saving disease:', error, error.response?.data);
            setError(
                error.response?.data?.message || 
                error.message || 
                (editingCancer ? 'Failed to update cancer' : 'Failed to add cancer')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (disease: Disease) => {
        setCancerToDelete(disease);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setCancerToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!cancerToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/diseases/${cancerToDelete.cancerId}/delete`);
            // console.log('Delete response:', response.status, response.data);
            
            if (response.status >= 200 && response.status < 300) {
                const updatedDiseases = [...diseases.filter(d => 
                    d.cancerId !== cancerToDelete.cancerId
                )].sort((a, b) => a.cancerName.localeCompare(b.cancerName));
                
                setDiseases(updatedDiseases);
                setFilteredDiseases([...updatedDiseases].filter(d => 
                    d.cancerName.toLowerCase().includes(searchTerm.toLowerCase())
                ));
                setError(null);
                handleCloseDeleteDialog();
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (error: any) {
            // console.error('Error deleting disease:', error, error.response?.data);
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to delete cancer'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const paginatedDiseases = filteredDiseases.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    return (
        <DashboardCard title="Cancer List">
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                >
                    Add Cancer
                </Button>
                <TextField
                    variant="outlined"
                    label="Search by Cancer Name"
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{ width: 300 }}
                />
            </Box>

            {error && (
                <Box mb={2}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}

            <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                <Table
                    aria-label="simple table"
                    sx={{
                        whiteSpace: "nowrap",
                        mt: 2
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Cancer Type
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
                        {paginatedDiseases.map((disease) => (
                            <TableRow key={disease.cancerId}>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {disease.cancerName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenModal(disease)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleOpenDeleteDialog(disease)}
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

            <TablePagination
                component="div"
                count={filteredDiseases.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={recordsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

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
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" mb={2}>
                        {editingCancer ? 'Edit Cancer' : 'Add New Cancer'}
                    </Typography>
                    <TextField
                        fullWidth
                        label="Cancer Name"
                        value={cancerName}
                        onChange={(e) => setCancerName(e.target.value)}
                        error={!!error}
                        helperText={error}
                        sx={{ mb: 2 }}
                        disabled={isSubmitting}
                    />
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Button 
                            onClick={handleCloseModal} 
                            color="secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained" 
                            color="primary"
                            disabled={isSubmitting || !cancerName.trim()}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isSubmitting ? (editingCancer ? 'Updating...' : 'Adding...') : (editingCancer ? 'Update' : 'Add')}
                        </Button>
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
                    {"Confirm Deletion"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the cancer type "{cancerToDelete?.cancerName}"? This action cannot be undone.
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

export default Diseases;
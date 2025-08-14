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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Hospital {
    hospitalId: string;
    acronym: string;
    hospitalName: string;
    contactPerson: string; // Display name from contact endpoint
    contactId?: string; // ID for API submission
    location: string; // Display name from location endpoint
    locationId?: string; // ID for API submission
    status: string;
}

interface Contact {
    contactId: string;
    firstName: string;
    lastName: string;
}

interface Location {
    stateId: string;
    stateName: string;
}

const Hospitals = () => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [openModal, setOpenModal] = useState(false);
    const [hospitalName, setHospitalName] = useState("");
    const [acronym, setAcronym] = useState("");
    const [contactId, setContactId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/hospitals');
                const sortedData = response.data.sort((a: Hospital, b: Hospital) => 
                    a.hospitalName.localeCompare(b.hospitalName)
                );
                setHospitals(sortedData);
                setFilteredHospitals(sortedData);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch hospitals');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (openModal) {
            // Fetch contacts and locations when modal opens
            const fetchContactsAndLocations = async () => {
                try {
                    const [contactsResponse, locationsResponse] = await Promise.all([
                        api.get('/contacts'),
                        api.get('/locations'),
                    ]);
                    setContacts(contactsResponse.data);
                    setLocations(locationsResponse.data);
                } catch (error: any) {
                    setError(error.response?.data?.message || 'Failed to fetch contacts or locations');
                }
            };
            fetchContactsAndLocations();
        }
    }, [openModal]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = hospitals.filter((hospital) =>
            hospital.hospitalName.toLowerCase().includes(value) ||
            hospital.acronym.toLowerCase().includes(value)
        );
        setFilteredHospitals(filtered);
        setCurrentPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRecordsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const handleOpenModal = (hospital?: Hospital) => {
        if (hospital) {
            setEditingHospital(hospital);
            setHospitalName(hospital.hospitalName);
            setAcronym(hospital.acronym);
            setContactId(hospital.contactId || "");
            setLocationId(hospital.locationId || "");
        } else {
            setEditingHospital(null);
            setHospitalName("");
            setAcronym("");
            setContactId("");
            setLocationId("");
        }
        setError(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setHospitalName("");
        setAcronym("");
        setContactId("");
        setLocationId("");
        setEditingHospital(null);
        setError(null);
        setIsSubmitting(false);
        setContacts([]);
        setLocations([]);
    };

    const handleSubmit = async () => {
        if (!hospitalName.trim() || !acronym.trim() || !contactId || !locationId) {
            setError('All fields are required');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            let newHospital: Hospital;
            if (editingHospital) {
                const response = await api.put(`/hospitals/${editingHospital.hospitalId}/edit`, {
                    hospitalName,
                    acronym,
                    contactPerson: contactId,
                    location: locationId,
                });
                
                if (response.status >= 200 && response.status < 300) {
                    newHospital = response.data;
                    if (!newHospital.hospitalId || !newHospital.hospitalName) {
                        throw new Error('Invalid response format: missing hospitalId or hospitalName');
                    }
                    const updatedHospitals = [...hospitals.map(d => 
                        d.hospitalId === editingHospital.hospitalId ? newHospital : d
                    )].sort((a, b) => a.hospitalName.localeCompare(b.hospitalName));
                    
                    setHospitals(updatedHospitals);
                    setFilteredHospitals([...updatedHospitals].filter(d => 
                        d.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/hospitals', {
                    hospitalName,
                    acronym,
                    contactPerson: contactId,
                    location: locationId,
                });
                
                if (response.status >= 200 && response.status < 300) {
                    newHospital = response.data;
                    if (!newHospital.hospitalId || !newHospital.hospitalName) {
                        throw new Error('Invalid response format: missing hospitalId or hospitalName');
                    }
                    const updatedHospitals = [...hospitals, newHospital].sort((a, b) => 
                        a.hospitalName.localeCompare(b.hospitalName)
                    );
                    
                    setHospitals(updatedHospitals);
                    setFilteredHospitals([...updatedHospitals].filter(d => 
                        d.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
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
                (editingHospital ? 'Failed to update hospital' : 'Failed to add hospital')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (hospital: Hospital) => {
        setHospitalToDelete(hospital);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setHospitalToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!hospitalToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/hospitals/${hospitalToDelete.hospitalId}/delete`);
            
            if (response.status >= 200 && response.status < 300) {
                const updatedHospitals = [...hospitals.filter(d => 
                    d.hospitalId !== hospitalToDelete.hospitalId
                )].sort((a, b) => a.hospitalName.localeCompare(b.hospitalName));
                
                setHospitals(updatedHospitals);
                setFilteredHospitals([...updatedHospitals].filter(d => 
                    d.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())
                ));
                setError(null);
                handleCloseDeleteDialog();
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to delete hospital'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const paginatedHospitals = filteredHospitals.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    return (
        <DashboardCard title="Hospital List">
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                >
                    Add Hospital
                </Button>
                <TextField
                    variant="outlined"
                    label="Search by Hospital Name"
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
                                    Acronym
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Hospital Name
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Contact Person
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Location
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
                        {paginatedHospitals.map((hospital) => (
                            <TableRow key={hospital.hospitalId}>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {hospital.acronym}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {hospital.hospitalName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {hospital.contact_person?.firstName} {hospital.contact_person?.lastName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {hospital?.hospital_location?.stateName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>
                                        {hospital.status}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenModal(hospital)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleOpenDeleteDialog(hospital)}
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
                count={filteredHospitals.length}
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
                        {editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
                    </Typography>
                    <TextField
                        fullWidth
                        label="Acronym"
                        value={acronym}
                        onChange={(e) => setAcronym(e.target.value)}
                        error={!!error}
                        helperText={error}
                        sx={{ mb: 2 }}
                        disabled={isSubmitting}
                    />
                    <TextField
                        fullWidth
                        label="Hospital Name"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        error={!!error}
                        helperText={error}
                        sx={{ mb: 2 }}
                        disabled={isSubmitting}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }} disabled={isSubmitting}>
                        <InputLabel id="contact-select-label">Contact Person</InputLabel>
                        <Select
                            labelId="contact-select-label"
                            value={contactId}
                            label="Contact Person"
                            onChange={(e) => setContactId(e.target.value)}
                            error={!!error}
                        >
                            <MenuItem value="">
                                <em>Select Contact</em>
                            </MenuItem>
                            {contacts.map((contact) => (
                                <MenuItem key={contact.id} value={contact.id}>
                                    {contact.firstName} {contact.lastName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }} disabled={isSubmitting}>
                        <InputLabel id="location-select-label">Location</InputLabel>
                        <Select
                            labelId="location-select-label"
                            value={locationId}
                            label="Location"
                            onChange={(e) => setLocationId(e.target.value)}
                            error={!!error}
                        >
                            <MenuItem value="">
                                <em>Select Location</em>
                            </MenuItem>
                            {locations.map((location) => (
                                <MenuItem key={location.stateId} value={location.stateId}>
                                    {location.stateName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                            disabled={isSubmitting || !hospitalName.trim() || !acronym.trim() || !contactId || !locationId}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isSubmitting ? (editingHospital ? 'Updating...' : 'Adding...') : (editingHospital ? 'Update' : 'Add')}
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
                        Are you sure you want to delete the hospital type "{hospitalToDelete?.hospitalName}"? This action cannot be undone.
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

export default Hospitals;
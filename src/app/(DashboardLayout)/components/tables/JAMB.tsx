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
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';

interface Student {
    id: number;
    jambId: string;
    firstName: string;
    lastName: string;
    otherNames: string | null;
    gender: string;
    state: string;
    aggregateScore: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

const JAMB = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [openBulkModal, setOpenBulkModal] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [otherNames, setOtherNames] = useState("");
    const [gender, setGender] = useState("");
    const [state, setState] = useState("");
    const [jambId, setJambId] = useState("");
    const [aggregateScore, setAggregateScore] = useState("");
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filterState, setFilterState] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const perPage = 10;
    
    const [uploadProgress, setUploadProgress] = useState(0);
const [uploadResults, setUploadResults] = useState<{
  skipped: number;
  added: number;
} | null>(null);

    const nigerianStates = [
        'ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 
        'BENUE', 'BORNO', 'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO', 
        'EKITI', 'ENUGU', 'FCT', 'GOMBE', 'IMO', 'JIGAWA', 
        'KADUNA', 'KANO', 'KATSINA', 'KEBBI', 'KOGI', 'KWARA', 
        'LAGOS', 'NASARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 
        'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 
        'ZAMFARA'
    ];

 const [searchQuery, setSearchQuery] = useState("");

// Update fetchData to include search
const fetchData = async () => {
    setIsLoading(true);
    try {
        const response = await api.get('/jamb', {
            params: { 
                page: currentPage, 
                per_page: perPage,
                state: filterState || undefined,
                search: searchQuery || undefined
            }
        });
        setStudents(response.data.data);
        setTotalPages(response.data.last_page);
        setTotalRecords(response.data.total);
        setError(null);
    } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch students');
        console.error('Fetch error:', error);
    } finally {
        setIsLoading(false);
    }
};

    useEffect(() => {
        fetchData();
    }, [currentPage, filterState]);


    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
};

    const handleOpenModal = (student?: Student) => {
        if (student) {
            setEditingStudent(student);
            setFirstName(student.firstName);
            setLastName(student.lastName);
            setOtherNames(student.otherNames || "");
            setGender(student.gender);
            setState(student.state);
            setJambId(student.jambId);
            setAggregateScore(student.aggregateScore.toString());
        } else {
            setEditingStudent(null);
            setFirstName("");
            setLastName("");
            setOtherNames("");
            setGender("");
            setState("");
            setJambId("");
            setAggregateScore("");
        }
        setError(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFirstName("");
        setLastName("");
        setOtherNames("");
        setGender("");
        setState("");
        setJambId("");
        setAggregateScore("");
        setEditingStudent(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleOpenBulkModal = () => {
        setOpenBulkModal(true);
        setFile(null);
        setError(null);
    };

    const handleCloseBulkModal = () => {
        setOpenBulkModal(false);
        setFile(null);
        setError(null);
        setIsUploading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleBulkUpload = async () => {
  if (!file) {
    setError('Please select an Excel file (.csv)');
    return;
  }

  const validExtensions = ['.csv'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !validExtensions.includes(`.${fileExtension}`)) {
    setError('Please upload only Excel files (.csv)');
    return;
  }

  setIsUploading(true);
  setError(null);
  setUploadProgress(0);
  setUploadResults(null);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/jamb/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      }
    });

    if (response.data.success) {
      setUploadResults({
        skipped: response.data.skipped || 0,
        added: response.data.added || 0
      });
      fetchData(); // Refresh the table
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.errors?.file?.[0] 
      || error.response?.data?.message 
      || error.message 
      || 'Upload failed';
    setError(errorMsg);
  } finally {
    setIsUploading(false);
  }
};



    const handleSubmit = async () => {
        if (!firstName.trim()) {
            setError('First name is required');
            return;
        }
        if (!lastName.trim()) {
            setError('Last name is required');
            return;
        }
        if (!jambId.trim()) {
            setError('JAMB ID is required');
            return;
        }
        if (!state.trim()) {
            setError('State is required');
            return;
        }
        if (!aggregateScore.trim()) {
            setError('Aggregate score is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                firstName,
                lastName,
                otherNames: otherNames || null,
                gender,
                state,
                jambId,
                aggregateScore: Number(aggregateScore),
            };
            
            if (editingStudent) {
                const response = await api.put(`/jamb/${editingStudent.id}`, payload);
                if (response.status >= 200 && response.status < 300) {
                    const updatedStudents = students.map(s => 
                        s.id === editingStudent.id ? response.data : s
                    );
                    setStudents(updatedStudents);
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/jamb', payload);
                if (response.status >= 200 && response.status < 300) {
                    setStudents([response.data, ...students]);
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
                (editingStudent ? 'Failed to update student' : 'Failed to add student')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (student: Student) => {
        setStudentToDelete(student);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!studentToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/jamb/${studentToDelete.id}`);
            if (response.status >= 200 && response.status < 300) {
                const updatedStudents = students.filter(s => s.id !== studentToDelete.id);
                setStudents(updatedStudents);
                setError(null);
                handleCloseDeleteDialog();
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to delete student'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatFullName = (student: Student) => {
        return `${student.firstName} ${student.lastName}${student.otherNames ? ' ' + student.otherNames : ''}`;
    };

    return (
        <DashboardCard title="JAMB Students List">
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
                        Add Student
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleOpenBulkModal}
                        disableElevation
                        color="primary"
                        disabled={isLoading}
                        startIcon={<CloudUploadIcon />}
                    >
                        Bulk Upload
                    </Button>
                </Box>
                
             <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
    {/* <Box display="flex" gap={2} flexGrow={1}> */}
        <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name or JAMB ID..."
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
    
    <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Filter by State</InputLabel>
        <Select
            value={filterState}
            onChange={(e) => {
                setFilterState(e.target.value);
                setCurrentPage(1);
            }}
            label="Filter by State"
        >
            <MenuItem value="">All States</MenuItem>
            {nigerianStates.map(state => (
                <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
        </Select>
    </FormControl>

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
                            aria-label="Students table"
                            sx={{
                                whiteSpace: "nowrap",
                                mt: 2
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            JAMB ID
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Full Name
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Gender
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            State
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Aggregate Score
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
                                {students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <Typography>
                                                {student.jambId}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {formatFullName(student)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {student.gender}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {student.state}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {student.aggregateScore}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenModal(student)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                onClick={() => handleOpenDeleteDialog(student)}
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
    Showing {students.length} of {totalRecords} candidates
    {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
</Typography>
                </>
            )}

            {/* Add/Edit Student Modal */}
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
                        {editingStudent ? 'Edit Student' : 'Add New Student'}
                    </Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box display="flex" gap={2}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                            />
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Other Names (Optional)"
                            value={otherNames}
                            onChange={(e) => setOtherNames(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <Box display="flex" gap={2}>
                            <TextField
                                fullWidth
                                label="JAMB ID"
                                value={jambId}
                                onChange={(e) => setJambId(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                            />
                            <TextField
                                fullWidth
                                label="Aggregate Score"
                                value={aggregateScore}
                                onChange={(e) => setAggregateScore(e.target.value)}
                                error={!!error}
                                disabled={isSubmitting}
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 0, max: 400 }}
                            />
                        </Box>
                        <Box display="flex" gap={2}>
                            <FormControl fullWidth>
                                <InputLabel id="gender-label">Gender</InputLabel>
                                <Select
                                    labelId="gender-label"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    label="Gender"
                                >
                                    <MenuItem value="M">Male</MenuItem>
                                    <MenuItem value="F">Female</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="state-label">State</InputLabel>
                                <Select
                                    labelId="state-label"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    label="State"
                                >
                                    {nigerianStates.map(state => (
                                        <MenuItem key={state} value={state}>{state}</MenuItem>
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
                                disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !jambId.trim() || !state || !aggregateScore.trim()}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingStudent ? 'Updating...' : 'Adding...') : (editingStudent ? 'Update' : 'Add')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Bulk Upload Modal */}
           <Modal
  open={openBulkModal}
  onClose={handleCloseBulkModal}
  aria-labelledby="bulk-upload-modal-title"
>
  <Box sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  }}>
    <Typography variant="h6" component="h2" gutterBottom>
      Bulk Upload Students
    </Typography>
    
    {!uploadResults ? (
      <>
        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="bulk-upload-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="bulk-upload-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ py: 2 }}
            >
              {file ? file.name : 'Select Excel File'}
            </Button>
          </label>
        </Box>

        {isUploading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
            />
            <Typography variant="body2" textAlign="center" mt={1}>
              {uploadProgress}% Uploaded
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button 
            onClick={handleCloseBulkModal} 
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkUpload}
            variant="contained"
            disabled={!file || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </Box>
      </>
    ) : (
      <>
        <Alert severity="success" sx={{ mb: 2 }}>
          Upload completed successfully!
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <Typography>Records added: {uploadResults.added}</Typography>
          <Typography>Records skipped: {uploadResults.skipped}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={() => {
              handleCloseBulkModal();
              setUploadResults(null);
            }}
            variant="contained"
          >
            Close
          </Button>
        </Box>
      </>
    )}
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
                        Are you sure you want to delete the student "{studentToDelete ? formatFullName(studentToDelete) : ''}"? This action cannot be undone.
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

export default JAMB;
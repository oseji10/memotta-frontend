import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
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
    InputLabel,
    FormControl,
    SelectChangeEvent,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getStaffType } from '@/lib/auth';

interface Beneficiary {
    beneficiaryId: string;
    firstName: string;
    lastName: string;
    otherNames?: string;
    phoneNumber?: string;
    email?: string;
    employeeId: string;
    beneficiaryType: number;
    cadre: number;
    ministry: number;
    lga?: number;
    enrolledBy?: number;
    isActive?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    beneficiary_image?: {
        imageId: number;
        beneficiaryId: number;
        imagePath: string;
        imageName?: string | null;
        imageType?: string | null;
        created_at: string;
        updated_at: string;
    } | null;
    beneficiary_type?: {
        typeId: number;
        typeName: string;
    };
    cadre_info?: {
        cadreId: string;
        cadreName: string;
    };
    ministry_info?: {
        ministryId: string;
        ministryName: string;
    };
    lga_info?: {
        lgaId: number;
        districtId: number;
        lgaName: string;
        deleted_at?: string | null;
    };
    enrolled_by?: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

interface BeneficiaryType {
    typeId: number;
    typeName: string;
}

interface Cadre {
    cadreId: string;
    cadreName: string;
}

interface Ministry {
    ministryId: string;
    ministryName: string;
}

const Beneficiaries = () => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [beneficiaryTypeFilter, setBeneficiaryTypeFilter] = useState('');
    const [cadreFilter, setCadreFilter] = useState('');
    const [ministryFilter, setMinistryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [openModal, setOpenModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [otherNames, setOtherNames] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [beneficiaryType, setBeneficiaryType] = useState('');
    const [cadreId, setCadreId] = useState('');
    const [ministryId, setMinistryId] = useState('');
    const [beneficiaryTypes, setBeneficiaryTypes] = useState<BeneficiaryType[]>([]);
    const [cadres, setCadres] = useState<Cadre[]>([]);
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
    const [viewingBeneficiary, setViewingBeneficiary] = useState<Beneficiary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<Beneficiary | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isModalRendered, setIsModalRendered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const staffType = getStaffType();

    const startCamera = useCallback(async () => {
        if (!videoRef.current) {
            setError('Video element not found. Please try again.');
            console.error('Video ref is null in startCamera');
            return;
        }

        try {
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const constraints = {
                video: {
                    facingMode: isMobile ? { exact: 'environment' } : 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(err => {
                    setError(`Failed to start video playback: ${err.message}`);
                    console.error('Video playback error:', err);
                    stopCamera();
                });
            };
            videoRef.current.onerror = () => {
                setError('Error loading video stream');
                console.error('Video element error');
                stopCamera();
            };
            setIsCameraOpen(true);
            console.log('Camera stream started successfully');
        } catch (err: any) {
            setError(`Failed to access camera: ${err.message}`);
            console.error('Camera access error:', err);
            stopCamera();
        }
    }, []);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
        console.log('Camera stream stopped');
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                canvasRef.current.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `beneficiary_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                        stopCamera();
                        console.log('Image captured successfully');
                    } else {
                        setError('Failed to capture image');
                        console.error('Blob creation failed');
                    }
                }, 'image/jpeg', 0.9);
            } else {
                setError('Failed to get canvas context');
                console.error('Canvas context is null');
            }
        } else {
            setError('Video or canvas element not available');
            console.error('Video or canvas ref is null in captureImage');
        }
    };

    useEffect(() => {
        return () => {
            stopCamera();
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    useEffect(() => {
        if (openModal && isModalRendered && isCameraOpen) {
            const timer = setTimeout(() => {
                startCamera();
            }, 100); // Small delay to ensure video element is rendered
            return () => clearTimeout(timer);
        }
    }, [openModal, isModalRendered, isCameraOpen, startCamera]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [beneficiariesResponse, beneficiaryTypesResponse, cadresResponse, ministriesResponse] = await Promise.all([
                    api.get('/beneficiaries'),
                    api.get('/beneficiaries/types'),
                    api.get('/cadres'),
                    api.get('/ministries'),
                ]);
                const sortedData = beneficiariesResponse.data.sort((a: Beneficiary, b: Beneficiary) => 
                    a.firstName.localeCompare(b.firstName)
                );
                setBeneficiaries(sortedData);
                setFilteredBeneficiaries(sortedData);
                setBeneficiaryTypes(beneficiaryTypesResponse.data);
                setCadres(cadresResponse.data);
                setMinistries(ministriesResponse.data);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...beneficiaries];
        if (searchTerm) {
            filtered = filtered.filter((beneficiary) =>
                beneficiary.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                beneficiary.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (beneficiaryTypeFilter) {
            filtered = filtered.filter((beneficiary) => 
                beneficiary.beneficiaryType?.toString() === beneficiaryTypeFilter
            );
        }
        if (cadreFilter) {
            filtered = filtered.filter((beneficiary) => 
                beneficiary.cadre?.toString() === cadreFilter
            );
        }
        if (ministryFilter) {
            filtered = filtered.filter((beneficiary) => 
                beneficiary.ministry?.toString() === ministryFilter
            );
        }
        setFilteredBeneficiaries(filtered);
        setCurrentPage(0);
    }, [searchTerm, beneficiaryTypeFilter, cadreFilter, ministryFilter, beneficiaries]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRecordsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const handleOpenModal = (beneficiary?: Beneficiary) => {
        if (beneficiary) {
            setEditingBeneficiary(beneficiary);
            setFirstName(beneficiary.firstName);
            setLastName(beneficiary.lastName);
            setOtherNames(beneficiary.otherNames || '');
            setEmail(beneficiary.email || '');
            setPhoneNumber(beneficiary.phoneNumber || '');
            setEmployeeId(beneficiary.employeeId);
            setBeneficiaryType(beneficiary.beneficiaryType.toString());
            setCadreId(beneficiary.cadre.toString());
            setMinistryId(beneficiary.ministry.toString());
            setImageFile(null);
            setImagePreview(beneficiary.beneficiary_image?.imagePath || null);
        } else {
            setEditingBeneficiary(null);
            setFirstName('');
            setLastName('');
            setOtherNames('');
            setEmail('');
            setPhoneNumber('');
            setEmployeeId('');
            setBeneficiaryType('');
            setCadreId('');
            setMinistryId('');
            setImageFile(null);
            setImagePreview(null);
        }
        setError(null);
        setIsModalRendered(false);
        setOpenModal(true);
        setTimeout(() => setIsModalRendered(true), 0);
    };

    const handleOpenViewModal = (beneficiary: Beneficiary) => {
        setViewingBeneficiary(beneficiary);
        setOpenViewModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFirstName('');
        setLastName('');
        setOtherNames('');
        setEmail('');
        setPhoneNumber('');
        setEmployeeId('');
        setBeneficiaryType('');
        setCadreId('');
        setMinistryId('');
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        setEditingBeneficiary(null);
        setError(null);
        setIsSubmitting(false);
        setIsModalRendered(false);
        stopCamera();
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setViewingBeneficiary(null);
    };

    const handleTakePhoto = () => {
        setIsCameraOpen(true);
    };

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim() || !employeeId.trim() || !beneficiaryType || !cadreId || !ministryId) {
            setError('First name, last name, employee ID, beneficiary type, cadre, and ministry are required');
            setIsSubmitting(false);
            return;
        }
        if (!cadres.some(c => c.cadreId === cadreId)) {
            setError('Invalid cadre selected');
            setIsSubmitting(false);
            return;
        }
        if (!ministries.some(m => m.ministryId === ministryId)) {
            setError('Invalid ministry selected');
            setIsSubmitting(false);
            return;
        }
        if (!editingBeneficiary && !imageFile) {
            setError('Please capture an image');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('otherNames', otherNames);
            formData.append('email', email);
            formData.append('phoneNumber', phoneNumber);
            formData.append('employeeId', employeeId);
            formData.append('beneficiaryType', beneficiaryType);
            formData.append('cadre', cadreId);
            formData.append('ministry', ministryId);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            let newBeneficiary: Beneficiary;
            if (editingBeneficiary) {
                const response = await api.put(`/beneficiaries/${editingBeneficiary.beneficiaryId}/edit`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (response.status >= 200 && response.status < 300) {
                    newBeneficiary = {
                        ...response.data,
                        beneficiary_type: beneficiaryTypes.find(t => t.typeId === Number(beneficiaryType)),
                        cadre_info: cadres.find(c => c.cadreId === cadreId),
                        ministry_info: ministries.find(m => m.ministryId === ministryId),
                        beneficiary_image: response.data.beneficiary_image || editingBeneficiary.beneficiary_image,
                    };
                    const updatedBeneficiaries = beneficiaries.map(b => 
                        b.beneficiaryId === editingBeneficiary.beneficiaryId ? newBeneficiary : b
                    ).sort((a, b) => a.firstName.localeCompare(b.firstName));
                    setBeneficiaries(updatedBeneficiaries);
                    setFilteredBeneficiaries(updatedBeneficiaries.filter(d => 
                        (d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
                        (!beneficiaryTypeFilter || d.beneficiaryType.toString() === beneficiaryTypeFilter) &&
                        (!cadreFilter || (d.cadre && d.cadre.toString() === cadreFilter)) &&
                        (!ministryFilter || (d.ministry && d.ministry.toString() === ministryFilter))
                    ));
                    setError(null);
                    handleCloseModal();
                } else {
                    throw new Error(response.data?.message || 'Update failed');
                }
            } else {
                const response = await api.post('/beneficiaries', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (response.status >= 200 && response.status < 300) {
                    newBeneficiary = {
                        ...response.data,
                        beneficiary_type: beneficiaryTypes.find(t => t.typeId === Number(beneficiaryType)),
                        cadre_info: cadres.find(c => c.cadreId === cadreId),
                        ministry_info: ministries.find(m => m.ministryId === ministryId),
                        beneficiary_image: response.data.beneficiary_image,
                    };
                    const updatedBeneficiaries = [...beneficiaries, newBeneficiary].sort((a, b) => 
                        a.firstName.localeCompare(b.firstName)
                    );
                    setBeneficiaries(updatedBeneficiaries);
                    setFilteredBeneficiaries(updatedBeneficiaries.filter(d => 
                        (d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
                        (!beneficiaryTypeFilter || d.beneficiaryType.toString() === beneficiaryTypeFilter) &&
                        (!cadreFilter || (d.cadre && d.cadre.toString() === cadreFilter)) &&
                        (!ministryFilter || (d.ministry && d.ministry.toString() === ministryFilter))
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
                (editingBeneficiary ? 'Failed to update beneficiary' : 'Failed to add beneficiary')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (beneficiary: Beneficiary) => {
        setBeneficiaryToDelete(beneficiary);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setBeneficiaryToDelete(null);
        setError(null);
    };

    const handleDelete = async () => {
        if (!beneficiaryToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/beneficiaries/${beneficiaryToDelete.beneficiaryId}/delete`);
            if (response.status >= 200 && response.status < 300) {
                const updatedBeneficiaries = beneficiaries.filter(d => 
                    d.beneficiaryId !== beneficiaryToDelete.beneficiaryId
                ).sort((a, b) => a.firstName.localeCompare(b.firstName));
                setBeneficiaries(updatedBeneficiaries);
                setFilteredBeneficiaries(updatedBeneficiaries.filter(d => 
                    (d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     d.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     d.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     d.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (!beneficiaryTypeFilter || d.beneficiaryType.toString() === beneficiaryTypeFilter) &&
                    (!cadreFilter || (d.cadre && d.cadre.toString() === cadreFilter)) &&
                    (!ministryFilter || (d.ministry && d.ministry.toString() === ministryFilter))
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
                'Failed to delete beneficiary'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const paginatedBeneficiaries = filteredBeneficiaries.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    return (
        <DashboardCard title="List of Beneficiaries">
            <Box display="flex" justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    disableElevation
                    color="primary"
                    disabled={isLoading}
                >
                    Add Beneficiary
                </Button>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        variant="outlined"
                        label="Search by Name, Email, Phone, or Employee ID"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                        disabled={isLoading}
                    />
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Beneficiary Type Filter</InputLabel>
                        <Select
                            value={beneficiaryTypeFilter}
                            onChange={(e: SelectChangeEvent<string>) => setBeneficiaryTypeFilter(e.target.value)}
                            label="Beneficiary Type Filter"
                            disabled={isLoading}
                        >
                            <MenuItem value="">All Beneficiary Types</MenuItem>
                            {beneficiaryTypes.map((type) => (
                                <MenuItem key={type.typeId} value={type.typeId.toString()}>{type.typeName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Cadre Filter</InputLabel>
                        <Select
                            value={cadreFilter}
                            onChange={(e: SelectChangeEvent<string>) => setCadreFilter(e.target.value)}
                            label="Cadre Filter"
                            disabled={isLoading}
                        >
                            <MenuItem value="">All Cadres</MenuItem>
                            {cadres.map((cadre) => (
                                <MenuItem key={cadre.cadreId} value={cadre.cadreId}>{cadre.cadreName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Ministry Filter</InputLabel>
                        <Select
                            value={ministryFilter}
                            onChange={(e: SelectChangeEvent<string>) => setMinistryFilter(e.target.value)}
                            label="Ministry Filter"
                            disabled={isLoading}
                        >
                            <MenuItem value="">All Ministries</MenuItem>
                            {ministries.map((ministry) => (
                                <MenuItem key={ministry.ministryId} value={ministry.ministryId}>{ministry.ministryName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                            aria-label="beneficiaries table"
                            sx={{
                                whiteSpace: 'nowrap',
                                mt: 2,
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Name
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Employee ID
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Email
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Phone
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Beneficiary Type
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Cadre
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Ministry
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            LGA
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
                                {paginatedBeneficiaries.map((beneficiary) => (
                                    <TableRow key={beneficiary.beneficiaryId}>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    fontSize: '15px',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                {beneficiary.firstName} {beneficiary.lastName} {beneficiary.otherNames || ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.employeeId}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.email || 'N/A'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.phoneNumber || 'N/A'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.beneficiary_type?.typeName || 'Unknown'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.cadre_info?.cadreName || 'Unknown'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.ministry_info?.ministryName || 'Unknown'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{beneficiary.lga_info?.lgaName || 'Unknown'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenViewModal(beneficiary)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleOpenModal(beneficiary)}>
                                                <EditIcon />
                                            </IconButton>
                                            {staffType === 'Admin' && (
                                                <IconButton
                                                    onClick={() => handleOpenDeleteDialog(beneficiary)}
                                                    disabled={isSubmitting}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                    <TablePagination
                        component="div"
                        count={filteredBeneficiaries.length}
                        page={currentPage}
                        onPageChange={handleChangePage}
                        rowsPerPage={recordsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </>
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
                    width: { xs: '90%', sm: 600 },
                    maxWidth: '95%',
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: { xs: 2, sm: 4 },
                    borderRadius: 2,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" fontWeight={600}>
                        {editingBeneficiary ? 'Edit Beneficiary' : 'Add New Beneficiary'}
                    </Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            value={firstName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                            error={!!error}
                            helperText={error}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={lastName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Other Names"
                            value={otherNames}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtherNames(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Employee ID"
                            value={employeeId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeId(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                            type="email"
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={phoneNumber}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                            disabled={isSubmitting}
                            variant="outlined"
                            type="tel"
                        />
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                Beneficiary Photograph
                            </Typography>
                            {imagePreview ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <img src={imagePreview} alt="Captured" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => {
                                            setImageFile(null);
                                            if (imagePreview) {
                                                URL.revokeObjectURL(imagePreview);
                                                setImagePreview(null);
                                            }
                                            handleTakePhoto();
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Retake Photo
                                    </Button>
                                </Box>
                            ) : isCameraOpen ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', backgroundColor: '#000' }}
                                    />
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                    {isModalRendered && !error && !videoRef.current?.srcObject && (
                                        <Typography color="error" variant="body2">
                                            Camera stream not loading. Please ensure camera permissions are granted.
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={captureImage}
                                            disabled={isSubmitting}
                                        >
                                            Capture
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={stopCamera}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleTakePhoto}
                                    disabled={isSubmitting}
                                >
                                    Take Photo
                                </Button>
                            )}
                        </Box>
                        <FormControl fullWidth>
                            <InputLabel>Beneficiary Type</InputLabel>
                            <Select
                                value={beneficiaryType}
                                onChange={(e: SelectChangeEvent<string>) => setBeneficiaryType(e.target.value)}
                                label="Beneficiary Type"
                                disabled={isSubmitting}
                                error={!!error}
                            >
                                <MenuItem value="">Select Beneficiary Type</MenuItem>
                                {beneficiaryTypes.map((type) => (
                                    <MenuItem key={type.typeId} value={type.typeId.toString()}>{type.typeName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Cadre</InputLabel>
                            <Select
                                value={cadreId}
                                onChange={(e: SelectChangeEvent<string>) => setCadreId(e.target.value)}
                                label="Cadre"
                                disabled={isSubmitting}
                                error={!!error}
                            >
                                <MenuItem value="">Select Cadre</MenuItem>
                                {cadres.map((cadre) => (
                                    <MenuItem key={cadre.cadreId} value={cadre.cadreId}>{cadre.cadreName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Ministry</InputLabel>
                            <Select
                                value={ministryId}
                                onChange={(e: SelectChangeEvent<string>) => setMinistryId(e.target.value)}
                                label="Ministry"
                                disabled={isSubmitting}
                                error={!!error}
                            >
                                <MenuItem value="">Select Ministry</MenuItem>
                                {ministries.map((ministry) => (
                                    <MenuItem key={ministry.ministryId} value={ministry.ministryId}>{ministry.ministryName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
                                disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !employeeId.trim() || !beneficiaryType || !cadreId || !ministryId || (!editingBeneficiary && !imageFile)}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? (editingBeneficiary ? 'Updating...' : 'Adding...') : (editingBeneficiary ? 'Update' : 'Add')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <Modal
                open={openViewModal}
                onClose={handleCloseViewModal}
                aria-labelledby="view-modal-title"
                aria-describedby="view-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 450, md: 500 },
                    maxWidth: '95%',
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    p: { xs: 2, sm: 3, md: 4 },
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    transition: 'all 0.3s ease-in-out',
                    background: 'linear-gradient(145deg, #ffffff, #f4f7fa)',
                    '&:hover': {
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
                    },
                }}>
                    <Typography
                        id="view-modal-title"
                        variant="h5"
                        component="h2"
                        fontWeight={700}
                        color="primary.main"
                        sx={{ mb: 1 }}
                    >
                        Beneficiary Profile
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            alignItems: { xs: 'center', sm: 'flex-start' },
                        }}
                    >
                        <Box
                            sx={{
                                flex: { sm: '0 0 auto' },
                                width: { xs: '100%', sm: 150 },
                                height: 150,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '3px solid',
                                borderColor: 'primary.light',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            <img
                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${viewingBeneficiary?.beneficiary_image?.imagePath || ''}`}
                                alt="Beneficiary"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '';
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                                {viewingBeneficiary?.firstName || ''} {viewingBeneficiary?.lastName || ''} {viewingBeneficiary?.otherNames || ''}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Employee ID:</strong> {viewingBeneficiary?.employeeId || 'N/A'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Email:</strong> {viewingBeneficiary?.email || 'N/A'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Phone:</strong> {viewingBeneficiary?.phoneNumber || 'N/A'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Beneficiary Type:</strong> {viewingBeneficiary?.beneficiary_type?.typeName || 'Unknown'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Cadre:</strong> {viewingBeneficiary?.cadre_info?.cadreName || 'Unknown'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Ministry:</strong> {viewingBeneficiary?.ministry_info?.ministryName || 'Unknown'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    <strong>LGA:</strong> {viewingBeneficiary?.lga_info?.lgaName || 'Unknown'}
                                    {`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${viewingBeneficiary?.beneficiary_image?.imagePath || ''}`}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box display="flex" justifyContent="flex-end" mt={3}>
                        <Button
                            onClick={handleCloseViewModal}
                            variant="contained"
                            color="primary"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                },
                            }}
                        >
                            Close
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
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the beneficiary "{beneficiaryToDelete?.firstName} {beneficiaryToDelete?.lastName}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="secondary" disabled={isSubmitting}>
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

export default Beneficiaries;
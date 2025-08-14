import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    CircularProgress,
    Pagination,
    Alert,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Paper,
    Switch
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionIcon from '@mui/icons-material/Description';

interface Course {
    courseId: number;
    courseName: string;
    description: string;
    image: string | null;
    cost: string;
    duration: string;
    instructorId: number | null;
    status: 'active' | 'inactive';
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

interface Instructor {
    instructorId: number | null;
    instructorName: string | null;
}

interface CourseMaterial {
    materialId: number;
    courseId: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
}

interface CourseModule {
    moduleId: number;
    courseId: number;
    moduleName: string;
    moduleDescription: string;
    moduleOrder: number;
    createdAt: string;
}

const Courses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [openMaterialsDialog, setOpenMaterialsDialog] = useState(false);
    const [openModulesDialog, setOpenModulesDialog] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [newModule, setNewModule] = useState({
        moduleName: '',
        moduleDescription: '',
        moduleOrder: 0
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/courses');
            const data = Array.isArray(response.data) ? response.data : [response.data];
            setCourses(data);
            setTotalPages(Math.ceil(data.length / perPage));
            setError(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch courses');
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            const response = await api.get('/instructors');
            setInstructors(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch instructors');
            console.error('Fetch instructors error:', error);
        }
    };

    const fetchMaterials = async (courseId: number) => {
        try {
            const response = await api.get(`/courses/${courseId}/resources`);
            setMaterials(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch materials');
            console.error('Fetch materials error:', error);
        }
    };

    const fetchModules = async (courseId: number) => {
        try {
            const response = await api.get(`/courses/${courseId}/modules`);
            setModules(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch modules');
            console.error('Fetch modules error:', error);
        }
    };

    const toggleCourseStatus = async (courseId: number, currentStatus: 'active' | 'inactive') => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/courses/${courseId}/status`, { status: newStatus });
            fetchCourses();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update course status');
            console.error('Status update error:', error);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchInstructors();
    }, []);

    useEffect(() => {
        setTotalPages(Math.ceil(courses.length / perPage));
    }, [courses, perPage]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleOpenDialog = (course: Course | null = null) => {
        setCurrentCourse(course || {
            courseId: 0,
            courseName: '',
            description: '',
            image: null,
            cost: '',
            duration: '',
            instructorId: null,
            status: 'active',
            created_at: null,
            updated_at: null,
            deleted_at: null
        });
        setOpenDialog(true);
    };

    const handleOpenMaterialsDialog = (courseId: number) => {
        setSelectedCourseId(courseId);
        fetchMaterials(courseId);
        setOpenMaterialsDialog(true);
    };

    const handleOpenModulesDialog = (courseId: number) => {
        setSelectedCourseId(courseId);
        fetchModules(courseId);
        setOpenModulesDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentCourse(null);
    };

    const handleCloseMaterialsDialog = () => {
        setOpenMaterialsDialog(false);
        setSelectedCourseId(null);
        setSelectedFile(null);
    };

    const handleCloseModulesDialog = () => {
        setOpenModulesDialog(false);
        setSelectedCourseId(null);
        setNewModule({
            moduleName: '',
            moduleDescription: '',
            moduleOrder: 0
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentCourse(prev => ({
            ...prev!,
            [name]: value
        }));
    };

    const handleInstructorChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const instructorId = e.target.value as number;
        setCurrentCourse(prev => ({
            ...prev!,
            instructorId: instructorId
        }));
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadMaterial = async () => {
        if (!selectedFile || !selectedCourseId) return;
        
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('courseId', selectedCourseId.toString());

            await api.post('/courses/resources', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            fetchMaterials(selectedCourseId);
            setSelectedFile(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to upload material');
            console.error('Upload error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModuleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewModule(prev => ({
            ...prev,
            [name]: name === 'moduleOrder' ? parseInt(value) || 0 : value
        }));
    };

    const handleAddModule = async () => {
        if (!selectedCourseId || !newModule.moduleName) return;
        
        setIsSubmitting(true);
        try {
            await api.post('/courses/modules', {
                courseId: selectedCourseId,
                title: newModule.moduleName,
                ...newModule
            });
            
            fetchModules(selectedCourseId);
            setNewModule({
                moduleName: '',
                moduleDescription: '',
                moduleOrder: 0
            });
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to add module');
            console.error('Add module error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteModule = async (moduleId: number) => {
        if (!selectedCourseId) return;
        
        setIsSubmitting(true);
        try {
            await api.delete(`/courses/modules/${moduleId}`);
            fetchModules(selectedCourseId);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to delete module');
            console.error('Delete module error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMaterial = async (materialId: number) => {
        if (!selectedCourseId) return;
        
        setIsSubmitting(true);
        try {
            await api.delete(`/courses/materials/${materialId}`);
            fetchMaterials(selectedCourseId);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to delete material');
            console.error('Delete material error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!currentCourse) return;
        
        setIsSubmitting(true);
        const courseData = {
            ...currentCourse,
            instructor: currentCourse.instructorId
        };
        try {
            if (currentCourse.courseId) {
                await api.put(`/courses/${currentCourse.courseId}`, courseData);
            } else {
                await api.post('/courses', courseData);
            }
            await fetchCourses();
            handleCloseDialog();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to save course');
            console.error('Save error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (courseId: number) => {
        setCourseToDelete(courseId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!courseToDelete) return;
        
        setIsSubmitting(true);
        try {
            await api.delete(`/courses/${courseToDelete}`);
            await fetchCourses();
            setDeleteConfirmOpen(false);
            setCourseToDelete(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to delete course');
            console.error('Delete error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setCourseToDelete(null);
    };

    const handlePerPageChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <DashboardCard title="Courses Management">
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add New Course
                </Button>
            </Stack>

            {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                        <Table
                            aria-label="Courses table"
                            sx={{
                                whiteSpace: "nowrap",
                                mt: 2
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Course Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Cost</TableCell>
                                    <TableCell>Duration</TableCell>
                                    <TableCell>Instructor</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {courses.length > 0 ? (
                                    courses.slice((currentPage - 1) * perPage, currentPage * perPage).map((course) => (
                                        <TableRow key={course.courseId}>
                                            <TableCell>{course.courseName}</TableCell>
                                            <TableCell>
                                                <Typography noWrap sx={{ maxWidth: '200px' }}>
                                                    {course.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{course.cost}</TableCell>
                                            <TableCell>{course.duration}</TableCell>
                                            <TableCell>{course?.instructor?.firstName || 'N/A'} {course?.instructor?.lastName || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={course.status}
                                                    color={course.status === 'active' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={course.status === 'active'}
                                                    onChange={() => toggleCourseStatus(course.courseId, course.status)}
                                                    color="primary"
                                                    inputProps={{ 'aria-label': 'course status' }}
                                                />
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(course)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="secondary"
                                                    onClick={() => handleOpenMaterialsDialog(course.courseId)}
                                                >
                                                    <AttachFileIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="info"
                                                    onClick={() => handleOpenModulesDialog(course.courseId)}
                                                >
                                                    <DescriptionIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteClick(course.courseId)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No courses found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                        <Box display="flex" alignItems="center">
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                Rows per page:
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 60 }}>
                                <Select
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                    displayEmpty
                                >
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                </Select>
                            </FormControl>
                            <Typography variant="body2" sx={{ ml: 2 }}>
                                Showing {(currentPage - 1) * perPage + 1}-
                                {Math.min(currentPage * perPage, courses.length)} of {courses.length} courses
                            </Typography>
                        </Box>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </>
            )}

            {/* Add/Edit Course Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{currentCourse?.courseId ? 'Edit Course' : 'Add Course'}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Course Name"
                            name="courseName"
                            value={currentCourse?.courseName || ''}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            name="description"
                            value={currentCourse?.description || ''}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Cost"
                            name="cost"
                            value={currentCourse?.cost || ''}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Duration"
                            name="duration"
                            value={currentCourse?.duration || ''}
                            onChange={handleInputChange}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Instructor</InputLabel>
                            <Select
                                value={currentCourse?.instructorId || ''}
                                label="Instructor"
                                onChange={handleInstructorChange}
                            >
                                <MenuItem value="">Select Instructor</MenuItem>
                                {instructors.map((instructor) => (
                                    <MenuItem 
                                        key={instructor.id}
                                        value={instructor.id}
                                    >
                                        {instructor.firstName} {instructor.lastName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Course Materials Dialog */}
            <Dialog 
                open={openMaterialsDialog} 
                onClose={handleCloseMaterialsDialog} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle>Course Materials</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <input
                                accept="*/*"
                                style={{ display: 'none' }}
                                id="upload-material"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="upload-material">
                                <Button 
                                    variant="contained" 
                                    component="span"
                                    startIcon={<UploadIcon />}
                                >
                                    Select File
                                </Button>
                            </label>
                            {selectedFile && (
                                <Typography sx={{ ml: 2 }}>
                                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<UploadIcon />}
                                onClick={handleUploadMaterial}
                                disabled={!selectedFile || isSubmitting}
                                sx={{ ml: 2 }}
                            >
                                {isSubmitting ? <CircularProgress size={24} /> : 'Upload'}
                            </Button>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <List>
                            {materials.length > 0 ? (
                                materials.map((material) => (
                                    <ListItem key={material.materialId}>
                                        <ListItemText
                                            primary={material.title}
                                            secondary={`${material.type} `}
                                            // secondary={`${material.type} - ${formatFileSize(material.fileSize)}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                color="error"
                                                onClick={() => handleDeleteMaterial(material.materialId)}
                                                disabled={isSubmitting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No materials uploaded yet
                                </Typography>
                            )}
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMaterialsDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Course Modules Dialog */}
            <Dialog 
                open={openModulesDialog} 
                onClose={handleCloseModulesDialog} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle>Course Modules</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>Add New Module</Typography>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Module Name"
                                name="moduleName"
                                value={newModule.moduleName}
                                onChange={handleModuleInputChange}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                name="moduleDescription"
                                value={newModule.moduleDescription}
                                onChange={handleModuleInputChange}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                type="number"
                                label="Order"
                                name="moduleOrder"
                                value={newModule.moduleOrder}
                                onChange={handleModuleInputChange}
                                inputProps={{ min: 0 }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddModule}
                                disabled={!newModule.moduleName || isSubmitting}
                                sx={{ mt: 2 }}
                            >
                                {isSubmitting ? <CircularProgress size={24} /> : 'Add Module'}
                            </Button>
                        </Paper>
                        <Divider sx={{ my: 2 }} />
                        <List>
                            {modules.length > 0 ? (
                                modules.sort((a, b) => a.moduleOrder - b.moduleOrder).map((module) => (
                                    <ListItem key={module.moduleId}>
                                        <ListItemText
                                            primary={`${module.title}`}
                                            secondary={module.moduleDescription}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                color="error"
                                                onClick={() => handleDeleteModule(module.moduleId)}
                                                disabled={isSubmitting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No modules added yet
                                </Typography>
                            )}
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModulesDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this course?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardCard>
    );
};

export default Courses;
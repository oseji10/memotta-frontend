import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    CircularProgress,
    Chip,
    Paper,
    Grid,
    LinearProgress,
    Alert,
    useMediaQuery,
    useTheme
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import WarningIcon from '@mui/icons-material/Warning';

interface Course {
    id: number;
    courseId: string;
    name: string;
    description: string;
    progress: number;
    resources: Resource[];
    cohort: string;
    startDate: string;
    endDate: string;
    paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
    enrollmentStatus: 'active' | 'pending' | 'suspended';
}

interface Resource {
    id: number;
    title: string;
    type: 'pdf' | 'video' | 'link' | 'excel' | 'word';
    url: string;
    dateAdded: string;
}

const MyCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingResourceId, setDownloadingResourceId] = useState<number | null>(null);
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/student/courses');
            console.log('Fetched courses:', response.data);
            setCourses(response.data);
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch courses';
            console.error('Fetch courses error:', error, errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };


const handleResourceClick = (resource: Resource) => {
  if (resource.type === 'link') {
    window.open(resource.url, "_blank");
    return;
  }

  const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/resources/${resource.id}/download`;

  window.location.href = downloadUrl;
};




    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <PictureAsPdfIcon color="error" />;
            case 'video': return <PlayCircleIcon color="primary" />;
            case 'excel': return <DownloadIcon color="action" />;
            case 'word': return <DownloadIcon color="action" />;
            default: return <DownloadIcon color="action" />;
        }
    };

    const getExtension = (type: string) => {
        switch (type) {
            case 'pdf': return 'pdf';
            case 'video': return 'mp4';
            case 'excel': return 'xlsx';
            case 'word': return 'docx';
            default: return '';
        }
    };

    const renderPaymentStatusAlert = () => (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            Your payment is not yet confirmed. Course materials will be available after payment confirmation.
        </Alert>
    );

    const renderCourseCard = (course: Course) => (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mb: 3 }}>
            <Box display="flex" flexDirection="column" gap={1} mb={2}>
                <Typography variant="h6" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                    {course.name}
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={1}>
                    <Chip 
                        label={`Cohort: ${course.cohort}`} 
                        color="primary" 
                        size="small" 
                    />
                    {course.paymentStatus === 'PAID' && (
                        <Chip 
                            label="Payment Confirmed" 
                            color="success" 
                            size="small" 
                            icon={<CheckCircleIcon fontSize="small" />}
                        />
                    )}
                </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={2}>
                {course.description}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                <Typography variant="body2">
                    <strong>Start:</strong> {formatDate(course.startDate)}
                </Typography>
                <Typography variant="body2">
                    <strong>End:</strong> {formatDate(course.endDate)}
                </Typography>
            </Box>

            {course.paymentStatus !== 'PAID' && renderPaymentStatusAlert()}

            <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                    Progress: {course.progress}%
                </Typography>
                <LinearProgress 
                    variant="determinate" 
                    value={course.progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                />
            </Box>

            {course.paymentStatus === 'PAID' && course.resources.length > 0 && (
                <>
                    <Typography variant="subtitle2" gutterBottom>
                        Course Resources:
                    </Typography>
                    <Box sx={{ 
                        width: '100%',
                        overflowX: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 2
                    }}>
                        <Table size="small" sx={{ minWidth: isMobile ? 300 : 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Resource</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {course.resources.map((resource) => (
                                    <TableRow key={resource.id} hover>
                                        <TableCell sx={{ wordBreak: 'break-word', maxWidth: isMobile ? 150 : 200 }}>
                                            {resource.title}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={resource?.type?.toUpperCase()}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                startIcon={
                                                    downloadingResourceId === resource.id ? 
                                                    <CircularProgress size={16} /> : 
                                                    getResourceIcon(resource.type)
                                                }
                                                onClick={() => {
                                                    handleResourceClick(resource);
                                                }}
                                                sx={{ whiteSpace: 'nowrap' }}
                                                disabled={downloadingResourceId === resource.id}
                                            >
                                                {resource.type === 'link' ? 'View' : 'Download'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </>
            )}
        </Paper>
    );

    return (
        <DashboardCard title="My Courses">
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : courses.length > 0 ? (
                <Box>
                    {courses.map((course) => (
                        <div key={course.id}>
                            {renderCourseCard(course)}
                        </div>
                    ))}
                </Box>
            ) : (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        You are not enrolled in any courses yet
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => router.push('/courses')}
                        size="large"
                    >
                        Browse Available Courses
                    </Button>
                </Box>
            )}
        </DashboardCard>
    );
};

export default MyCourses;
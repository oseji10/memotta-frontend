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
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';

interface Certificate {
    id: number;
    certificateId: string;
    courseName: string;
    courseId: string;
    issueDate: string;
    expiryDate: string | null;
    status: 'ISSUED' | 'PENDING' | 'REVOKED';
    grade: string;
    downloadUrl: string;
    shareUrl: string;
    verificationCode: string;
    issuer: string;
}

const Certificates = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingCertificateId, setDownloadingCertificateId] = useState<number | null>(null);
    const [sharingCertificateId, setSharingCertificateId] = useState<number | null>(null);
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchCertificates = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/student/certificates');
            console.log('Fetched certificates:', response.data);
            setCertificates(response.data);
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch certificates';
            console.error('Fetch certificates error:', error, errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleDownload = async (certificate: Certificate) => {
        setDownloadingCertificateId(certificate.id);
        try {
            const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/student/certificate/${certificate.id}`;
            window.location.href = downloadUrl;
        } catch (error) {
            console.error('Download failed:', error);
            setError('Failed to download certificate');
        } finally {
            setDownloadingCertificateId(null);
        }
    };

    const handleView = (certificate: Certificate) => {
        // Open certificate in new tab or modal
        window.open(certificate.shareUrl, '_blank');
    };

    const handleShare = async (certificate: Certificate) => {
        setSharingCertificateId(certificate.id);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Certificate: ${certificate.courseName}`,
                    text: `I completed ${certificate.courseName} with grade ${certificate.grade}`,
                    url: certificate.shareUrl,
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(certificate.shareUrl);
                alert('Certificate link copied to clipboard!');
            }
        } catch (error) {
            console.error('Share failed:', error);
        } finally {
            setSharingCertificateId(null);
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'ISSUED':
                return <Chip 
                    label="Issued" 
                    color="success" 
                    size="small"
                    icon={<CheckCircleIcon fontSize="small" />}
                />;
            case 'PENDING':
                return <Chip 
                    label="Pending" 
                    color="warning" 
                    size="small"
                />;
            case 'REVOKED':
                return <Chip 
                    label="Revoked" 
                    color="error" 
                    size="small"
                />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    const getGradeChip = (grade: string) => {
        const gradeColors: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
            'A+': 'success',
            'A': 'success',
            'B+': 'warning',
            'B': 'warning',
            'C': 'error',
            'D': 'error',
            'F': 'error'
        };
        
        return (
            <Chip 
                label={grade} 
                color={gradeColors[grade] || 'default'}
                variant="outlined"
                size="small"
            />
        );
    };

    const renderCertificateCard = (certificate: Certificate) => (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                    <Box flex={1}>
                        <Typography variant="h6" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                            {certificate.courseName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Certificate ID: {certificate.certificateId}
                        </Typography>
                    </Box>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        {getStatusChip(certificate.status)}
                        {getGradeChip(certificate.grade)}
                    </Box>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={3} sx={{ color: 'text.secondary' }}>
                    <Typography variant="body2">
                        <strong>Issued:</strong> {formatDate(certificate.issueDate)}
                    </Typography>
                    {certificate.expiryDate && (
                        <Typography variant="body2">
                            <strong>Expires:</strong> {formatDate(certificate.expiryDate)}
                        </Typography>
                    )}
                    <Typography variant="body2">
                        <strong>Issuer:</strong> {certificate.issuer}
                    </Typography>
                </Box>

                {certificate.status === 'ISSUED' && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleView(certificate)}
                            size="small"
                        >
                            View Certificate
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={
                                downloadingCertificateId === certificate.id ? 
                                <CircularProgress size={16} /> : 
                                <DownloadIcon />
                            }
                            onClick={() => handleDownload(certificate)}
                            disabled={downloadingCertificateId === certificate.id}
                            size="small"
                        >
                            Download PDF
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={
                                sharingCertificateId === certificate.id ? 
                                <CircularProgress size={16} /> : 
                                <ShareIcon />
                            }
                            onClick={() => handleShare(certificate)}
                            disabled={sharingCertificateId === certificate.id}
                            size="small"
                        >
                            Share
                        </Button>
                    </Box>
                )}

                {certificate.status === 'PENDING' && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                        Your certificate is being processed and will be available soon.
                    </Alert>
                )}

                {certificate.status === 'REVOKED' && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        This certificate has been revoked and is no longer valid.
                    </Alert>
                )}

                <Typography variant="caption" color="text.secondary">
                    Verification Code: {certificate.verificationCode}
                </Typography>
            </Box>
        </Paper>
    );

    const renderCertificatesTable = () => (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Course Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Certificate ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Cohort</TableCell>
                        {/* <TableCell sx={{ fontWeight: 600 }}>Status</TableCell> */}
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {certificates.map((certificate) => (
                        <TableRow key={certificate.id} hover>
                            <TableCell sx={{ wordBreak: 'break-word' }}>
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {certificate.name}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="caption">
                                    {certificate.certificateId}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {formatDate(certificate.issueDate)}
                            </TableCell>
                            <TableCell>
                                {getGradeChip(certificate.cohort)}
                            </TableCell>
                            {/* <TableCell>
                                {getStatusChip(certificate.status)}
                            </TableCell> */}
                            <TableCell>
                                <Box display="flex" gap={1} flexWrap="wrap">
                                    {/* <Button
                                        size="small"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => handleView(certificate)}
                                        disabled={certificate.status !== 'ISSUED'}
                                    >
                                        View
                                    </Button> */}
                                    <Button
                                        size="small"
                                        startIcon={
                                            downloadingCertificateId === certificate.id ? 
                                            <CircularProgress size={16} /> : 
                                            <DownloadIcon />
                                        }
                                        onClick={() => handleDownload(certificate)}
                                        disabled={certificate.status !== 'ISSUED' || downloadingCertificateId === certificate.id}
                                    >
                                        PDF
                                    </Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );

    return (
        <DashboardCard title="My Certificates">
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : certificates.length > 0 ? (
                <Box>
                    {isMobile ? (
                        // Mobile view: Card layout
                        <Box>
                            {certificates.map((certificate) => (
                                <div key={certificate.id}>
                                    {renderCertificateCard(certificate)}
                                </div>
                            ))}
                        </Box>
                    ) : (
                        // Desktop view: Table layout
                        renderCertificatesTable()
                    )}
                </Box>
            ) : (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No certificates found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Complete a course to earn your first certificate!
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => router.push('/my-courses')}
                        size="large"
                    >
                        View My Courses
                    </Button>
                </Box>
            )}
        </DashboardCard>
    );
};

export default Certificates;
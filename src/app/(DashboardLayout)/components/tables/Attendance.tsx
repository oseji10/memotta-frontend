import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    Pagination
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';

interface AttendanceRecord {
    id: number;
    applicationId: string;
    jambId: string;
    batch: string;
    hall: string;
    isPresent: string;
    seatNumber: string;
    users: {
        firstName: string;
        lastName: string;
        otherNames: string | null;
    };
}

interface Hall {
    id: number;
    hallId: string;
    hallName: string;
}

interface Batch {
    id: number;
    batchId: string;
    batchName: string;
}

interface ApiResponse {
    current_page: number;
    data: AttendanceRecord[];
    total: number;
    last_page: number;
}

const AttendancePage = () => {
    const [attendanceData, setAttendanceData] = useState<ApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [batchFilter, setBatchFilter] = useState<string>("");
    const [hallFilter, setHallFilter] = useState<string>("");
    const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
    const [availableHalls, setAvailableHalls] = useState<Hall[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchAttendanceData = async (page: number = 1) => {
        setIsSearching(true);
        try {
            const response = await api.get('/attendance', {
                params: { 
                    batch: batchFilter || undefined,
                    hall: hallFilter || undefined,
                    page: page
                }
            });

            setAttendanceData(response.data);
            setError(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch attendance records');
            console.error('Fetch error:', error);
            setAttendanceData(null);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchFilterOptions = async () => {
        setIsLoading(true);
        try {
            // Fetch available batches
            const batchesResponse = await api.get('/all-batches');
            setAvailableBatches(batchesResponse.data || []);

            // Fetch available halls
            const hallsResponse = await api.get('/all-halls');
            setAvailableHalls(hallsResponse.data || []);
        } catch (error) {
            console.error('Error fetching filter options:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const handleSearch = () => {
        if (batchFilter && hallFilter) {
            setCurrentPage(1);
            fetchAttendanceData(1);
        } else {
            setError('Please select both batch and hall to search');
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        fetchAttendanceData(page);
    };

    const handlePrint = async () => {
        try {
            if (!attendanceData) return;
            
            // Create print payload
            const printPayload = {
                batch: batchFilter,
                hall: hallFilter,
                records: attendanceData.data
            };

            // Call print endpoint
            const response = await api.post('/attendance/print', printPayload, {
                responseType: 'blob'
            });

            // Create blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${batchFilter}_${hallFilter}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            setError('Failed to generate print file');
            console.error('Print error:', error);
        }
    };

    const formatFullName = (user: any) => {
        return `${user?.firstName} ${user?.lastName}${user?.otherNames ? ' ' + user?.otherNames : ''}`;
    };

    return (
        <DashboardCard title="Attendance Records">
            <Box mb={2} display="flex" alignItems="left" gap={2}>
                <FormControl sx={{ minWidth: 200, flex: 1 }}>
                    <InputLabel>Select Batch</InputLabel>
                    <Select
                        value={batchFilter}
                        onChange={(e) => setBatchFilter(e.target.value)}
                        label="Select Batch"
                        disabled={isLoading}
                    >
                        <MenuItem value="">Select Batch</MenuItem>
                        {availableBatches.map((batch) => (
                            <MenuItem key={batch.batchId} value={batch.batchId}>
                                {batch.batchId} - {batch.batchName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200, flex: 1 }}>
                    <InputLabel>Select Hall</InputLabel>
                    <Select
                        value={hallFilter}
                        onChange={(e) => setHallFilter(e.target.value)}
                        label="Select Hall"
                        disabled={isLoading}
                    >
                        <MenuItem value="">Select Hall</MenuItem>
                        {availableHalls.map((hall) => (
                            <MenuItem key={hall.hallId} value={hall.hallId}>
                                {hall.hallId} - {hall.hallName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    onClick={handleSearch}
                    disabled={!batchFilter || !hallFilter || isSearching || isLoading}
                    sx={{ height: '56px' }}
                >
                    Search
                </Button>

                <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    disabled={!batchFilter || !hallFilter || !attendanceData?.data?.length || isSearching}
                    sx={{ height: '56px' }}
                >
                    Print
                </Button>
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
                <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                    <Table
                        aria-label="Attendance table"
                        sx={{
                            whiteSpace: "nowrap",
                            mt: 2
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Application ID</TableCell>
                                <TableCell>Candidate</TableCell>
                                <TableCell>JAMB ID</TableCell>
                                <TableCell>Batch</TableCell>
                                <TableCell>Hall</TableCell>
                                <TableCell>Seat Number</TableCell>
                                <TableCell>Present</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isSearching ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : attendanceData?.data?.length ? (
                                attendanceData.data.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{record.applicationId}</TableCell>
                                        <TableCell>{formatFullName(record.users)}</TableCell>
                                        <TableCell>{record.jambId}</TableCell>
                                        <TableCell>{record.batch}</TableCell>
                                        <TableCell>{record.hall}</TableCell>
                                        <TableCell>{record.seatNumber}</TableCell>
                                        <TableCell>{record.isPresent === "1" ? 'Yes' : 'No'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        {batchFilter && hallFilter ? 'No attendance records found for the selected filters' : 'Please select both batch and hall and click Search'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {attendanceData?.last_page && attendanceData.last_page > 1 && (
                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={attendanceData.last_page}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                disabled={isSearching}
                            />
                        </Box>
                    )}
                </Box>
            )}
        </DashboardCard>
    );
};

export default AttendancePage;
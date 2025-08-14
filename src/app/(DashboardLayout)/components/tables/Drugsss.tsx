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
    TablePagination
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import { useEffect, useState } from "react";
// import Cookies from 'js-cookie';

// Helper function to format the date
// const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat('en-US', {
//         weekday: 'long', // Full name of the day (e.g., Friday)
//         year: 'numeric', // 4-digit year
//         month: 'long',  // Full month name (e.g., September)
//         day: 'numeric'  // Day of the month (e.g., 18)
//     }).format(date);
// };

const Drugs = () => {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10); // Set how many records you want per page
    // const token = Cookies.get('token'); // Retrieve the token from cookies

    // Fetch drugs from the API
useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drugs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            setDrugs(data); // Update state with the fetched data
            setFilteredDrugs(data); // If you want to filter or manipulate the data later
        } catch (error) {
            console.error("Error fetching nominees:", error);
        }
    };

    fetchData();
}, []); // Empty dependency array to run only once after component mounts


    // Handle search functionality
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = drugs.filter((drug) => {
            const productName = `${drug?.productName}`.toLowerCase();
            return (
                productName.includes(value) 
            );
        });

        setFilteredDrugs(filtered);
        setCurrentPage(0); // Reset to first page when search is triggered
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRecordsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    // Pagination logic
    const paginatedDrugs = filteredDrugs.slice(
        currentPage * recordsPerPage,
        currentPage * recordsPerPage + recordsPerPage
    );

    return (
        <DashboardCard title="Drug List">
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button
                    variant="contained"
                    href="/drugs/add-drugs"
                    disableElevation
                    color="primary"
                >
                    Add Drug 
                </Button>
                &nbsp;
                <TextField
                    variant="outlined"
                    label="Search by Drug Name"
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{ width: 300 }}
                />
            </Box>

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
                                    Drug
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                Manufacturer
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Supplier
                                </Typography>
                            </TableCell>
                            
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Status
                                </Typography>
                            </TableCell>
                            {/* <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Date Created
                                </Typography>
                            </TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedDrugs.map((drug) => (
                            <TableRow key={drug.id}>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {drug?.productName} {drug?.productDescription} {drug?.formulation}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Typography>
                                        {drug?.manufacturer?.manufacturerName}
                                    </Typography>
                                </TableCell>
                               

                                <TableCell>
                                    <Typography>
                                        {drug?.supplier?.supplierName}
                                    </Typography>
                                </TableCell>
                                
                                <TableCell>
                                    <Chip
                                        sx={{
                                            px: "4px",
                                            backgroundColor:
                                            drug.status === "inactive"
                                                    ? "error.main"
                                                   
                                                    : drug?.status === "active"
                                                    ? "success.main"
                                                    : !drug?.status
                                                    ? "secondary.main"
                                                    : "secondary.main", 
                                            color: "#fff",
                                        }}
                                        size="small"
                                        label={drug?.status || "N/A"}
                                    />
                                </TableCell>
                                {/* <TableCell align="right">
                                    
                                    <Typography variant="h6">
                                        
                                    </Typography>
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {/* Pagination component */}
            <TablePagination
                component="div"
                count={filteredDrugs.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={recordsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </DashboardCard>
    );
};

export default Drugs;

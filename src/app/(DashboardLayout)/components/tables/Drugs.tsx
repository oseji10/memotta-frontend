import {
    Typography,
    Box,
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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
  } from '@mui/material';
  import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
  import { useEffect, useState } from 'react';
  import { useRouter } from 'next/navigation';

  const Drugs = () => {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [open, setOpen] = useState(false); // Modal state
    const [manufacturers, setManufacturers] = useState([]); 
    const [selectedManufacturer, setSelectedManufacturer] = useState(''); 
    const [suppliers, setSuppliers] = useState([]); // Contact persons from API
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [productName, setProductName] = useState('');
    const [shortName, setShortName] = useState('');
    const [productDescription, setProductDescription] = useState(''); 
    const [formulation, setFormulation] = useState(''); 
  
    const router = useRouter();
    // Define the modal style for mobile responsiveness
    const modalStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%', // Increased flexibility for mobile
      maxWidth: '400px', // Still retain a reasonable size for larger screens
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 3,
      borderRadius: '8px',
    };

    const modalContentStyle = {
      maxHeight: '60vh', // Limit the maximum height
      overflowY: 'auto', // Enable vertical scrolling
    };
  
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
          console.error('Error fetching drugs:', error);
        }
      };
  
      fetchData();
    }, []);
  
    // Fetch manufacturers for dropdown from the API
    useEffect(() => {
      const fetchManufacturers = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturers`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setManufacturers(data);
        } catch (error) {
          console.error('Error fetching manufacturers:', error);
        }
      };
  
      fetchManufacturers();
    }, []);



    // Fetch manufacturers for dropdown from the API
    useEffect(() => {
      const fetchSuppliers= async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setSuppliers(data);
        } catch (error) {
          console.error('Error fetching suppliers:', error);
        }
      };
  
      fetchSuppliers();
    }, []);
  
    // Handle search functionality
    const handleSearch = (event) => {
      const value = event.target.value.toLowerCase();
      setSearchTerm(value);
  
      const filtered = drugs.filter((drug) => {
        const productName = `${drug?.productName}`.toLowerCase();
        const supplierName = `${drug?.supplier.supplierName}`.toLowerCase();
        const manufacturerName = `${drug?.manufacturer.manufacturerName}`.toLowerCase();
        
        return (
        productName.includes(value) ||
        supplierName.includes(value) ||
        manufacturerName.includes(value));

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
  
    // Handle modal open/close
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
    // Handle form submission for adding a drug
    const handleAddDrug = async () => {
      const drugData = {
        shortName,
        productName,
        productDescription,
        formulation,
        supplier: selectedSupplier,
        manufacturer: selectedManufacturer,
      };
    
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drugs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(drugData),
        });
    
        if (response.ok) {
          const newDrug = await response.json();
          setDrugs((prevDrugs) => [...prevDrugs, newDrug]); // Update drugs state safely
          setFilteredDrugs((prevFiltered) => [...prevFiltered, newDrug]); // Update filtered drugs state safely
          handleClose(); // Close the modal after successful submission
        } else {
          const errorResponse = await response.json();
          console.error('Error adding drug:', errorResponse.message);
          // Optionally, set an error message state here to inform the user
        }
      } catch (error) {
        console.error('Error adding drug:', error);
        // Optionally, set an error message state here to inform the user
      }
    router.refresh();
    };
    
  
    // Pagination logic
    const paginatedDrugs = filteredDrugs.slice(
      currentPage * recordsPerPage,
      currentPage * recordsPerPage + recordsPerPage
    );
  
    return (
      <DashboardCard title="Drugs List">
        <Box
          display="flex"
          justifyContent="space-between"
          mb={2}
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={{ xs: 2, sm: 0 }}
        >
          <Button
            variant="contained"
            onClick={handleOpen}
            disableElevation
            color="primary"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Add Drug
          </Button>
          <TextField
            variant="outlined"
            label="Search by Drug Name"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
        </Box>
  
        {/* Table wrapper for horizontal scrolling on smaller screens */}
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <Table aria-label="simple table" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Drug ID
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Drug Name
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
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Date Added
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDrugs.map((drug) => (
                <TableRow key={drug.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                      {drug.shortName}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {drug?.productName} {drug?.productDescription}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={600}>
                      {drug?.manufacturer?.shortName}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {drug?.supplier?.shortName} 
                    </Typography>
                  </TableCell>

                 
  
  
                  <TableCell>
                    <Chip
                      sx={{
                        px: '4px',
                        backgroundColor:
                          drug.status === 'inactive'
                            ? 'error.main'
                            : drug.status === 'active'
                            ? 'success.main'
                            : 'secondary.main',
                        color: '#fff',
                      }}
                      size="small"
                      label={
                        drug?.status == 'active' ? 'ACTIVE' :
                        drug?.status == 'inactive' ? 'DISABLED' : 
                        'N/A'}
                    />
                  </TableCell>
                  <TableCell align="right">
                  <Typography variant="h6">{new Date(drug?.createdAt).toLocaleDateString()}</Typography>
                  </TableCell>
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
  
        {/* Modal for Adding Drug */}
        <Modal open={open} onClose={handleClose}>
          <Box 
            sx={{ 
              ...modalStyle, 
              maxHeight: '80vh', // Set max height to 80% of the viewport height
              overflowY: 'auto' // Enable vertical scrolling
            }}
          >
            <Typography variant="h6" mb={2}>
              Add Drug
            </Typography>
            <TextField
              fullWidth
              label="Drug ID"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Drug Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

<TextField
              fullWidth
              label="Product Description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

<TextField
              fullWidth
              label="Formulation"
              value={formulation}
              onChange={(e) => setFormulation(e.target.value)}
              sx={{ mb: 2 }}
            />

         
  
  <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select Manufacturer</InputLabel>
  <Select
    value={selectedManufacturer}
    onChange={(e) => setSelectedManufacturer(e.target.value)}  
    required
  >
    {manufacturers.map((manufacturer) => (
      <MenuItem key={manufacturer.id} value={manufacturer.id}>
        {manufacturer.manufacturerName} 
      </MenuItem>
    ))}
  </Select>
</FormControl>


<FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select Supplier</InputLabel>
  <Select
    value={selectedSupplier}
    onChange={(e) => setSelectedSupplier(e.target.value)}  
    required
  >
    {suppliers.map((supplier) => (
      <MenuItem key={supplier.id} value={supplier.id}>
        {supplier.supplierName} 
      </MenuItem>
    ))}
  </Select>
</FormControl>

  
            <Box display="flex" justifyContent="flex-end" flexDirection={{ xs: 'column', sm: 'row' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClose}
                sx={{ width: { xs: '100%', sm: 'auto' }, mb: { xs: 1, sm: 0 }, mr: { sm: 1 } }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddDrug}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Modal>
      </DashboardCard>
    );
  };
  
  export default Drugs;
  
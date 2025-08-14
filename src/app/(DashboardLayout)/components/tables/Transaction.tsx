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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { useState, useEffect } from "react";
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { Visibility } from '@mui/icons-material';
import { IconCheck } from '@tabler/icons-react';
const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState<Transaction[]>([]);
  const [hospitals, setHospitals] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchError, setSearchError] = useState("");

  const [openAddModal, setOpenAddModal] = useState(false); // Add modal state
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Pharmacist | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Pharmacist | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const [transactionId, setTransactionId] = useState("");
  const [transactionName, setTransactionName] = useState("");

  const [products, setProducts] = useState([]);
  //   const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  const [salesData, setSalesData] = useState([]);
  const [openSalesModal, setOpenSalesModal] = useState(false);

  const router = useRouter();

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '400px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    borderRadius: '8px',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`);
        const data = await response.json();
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchData();
  }, []);


  const fetchSalesData = async (transactionId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setSalesData(data); // Update state with the fetched sales data
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const handleOpenDetailsModal = async (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionId(transaction.id); // Store the transaction ID
    await fetchSalesData(transaction.id); // Fetch sales data
    setOpenDetailsModal(true);
  };

  const handleOpenSearchModal = () => setOpenSearchModal(true);
  const handleCloseSearchModal = () => setOpenSearchModal(false);
  const handleCloseTransactionModal = () => setOpenTransactionModal(false);


    // Fetch suppliers for dropdown
    useEffect(() => {
      const fetchSuppliers = async () => {
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
          console.error('Error fetching drugs:', error);
        }
      };
  
      fetchSuppliers();
    }, []);

      // Fetch products based on selected supplier
  const handleSupplierChange = async (supplierId) => {
    setSelectedSupplier(supplierId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drugs/supplier/${supplierId}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

     // Fetch hospitals for dropdown
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setHospitals(data);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

    fetchHospitals();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/find?contactInfo=${searchInput}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ contactInfo: searchInput }),
      });

      const data = await response.json();
      if (data) {
        setPatientDetails(data);
        setOpenSearchModal(false); // Close search modal
        setOpenAddModal(true);
        // setOpenTransactionModal(true); // Open transaction modal
        setSearchError("");
      } else {
        setSearchError("Patient not found. Please try again.");
      }
    } catch (error) {
      console.error("Error searching for patient:", error);
      setSearchError("An error occurred. Please try again.");
    }
  };


    // Add to cart functionality
    const addToCart = () => {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        const cartItem = {
          product: { id: selectedProduct },
          productName: product.productName, // Include product name
          productDescription: product.productDescription, // Include product description
          quantitySold: quantity,
          soldBy: "3cc433d3-1e4a-4b45-81df-2f7b4f6227bb",
        };
        setCart([...cart, cartItem]);
        setQuantity(1);  // Reset quantity for next item
      } else {
        console.error('Selected product not found.');
      }
    };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  // const handleTransactionSubmit = async () => {
  //   // Your transaction submission logic goes here
  //   setOpenTransactionModal(false); // Close modal after submission
  // };

  const handleTransactionSubmit = async () => {
    try {
      // Ensure cart is an array
      if (!Array.isArray(cart)) {
        throw new Error("Cart must be an array");
      }
    
      // Format the data according to the API requirements
      const transactionData = {
        transactionRequest: {
          hospital: { id: selectedHospital },
          paymentMode: "Transfer",
          soldBy: "799314f4-c47a-4cdc-8e7c-d4266dc02dda",
          patientId: patientDetails.id
        },
        salesRequest: cart.map(item => ({
          // Assuming each item in the cart has the necessary properties
          product: item.product, // Adjust based on your cart structure
          quantitySold: item.quantitySold,
          // soldBy: "3cc433d3-1e4a-4b45-81df-2f7b4f6227bb", 
          hospital: { id: selectedHospital },// Example property
        })),
      };
    

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/new-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),  // Send formatted transaction data
      });

      if (response.ok) {
        console.log("Transaction submitted successfully");
        setCart([]);  // Clear the cart after successful submission
        setOpenAddModal(false);
        setOpenTransactionModal(false);
      } else {
        console.error("Error submitting transaction");
      }
    } catch (error) {
      console.error('Error submitting cart:', error);
    }
    router.refresh();
  };

  const handleSearchTermChange = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    // Filter transactions based on the search term
    const filteredData = transactions.filter((transaction) =>
      transaction.transactionId.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredTransactions(filteredData);
  };


  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);


  const [openConfirmModal, setOpenConfirmModal] = useState(false); // Confirmation modal state
  const [selectedTransactionId, setSelectedTransactionId] = useState(null); // Store the selected transaction ID

  // Handle opening the confirmation modal
  const handleOpenConfirmModal = (transactionId) => {
    setSelectedTransactionId(transactionId); // Store the selected transaction ID
    setOpenConfirmModal(true); // Open the confirmation modal
  };

  // Handle closing the confirmation modal
  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
    setSelectedTransactionId(null); // Reset the selected transaction ID
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (selectedTransactionId) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: selectedTransactionId }),
        });

        if (response.ok) {
          console.log("Payment confirmed successfully");
          // Optionally refresh the transaction list after confirmation
          const updatedTransactions = transactions.map(transaction =>
            transaction.id === selectedTransactionId
              ? { ...transaction, status: 'confirmed' }
              : transaction
          );
          setTransactions(updatedTransactions);
        } else {
          console.error("Error confirming payment");
        }
      } catch (error) {
        console.error("Error confirming payment:", error);
      } finally {
        handleCloseConfirmModal(); 
        router.refresh();
      }
    }
  };


  return (
    <DashboardCard title="Hospital Transactions">
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" onClick={handleOpenSearchModal}>
          New Transaction
        </Button>
        <TextField
          variant="outlined"
          label="Search by Transaction ID"
          value={searchTerm}
          onChange={handleSearchTermChange}
          sx={{ width: 300 }}
        />
      </Box>

      <Box sx={{ overflow: 'auto' }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Hospital Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions
              .slice(currentPage * recordsPerPage, currentPage * recordsPerPage + recordsPerPage)
              .map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.transactionId}</TableCell>
                  <TableCell>{transaction.hospital?.shortName}</TableCell>
                  <TableCell>
                    {/* {transaction.amount} */}
                    {`₦${(Number(transaction?.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}

                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status === "pending" ? "PENDING" : transaction.status === "paid" ? "PAID" : "N/A"}
                      color={transaction.status === "pending" ? "error" : "success"}
                    />
                  </TableCell>
                  <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                  <IconButton onClick={() => {
                  handleOpenDetailsModal(transaction); // This fetches sales and opens the sales modal
                  setOpenSalesModal(true); // Open the sales modal
                }}>
                  <Visibility />
                </IconButton>
                  </TableCell>

                  <TableCell>
                  {transaction.status === "pending" ? (
  <Button variant="outlined" onClick={() => handleOpenConfirmModal(transaction.id)}>
    Confirm Payment
  </Button>
) : transaction.status === "paid" ? (
  <IconCheck />
) : null}

                  </TableCell>
                  
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>

      <Modal open={openSearchModal} onClose={handleCloseSearchModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Search Patient
          </Typography>
          <TextField
            fullWidth
            label="Enter Phone Number or Email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            margin="normal"
          />
          {searchError && <Typography color="error">{searchError}</Typography>}
          <Box mt={2}>
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* <Modal open={openTransactionModal} onClose={handleCloseTransactionModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            New Transaction
          </Typography>
          {patientDetails && (
            <>
              <Typography>Name: {patientDetails.name}</Typography>
              <Typography>Phone: {patientDetails.phone}</Typography>
              <Typography>Email: {patientDetails.email}</Typography>
              
            </>
          )}
          <Box mt={2}>
            <Button variant="contained" onClick={handleTransactionSubmit}>
              Submit Transaction
            </Button>
          </Box>
        </Box>
      </Modal> */}


      {/* Modal for Adding Transaction */}
      <Modal open={openAddModal}  onClose={handleCloseAddModal}>
        <Box sx={{
           ...modalStyle, 
           maxHeight: '80vh', // Set max height to 80% of the viewport height
           overflowY: 'auto'
        }}>
          <Typography variant="h6" mb={2}>Add New Transaction</Typography>

          {/* <Typography variant="h6" gutterBottom>
            New Transaction
          </Typography> */}
          {patientDetails && (
            <>
              <Typography><b>Name: {patientDetails?.firstName} {patientDetails?.otherNames}</b></Typography>
              <Typography><b>Phone: {patientDetails?.user?.phoneNumber}</b></Typography>
              <Typography><b>Email: {patientDetails?.user?.email}</b></Typography>
              
           
          <br/>

          <TextField
          fullWidth
          // label="Patient ID"
          type="hidden"
          value={patientDetails.id}
          onChange={(e) => setPatient(e.target.value)}
          
          
          />
          </>
        )}


          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="hospital-label">Select Hospital</InputLabel>
            <Select
              labelId="hospital-label"
              value={selectedHospital}
              label="Select Hospital"
              onChange={(e) => setSelectedHospital(e.target.value)}
            >
              {hospitals.map((hospital) => (
                <MenuItem key={hospital.id} value={hospital.id}>
                  {hospital.hospitalName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Select Supplier */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="supplier-label">Select Supplier</InputLabel>
            <Select
              labelId="supplier-label"
              value={selectedSupplier}
              label="Select Supplier"
              onChange={(e) => handleSupplierChange(e.target.value)}
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.supplierName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Select Product */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="product-label">Select Product</InputLabel>
            <Select
              labelId="product-label"
              value={selectedProduct}
              label="Select Product"
              onChange={(e) => setSelectedProduct(e.target.value)}
              disabled={!products.length}  // Disable if no products are available
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.productName} {product.productDescription}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantity Input */}
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Add to Cart Button */}
          <Button fullWidth variant="contained" color="primary" onClick={addToCart}>
            Add to Cart
          </Button>

          {/* Display Cart */}
          <Box mt={2}>
            <Typography variant="subtitle1">Cart:</Typography>
            {cart.map((item, index) => (
              <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                <Typography>{item.productName} - {item.productDescription}</Typography>
                <Box display="flex" alignItems="center">
                  <Typography>{item.quantitySold}</Typography>
                  <IconButton
                    aria-label="delete"
                    onClick={() => removeFromCart(index)}  // Call the remove function on click
                    size="small"
                    sx={{ ml: 1 }}  // Margin left for spacing
                  >
                    <DeleteIcon
                     fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>


          {/* Submit Cart */}
          <Button fullWidth variant="contained" color="secondary" onClick={handleTransactionSubmit} sx={{ mt: 2 }}>
            Submit Transaction
          </Button>
        </Box>
      </Modal>


      {openSalesModal && (
        <Modal open={openSalesModal} onClose={() => setOpenSalesModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              Sales for Transaction ID: {transactionId}
            </Typography>
            <Table
              sx={{
                ...modalStyle,
                width: '90%', // Use a percentage for width
                maxWidth: '600px', // Set a max width
                overflow: 'auto',
                border: '1px solid', // Add border to the table
                borderColor: 'divider', // Use the theme's divider color
                borderRadius: '4px', // Optional: Add some rounding to the corners
                // overflow: 'hidden' // To keep the border rounded
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ border: '1px solid' }}>Product Name</TableCell>
                  <TableCell sx={{ border: '1px solid' }}>Quantity Sold</TableCell>
                  <TableCell sx={{ border: '1px solid' }}>Landed Cost</TableCell>
                  <TableCell sx={{ border: '1px solid' }}>Hospital Markup</TableCell>
                  <TableCell sx={{ border: '1px solid' }}>Supplier Markup</TableCell>
                  <TableCell sx={{ border: '1px solid' }}>Consultant Markup</TableCell>
                  <TableCell sx={{ border: '1px solid' }}>Bank Charges</TableCell>
                  <TableCell sx={{ border: '1px solid' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesData.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell sx={{ border: '1px solid' }}>{sale.product?.productName} {sale.product?.productDescription}</TableCell>
                    <TableCell sx={{ border: '1px solid' }}>{sale.quantitySold}</TableCell>
                    <TableCell sx={{ border: '1px solid' }}>{sale.landedCost}</TableCell>
                    <TableCell sx={{ border: '1px solid' }}>{sale.hospitalMarkup}</TableCell>
                    <TableCell sx={{ border: '1px solid' }}>{sale.supplierMarkup}</TableCell>
                    <TableCell sx={{ border: '1px solid' }}>{sale.consultantMarkup}</TableCell>
                    <TableCell sx={{ border: '1px solid' }}>{sale.bankCharges}</TableCell>
                    <TableCell sx={{ border: '1px solid' }}>
                    {`₦${(
  ((Number(sale?.landedCost) || 0) +
  (Number(sale?.supplierMarkup) || 0) +
  (Number(sale?.hospitalMarkup) || 0) +
  (Number(sale?.consultantMarkup) || 0) +
  (Number(sale?.bankCharges) || 0)) * (sale?.quantitySold || 1) // Multiply by quantitySold
).toFixed(2)}`}

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          </Box>
        </Modal>
      )}


{/* Confirmation Modal */}
<Modal open={openConfirmModal} onClose={handleCloseConfirmModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Confirm Payment
          </Typography>
          <Typography>
            Are you sure the payment is in the account?
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="error" onClick={handleCloseConfirmModal}>
              No
            </Button>
            <Button variant="contained" color="primary" onClick={handleConfirmPayment}>
              Yes
            </Button>
          </Box>
        </Box>
      </Modal>
      
      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredTransactions.length}
        page={currentPage}
        onPageChange={(e, newPage) => setCurrentPage(newPage)}
        rowsPerPage={recordsPerPage}
        onRowsPerPageChange={(e) => setRecordsPerPage(parseInt(e.target.value, 10))}
      />
    </DashboardCard>
  );
};

export default Transactions;

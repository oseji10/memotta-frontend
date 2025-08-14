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
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Chip,
    Grid,
    Avatar,
    Divider,
    Paper,
    FormControlLabel,
    Radio,
    RadioGroup,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PrintIcon from '@mui/icons-material/Print';

interface Product {
    productId: string;
    productName: string;
    quantityInStock: number;
    productCost: number;
}

interface TransactionProduct {
    id: number;
    transactionId: string;
    productId: string;
    quantitySold: string;
    cost: string | null;
    created_at: string | null;
    updated_at: string | null;
    products: {
        productId: number;
        productName: string;
        cost: string;
    };
}

interface Transaction {
    id: number;
    beneficiary: number | null;
    transactionId: string;
    lga: number | null;
    soldBy: number | null;
    paymentMethod: string | null;
    status: string | null;
    created_at: string;
    updated_at: string;
    transaction_products: TransactionProduct[];
}

interface Beneficiary {
    userId: string;
    email: string;
    phoneNumber: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    department?: string | null;
    salary: string;
    billingSetting: string;
    cardNumber: string;
    beneficiaryType: 'State Civil Servant' | 'LGA Civil Servant' | 'other';
    weeklyTotalSpent: string;
}

const Transactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [openTransactionModal, setOpenTransactionModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [openErrorModal, setOpenErrorModal] = useState(false);
    const [openLimitDialog, setOpenLimitDialog] = useState(false);
    const [openLoanLimitDialog, setOpenLoanLimitDialog] = useState(false);
    const [openReceiptModal, setOpenReceiptModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchParam, setSearchParam] = useState('');
    const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantitySold, setQuantity] = useState('');
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingStock, setIsLoadingStock] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'outright' | 'loan'>('outright');

    // Calculate total cost of products in cart
    const calculateTotalCost = (): number => {
        return selectedProducts.reduce((total, item) => {
            const product = products.find(p => p.productId === item.productId);
            return total + (product ? product.productCost * item.quantity : 0);
        }, 0);
    };

    // Calculate total cost for a transaction's products
    const calculateTransactionTotalCost = (transactionProducts: TransactionProduct[]): number => {
        return transactionProducts.reduce((total, item) => {
            const cost = item.cost ? parseFloat(item.cost) : parseFloat(item.products.cost);
            const quantity = parseInt(item.quantitySold);
            return total + (isNaN(cost) || isNaN(quantity) ? 0 : cost * quantity);
        }, 0);
    };

    // Calculate loan amount for State Civil Servants (33.33% of salary)
    const calculateLoanAmount = (beneficiary: Beneficiary): number => {
        const salary = parseFloat(beneficiary.salary);
        if (!salary || isNaN(salary)) return 0;

        if (beneficiary.beneficiaryType === 'State Civil Servant') {
            return Math.round(salary * 0.3333);
        } else {
            const fixedAmount = parseFloat(beneficiary.billingSetting);
            return isNaN(fixedAmount) ? 0 : Math.round(fixedAmount);
        }
    };

    // Fetch transactions on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/transactions');
                const sortedTransactions = response.data.sort((a: Transaction, b: Transaction) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setTransactions(sortedTransactions);
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to fetch transactions');
                console.error('Fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch available stock when transaction modal opens and beneficiary is found
    useEffect(() => {
        if (openTransactionModal && beneficiary) {
            const fetchStock = async () => {
                setIsLoadingStock(true);
                try {
                    const stockResponse = await api.get('/stock/available');
                    const transformedProducts = stockResponse.data.map((item: any) => ({
                        productId: String(item.productId),
                        productCost: parseFloat(item.product?.cost) || 0,
                        productName: item.product?.productName || 'Unknown Product',
                        quantityInStock: item.quantityReceived - (
                            (item.quantitySold || 0) + 
                            (item.quantityTransferred || 0) + 
                            (item.quantityExpired || 0) + 
                            (item.quantityDamaged || 0)
                        )
                    }));
                    setProducts(transformedProducts);
                } catch (error: any) {
                    setError(error.response?.data?.message || 'Failed to fetch available stock');
                    console.error('Stock fetch error:', error);
                } finally {
                    setIsLoadingStock(false);
                }
            };
            fetchStock();
        }
    }, [openTransactionModal, beneficiary]);

    const handleOpenSearchModal = () => {
        setSearchParam('');
        setBeneficiary(null);
        setError(null);
        setOpenSearchModal(true);
    };

    const handleCloseSearchModal = () => {
        setOpenSearchModal(false);
        setSearchParam('');
        setBeneficiary(null);
        setError(null);
        setSelectedProducts([]);
        setPaymentMethod('outright');
    };

    const handleSearchBeneficiary = async () => {
        if (!searchParam.trim()) {
            setError('Please enter a valid email, phone number, or employee ID');
            return;
        }

        setIsSearching(true);
        try {
            const response = await api.get(`/users/search?param=${encodeURIComponent(searchParam.trim())}`);
            if (response.data) {
                setBeneficiary(response.data);
                if (response.data.beneficiaryType === 'LGA Civil Servant' && parseFloat(response.data.weeklyTotalSpent) >= 15000) {
                    setErrorMessage('LGA Civil Servants have reached their weekly transaction limit of ₦15,000');
                    setOpenErrorModal(true);
                    setIsSearching(false);
                    return;
                }
                if (response.data.beneficiaryType === 'State Civil Servant' && parseFloat(response.data.weeklyTotalSpent) >= 15000) {
                    setErrorMessage('State Civil Servants have reached their weekly transaction limit of ₦15,000');
                    setOpenErrorModal(true);
                    setIsSearching(false);
                    return;
                }
                setOpenSearchModal(false);
                setOpenTransactionModal(true);
                setError(null);
            } else {
                setError('No user found');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to search beneficiary');
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCloseTransactionModal = () => {
        setOpenTransactionModal(false);
        setSelectedProducts([]);
        setSelectedProductId('');
        setQuantity('');
        setError(null);
        setIsSubmitting(false);
        setBeneficiary(null);
        setProducts([]);
        setPaymentMethod('outright');
    };

    const handleAddToCart = () => {
        if (!selectedProductId || !quantitySold || isNaN(Number(quantitySold)) || Number(quantitySold) <= 0) {
            setError('Please select a product and enter a valid quantity');
            return;
        }
        const product = products.find(p => p.productId === selectedProductId);
        if (product && Number(quantitySold) <= product.quantityInStock) {
            const potentialTotal = calculateTotalCost() + (product.productCost * Number(quantitySold));
            if (beneficiary?.beneficiaryType === 'LGA Civil Servant' && parseFloat(beneficiary.weeklyTotalSpent) + potentialTotal > 15000) {
                setOpenLimitDialog(true);
                return;
            }
            if (beneficiary?.beneficiaryType === 'State Civil Servant') {
                if (paymentMethod === 'outright' && parseFloat(beneficiary.weeklyTotalSpent) + potentialTotal > 15000) {
                    setOpenLimitDialog(true);
                    return;
                }
                if (paymentMethod === 'loan' && potentialTotal > calculateLoanAmount(beneficiary)) {
                    setOpenLoanLimitDialog(true);
                    return;
                }
            }
            const newSelectedProducts = [...selectedProducts, { productId: selectedProductId, quantity: Number(quantitySold) }];
            setSelectedProducts(newSelectedProducts);
            setSelectedProductId('');
            setQuantity('');
            setError(null);
        } else {
            setError('Invalid quantity or product not in stock');
        }
    };

    const handleRemoveFromCart = (productId: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
    };

    const handleSubmitTransaction = async () => {
        if (!beneficiary || selectedProducts.length === 0) {
            setErrorMessage('Please select a beneficiary and add at least one product');
            setOpenErrorModal(true);
            return;
        }

        const totalCost = calculateTotalCost();
        if (beneficiary.beneficiaryType === 'LGA Civil Servant' && parseFloat(beneficiary.weeklyTotalSpent) + totalCost > 15000) {
            setErrorMessage('This transaction would exceed the weekly limit of ₦15,000 for LGA Civil Servants');
            setOpenErrorModal(true);
            return;
        }
        if (beneficiary.beneficiaryType === 'State Civil Servant') {
            if (paymentMethod === 'outright' && parseFloat(beneficiary.weeklyTotalSpent) + totalCost > 15000) {
                setErrorMessage('This transaction would exceed the weekly limit of ₦15,000 for State Civil Servants');
                setOpenErrorModal(true);
                return;
            }
            if (paymentMethod === 'loan' && totalCost > calculateLoanAmount(beneficiary)) {
                setErrorMessage(`This transaction would exceed the loan limit of ₦${calculateLoanAmount(beneficiary).toLocaleString()} for State Civil Servants`);
                setOpenErrorModal(true);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload = {
                beneficiaryId: beneficiary.userId,
                paymentMethod,
                products: selectedProducts
            };
            const endpoint = paymentMethod === 'loan' ? '/transactions/credits' : '/transactions';
            const response = await api.post(endpoint, payload);
            if (response.status >= 200 && response.status < 300) {
                const newTransaction = response.data;
                setTransactions([newTransaction, ...transactions].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ));
                setOpenSuccessModal(true);
                handleCloseTransactionModal();
            } else {
                throw new Error(response.data?.message || 'Transaction submission failed');
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to submit transaction');
            setOpenErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setOpenSuccessModal(false);
    };

    const handleOpenViewModal = (transaction: Transaction) => {
        setViewingTransaction(transaction);
        setOpenViewModal(true);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setViewingTransaction(null);
    };

    const handleOpenDeleteDialog = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
        setError(null);
    };

    const handleCloseErrorModal = () => {
        setOpenErrorModal(false);
        setErrorMessage('');
    };

    const handleCloseLimitDialog = () => {
        setOpenLimitDialog(false);
        setSelectedProductId('');
        setQuantity('');
    };

    const handleCloseLoanLimitDialog = () => {
        setOpenLoanLimitDialog(false);
        setSelectedProductId('');
        setQuantity('');
    };

    const handleOpenReceiptModal = (transaction: Transaction) => {
        setViewingTransaction(transaction);
        setOpenReceiptModal(true);
    };

    const handleCloseReceiptModal = () => {
        setOpenReceiptModal(false);
        setViewingTransaction(null);
    };

    const handlePrintReceipt = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const receiptContent = document.getElementById('receipt-content')?.innerHTML;
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Shagon Sauki Receipt</title>
                        <style>
                            @media print {
                                @page { 
                                    size: 80mm auto; 
                                    margin: 5mm; 
                                }
                                body { 
                                    margin: 0; 
                                    font-family: Arial, sans-serif; 
                                    font-size: 12px; 
                                    width: 80mm; 
                                    color: #000; 
                                }
                                .receipt-container { 
                                    width: 100%; 
                                    padding: 10px; 
                                    box-sizing: border-box; 
                                }
                                .logo { 
                                    max-width: 60px; 
                                    margin: 0 auto; 
                                    display: block; 
                                }
                                .header { 
                                    text-align: center; 
                                    font-size: 18px; 
                                    font-weight: bold; 
                                    margin-bottom: 10px; 
                                }
                                .divider { 
                                    border-top: 1px dashed #000; 
                                    margin: 10px 0; 
                                }
                                .table { 
                                    width: 100%; 
                                    border-collapse: collapse; 
                                    margin-bottom: 10px; 
                                }
                                .table th, .table td { 
                                    padding: 4px; 
                                    text-align: left; 
                                }
                                .table th { 
                                    font-weight: bold; 
                                }
                                .total { 
                                    font-weight: bold; 
                                    text-align: right; 
                                }
                                .footer { 
                                    text-align: center; 
                                    font-size: 10px; 
                                    margin-top: 10px; 
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="receipt-container">
                            ${receiptContent}
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        }
    };

    const handleDelete = async () => {
        if (!transactionToDelete) return;

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/transactions/${transactionToDelete.transactionId}`);
            if (response.status >= 200 && response.status < 300) {
                setTransactions(transactions.filter(m => 
                    m.transactionId !== transactionToDelete.transactionId
                ));
                handleCloseDeleteDialog();
            } else {
                throw new Error(response.data?.message || 'Delete failed');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to delete request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardCard title="Transactions">
            <Box>
                <Box mb={2}>
                    <Button
                        variant="contained"
                        onClick={handleOpenSearchModal}
                        disableElevation
                        color="primary"
                        disabled={isLoading}
                        startIcon={<AddIcon />}
                        sx={{
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' },
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                        }}
                    >
                        New Transaction
                    </Button>
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
                    <Box sx={{ overflow: 'auto', width: { xs: '100%', sm: 'auto' } }}>
                        <Table
                            aria-label="transactions table"
                            sx={{
                                whiteSpace: "nowrap",
                                mt: 2
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Transaction ID
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Trx Date
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Beneficiary
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Total Quantity
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Payment Method
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Agent
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
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.transactionId}>
                                        <TableCell>
                                            <Typography sx={{ fontSize: "15px", fontWeight: "500" }}>
                                                {transaction.transactionId}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: "15px" }}>
                                                {new Date(transaction.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: "15px" }}>
                                                {transaction?.beneficiary_info?.firstName || ''} {transaction?.beneficiary_info?.lastName || ''} {transaction?.beneficiary_info?.otherNames || ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: "15px" }}>
                                                {transaction.transaction_products?.reduce(
                                                    (sum, p) => sum + parseInt(p.quantitySold),
                                                    0
                                                ) ?? 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: "15px" }}>
                                                {transaction.paymentMethod || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: "15px" }}>
                                                {transaction.seller?.firstName || 'N/A'} {transaction.seller?.lastName || ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: "15px" }}>
                                                {transaction.status || 'Pending'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenViewModal(transaction)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton 
                                                onClick={() => handleOpenDeleteDialog(transaction)}
                                                disabled={isSubmitting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton 
                                                onClick={() => handleOpenReceiptModal(transaction)}
                                                disabled={isSubmitting}
                                            >
                                                <PrintIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                )}

                {/* Search Beneficiary Modal */}
                <Modal
                    open={openSearchModal}
                    onClose={handleCloseSearchModal}
                    aria-labelledby="search-beneficiary-modal-title"
                >
                    <Paper sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 500 },
                        maxWidth: '95%',
                        bgcolor: 'background.paper',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}>
                        <Typography id="search-beneficiary-modal-title" variant="h5" fontWeight={700} color="primary">
                            Search Beneficiary
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Employee ID, Beneficiary Id, Email, or Phone Number"
                                value={searchParam}
                                onChange={(e) => setSearchParam(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={handleSearchBeneficiary} disabled={isSearching}>
                                            {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                                        </IconButton>
                                    ),
                                }}
                                disabled={isSearching}
                                error={!!error}
                                helperText={error}
                            />
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button 
                                    onClick={handleCloseSearchModal} 
                                    variant="outlined"
                                    disabled={isSearching}
                                    sx={{ 
                                        borderColor: 'grey.400', 
                                        color: 'grey.700',
                                        textTransform: 'none',
                                        '&:hover': { borderColor: 'grey.600', bgcolor: 'grey.100' }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSearchBeneficiary} 
                                    variant="contained" 
                                    color="primary"
                                    disabled={isSearching}
                                    startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    {isSearching ? 'Searching...' : 'Search'}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Modal>

                {/* Transaction Modal */}
                <Modal
                    open={openTransactionModal}
                    onClose={handleCloseTransactionModal}
                    aria-labelledby="transaction-modal-title"
                >
                    <Paper sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 800 },
                        maxWidth: '95%',
                        bgcolor: 'background.paper',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}>
                        <Typography id="transaction-modal-title" variant="h5" fontWeight={700} color="primary" mb={3}>
                            New Transaction
                        </Typography>
                        {beneficiary && (
                            <Box mb={3}>
                                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Avatar
                                                sx={{ width: 80, height: 80, bgcolor: 'grey.300' }}
                                                src="/placeholder-image.jpg"
                                            />
                                        </Grid>
                                        <Grid item xs>
                                            <Typography variant="h6" fontWeight={600}>
                                                {beneficiary.firstName} {beneficiary.lastName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Computer No.: {beneficiary.employeeId}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Email: {beneficiary.email}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Phone: {beneficiary.phoneNumber}
                                            </Typography>
                                            {beneficiary.department && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Department: {beneficiary.department}
                                                </Typography>
                                            )}
                                            <Typography variant="body2" color="text.secondary">
                                                Salary: ₦{parseFloat(beneficiary.salary).toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Card Number: {beneficiary.cardNumber ?? 'N/A'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Beneficiary Type: {beneficiary.beneficiaryType}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Amount Spent This Week: ₦{parseFloat(beneficiary.weeklyTotalSpent).toLocaleString()}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>
                        )}
                        {paymentMethod === 'loan' && beneficiary?.beneficiaryType !== 'LGA Civil Servant' && (
                            <Box mb={3}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        background: 'linear-gradient(45deg, #4CAF50, #81C784)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Credit Amount Allowed for This Month
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        ₦{beneficiary ? calculateLoanAmount(beneficiary).toLocaleString() : '0'}
                                    </Typography>
                                </Paper>
                            </Box>
                        )}
                        <Box mb={3}>
                            <FormControl component="fieldset">
                                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                    Payment Method
                                </Typography>
                                <RadioGroup
                                    row
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as 'outright' | 'loan')}
                                >
                                    <FormControlLabel
                                        value="outright"
                                        control={<Radio />}
                                        label="Pay Outright"
                                        disabled={isSubmitting || isLoadingStock}
                                    />
                                    {beneficiary?.beneficiaryType !== 'LGA Civil Servant' && (
                                        <FormControlLabel
                                            value="loan"
                                            control={<Radio />}
                                            label="Credit"
                                            disabled={isSubmitting || isLoadingStock || !beneficiary || calculateLoanAmount(beneficiary) === 0}
                                        />
                                    )}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {isLoadingStock && (
                                <Box display="flex" justifyContent="center" my={2}>
                                    <CircularProgress size={24} />
                                    <Typography variant="body2" ml={2}>
                                        Loading available stock...
                                    </Typography>
                                </Box>
                            )}
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Product</InputLabel>
                                        <Select
                                            value={selectedProductId}
                                            onChange={(e) => setSelectedProductId(e.target.value)}
                                            label="Select Product"
                                            disabled={isSubmitting || isLoadingStock || products.length === 0}
                                        >
                                            {products.length === 0 ? (
                                                <MenuItem value="" disabled>
                                                    No products available
                                                </MenuItem>
                                            ) : (
                                                products.map((product) => (
                                                    <MenuItem key={product.productId} value={product.productId}>
                                                        {product.productName}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <TextField
                                        fullWidth
                                        label="Qty Avail."
                                        value={products.find(p => p.productId === selectedProductId)?.quantityInStock ?? ''}
                                        InputProps={{ readOnly: true }}
                                        disabled={isSubmitting}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <TextField
                                        fullWidth
                                        label="Cost"
                                        type="number"
                                        value={products.find(p => p.productId === selectedProductId)?.productCost ?? ''}
                                        InputProps={{ readOnly: true }}
                                        disabled={isSubmitting}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <TextField
                                        fullWidth
                                        label="Qty"
                                        type="number"
                                        value={quantitySold}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleAddToCart}
                                        disabled={isSubmitting}
                                        startIcon={<ShoppingCartIcon />}
                                        sx={{ height: '56px', textTransform: 'none' }}
                                    >
                                        Add to Cart
                                    </Button>
                                </Grid>
                            </Grid>
                            {selectedProducts.length > 0 && (
                                <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                        Cart
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {selectedProducts.map((item) => {
                                            const product = products.find(p => p.productId === item.productId);
                                            return (
                                                <Chip
                                                    key={item.productId}
                                                    label={`${product?.productName} (Qty: ${item.quantity})`}
                                                    onDelete={() => handleRemoveFromCart(item.productId)}
                                                    sx={{ 
                                                        bgcolor: 'primary.main', 
                                                        color: 'white',
                                                        '& .MuiChip-deleteIcon': { color: 'white' },
                                                        borderRadius: 1,
                                                        px: 1,
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        Total Cost: ₦{calculateTotalCost().toLocaleString()}
                                    </Typography>
                                </Paper>
                            )}
                            {error && (
                                <Typography color="error" variant="body2">
                                    {error}
                                </Typography>
                            )}
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button 
                                    onClick={handleCloseTransactionModal} 
                                    variant="outlined"
                                    disabled={isSubmitting}
                                    sx={{ 
                                        borderColor: 'grey.400', 
                                        color: 'grey.700',
                                        textTransform: 'none',
                                        '&:hover': { borderColor: 'grey.600', bgcolor: 'grey.100' }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSubmitTransaction} 
                                    variant="contained" 
                                    color="primary"
                                    disabled={isSubmitting || selectedProducts.length === 0 || !beneficiary}
                                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        minWidth: '150px'
                                    }}
                                >
                                    {isSubmitting ? 'Processing...' : 'Submit Transaction'}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Modal>

                {/* Success Modal */}
                <Modal
                    open={openSuccessModal}
                    onClose={handleCloseSuccessModal}
                    aria-labelledby="success-modal-title"
                >
                    <Paper sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 400 },
                        bgcolor: 'background.paper',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        p: 4,
                        borderRadius: 3,
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: 'success.main',
                        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
                    }}>
                        <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                        <Typography id="success-modal-title" variant="h5" fontWeight={700} color="success.main" mb={2}>
                            {paymentMethod === 'loan' ? 'Loan Transaction Recorded!' : 'Payment Successful!'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={3}>
                            {paymentMethod === 'loan' ? 
                                'Your loan transaction has been successfully recorded.' : 
                                'Your transaction has been successfully processed.'
                            }
                        </Typography>
                        <Button
                            onClick={handleCloseSuccessModal}
                            variant="contained"
                            color="success"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 4,
                                '&:hover': { bgcolor: 'success.dark' }
                            }}
                        >
                            Close
                        </Button>
                    </Paper>
                </Modal>

                {/* Error Modal */}
                <Modal
                    open={openErrorModal}
                    onClose={handleCloseErrorModal}
                    aria-labelledby="error-modal-title"
                >
                    <Paper sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 400 },
                        bgcolor: 'background.paper',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        p: 4,
                        borderRadius: 3,
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: 'error.main',
                    }}>
                        <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                        <Typography id="error-modal-title" variant="h5" fontWeight={700} color="error.main" mb={2}>
                            Transaction Error
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={3}>
                            {errorMessage}
                        </Typography>
                        <Button
                            onClick={handleCloseErrorModal}
                            variant="contained"
                            color="error"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 4,
                                '&:hover': { bgcolor: 'error.dark' }
                            }}
                        >
                            Close
                        </Button>
                    </Paper>
                </Modal>

                {/* Weekly Limit Dialog */}
                <Dialog
                    open={openLimitDialog}
                    onClose={handleCloseLimitDialog}
                    aria-labelledby="limit-dialog-title"
                >
                    <DialogTitle id="limit-dialog-title">
                        Weekly Limit Exceeded
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="limit-dialog-description">
                            Sorry, you have exceeded your weekly transaction limit of ₦15,000.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={handleCloseLimitDialog} 
                            color="primary" 
                            variant="contained"
                            sx={{ textTransform: 'none' }}
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Credit Limit Dialog */}
                <Dialog
                    open={openLoanLimitDialog}
                    onClose={handleCloseLoanLimitDialog}
                    aria-labelledby="loan-limit-dialog-title"
                >
                    <DialogTitle id="loan-limit-dialog-title">
                        Credit Limit Exceeded
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="loan-limit-dialog-description">
                            Sorry, this transaction would exceed your monthly credit limit of ₦{beneficiary ? calculateLoanAmount(beneficiary).toLocaleString() : '0'} for State Civil Servants.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={handleCloseLoanLimitDialog} 
                            color="primary" 
                            variant="contained"
                            sx={{ textTransform: 'none' }}
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Receipt Modal */}
                <Modal
                    open={openReceiptModal}
                    onClose={handleCloseReceiptModal}
                    aria-labelledby="receipt-modal-title"
                >
                    <Paper sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 300 },
                        maxWidth: '300px',
                        bgcolor: 'background.paper',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        p: 3,
                        borderRadius: 3,
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        border: '1px solid',
                        borderColor: 'grey.200',
                    }}>
                        {viewingTransaction && (
                            <Box id="receipt-content" sx={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#000' }}>
                                <img 
                                    src="/images/logos/sokoto-palliative2.svg"
                                    alt="Shagon Sauki Logo" 
                                    style={{ maxWidth: '150px', margin: '0 auto 10px', display: 'block' }}
                                />
                                <Typography variant="h6" align="center" fontWeight={700} mb={2}>
                                    Shagon Sauki
                                </Typography>
                                <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', mb: 2 }} />
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2"><strong>Transaction ID:</strong> {viewingTransaction.transactionId}</Typography>
                                    <Typography variant="body2"><strong>Date:</strong> {new Date(viewingTransaction.created_at).toLocaleString()}</Typography>
                                    <Typography variant="body2"><strong>Beneficiary:</strong> {viewingTransaction.beneficiary_info?.firstName || ''} {viewingTransaction.beneficiary_info?.lastName || ''}</Typography>
                                    <Typography variant="body2"><strong>Payment Method:</strong> {viewingTransaction.paymentMethod || 'N/A'}</Typography>
                                    <Typography variant="body2"><strong>Status:</strong> {viewingTransaction.status || 'Pending'}</Typography>
                                    <Typography variant="body2"><strong>Agent:</strong> {viewingTransaction.seller?.firstName || 'N/A'} {viewingTransaction.seller?.lastName || ''}</Typography>
                                </Box>
                                <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', mb: 2 }} />
                                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                    Items Purchased
                                </Typography>
                                <Table sx={{ width: '100%', borderCollapse: 'collapse', mb: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontSize: '12px', padding: '4px', fontWeight: 'bold' }}>Item</TableCell>
                                            <TableCell sx={{ fontSize: '12px', padding: '4px', fontWeight: 'bold', textAlign: 'right' }}>Qty</TableCell>
                                            <TableCell sx={{ fontSize: '12px', padding: '4px', fontWeight: 'bold', textAlign: 'right' }}>Unit (₦)</TableCell>
                                            <TableCell sx={{ fontSize: '12px', padding: '4px', fontWeight: 'bold', textAlign: 'right' }}>Total (₦)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {viewingTransaction.transaction_products.map((product) => {
                                            const cost = product.cost ? parseFloat(product.cost) : parseFloat(product.products.cost);
                                            const quantity = parseInt(product.quantitySold);
                                            return (
                                                <TableRow key={product.id}>
                                                    <TableCell sx={{ fontSize: '12px', padding: '4px' }}>{product.products.productName}</TableCell>
                                                    <TableCell sx={{ fontSize: '12px', padding: '4px', textAlign: 'right' }}>{quantity}</TableCell>
                                                    <TableCell sx={{ fontSize: '12px', padding: '4px', textAlign: 'right' }}>{cost.toLocaleString()}</TableCell>
                                                    <TableCell sx={{ fontSize: '12px', padding: '4px', textAlign: 'right' }}>{(cost * quantity).toLocaleString()}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        <TableRow>
                                            <TableCell colSpan={3} sx={{ fontSize: '12px', padding: '4px', fontWeight: 'bold', textAlign: 'right' }}>
                                                Total
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '12px', padding: '4px', fontWeight: 'bold', textAlign: 'right' }}>
                                                ₦{calculateTransactionTotalCost(viewingTransaction.transaction_products).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', mb: 2 }} />
                                <Typography variant="body2" align="center" sx={{ fontSize: '10px', mb: 2 }}>
                                    Powered by the Sokoto State Government and Bizi Mobile
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Button 
                                onClick={handleCloseReceiptModal} 
                                variant="outlined"
                                sx={{ 
                                    textTransform: 'none',
                                    borderColor: 'grey.400',
                                    color: 'grey.700',
                                    '&:hover': { borderColor: 'grey.600', bgcolor: 'grey.100' }
                                }}
                            >
                                Close
                            </Button>
                            <Button 
                                onClick={handlePrintReceipt}
                                variant="contained"
                                color="primary"
                                startIcon={<PrintIcon />}
                                sx={{
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'primary.dark' }
                                }}
                            >
                                Print Receipt
                            </Button>
                        </Box>
                    </Paper>
                </Modal>

                {/* View Transaction Modal */}
                <Modal
                    open={openViewModal}
                    onClose={handleCloseViewModal}
                    aria-labelledby="view-transaction-modal-title"
                >
                    <Paper sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 700 },
                        maxWidth: '95%',
                        bgcolor: 'background.paper',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        border: '1px solid',
                        borderColor: 'grey.200',
                    }}>
                        <Typography id="view-transaction-modal-title" variant="h5" fontWeight={700} color="primary" mb={3}>
                            Transaction Details
                        </Typography>
                        {viewingTransaction && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight={600}>Transaction ID</Typography>
                                            <Typography>{viewingTransaction.transactionId}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight={600}>Date</Typography>
                                            <Typography>{new Date(viewingTransaction.created_at).toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight={600}>Payment Method</Typography>
                                            <Typography>{viewingTransaction.paymentMethod || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight={600}>Status</Typography>
                                            <Typography>{viewingTransaction.status || 'Pending'}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                        Products Purchased
                                    </Typography>
                                    <Table aria-label="transaction products table" sx={{ minWidth: { xs: '100%', sm: 600 } }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    <Typography variant="subtitle2" fontWeight={600}>Product Name</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="subtitle2" fontWeight={600}>Quantity</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="subtitle2" fontWeight={600}>Unit Cost (₦)</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="subtitle2" fontWeight={600}>Total (₦)</Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {viewingTransaction.transaction_products.map((product) => {
                                                const cost = product.cost ? parseFloat(product.cost) : parseFloat(product.products.cost);
                                                const quantity = parseInt(product.quantitySold);
                                                return (
                                                    <TableRow key={product.id}>
                                                        <TableCell>
                                                            <Typography>{product.products.productName}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography>{quantity}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography>{cost.toLocaleString()}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography>{(cost * quantity).toLocaleString()}</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            <TableRow>
                                                <TableCell colSpan={3}>
                                                    <Typography variant="subtitle1" fontWeight={600} align="right">
                                                        Total Cost
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        ₦{calculateTransactionTotalCost(viewingTransaction.transaction_products).toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Paper>
                                <Box display="flex" justifyContent="flex-end">
                                    <Button 
                                        onClick={handleCloseViewModal} 
                                        variant="contained"
                                        color="primary"
                                        sx={{ 
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            px: 4,
                                            '&:hover': { bgcolor: 'primary.dark' }
                                        }}
                                    >
                                        Close
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                    aria-labelledby="delete-dialog-title"
                >
                    <DialogTitle id="delete-dialog-title">
                        Confirm Deletion
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="delete-modal-description">
                            Are you sure you want to delete transaction "{transactionToDelete?.transactionId}"? This action cannot be undone.
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
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardCard>
    );
};

export default Transactions;
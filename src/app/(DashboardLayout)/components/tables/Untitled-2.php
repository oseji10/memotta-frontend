    
public function initiate(Request $request): JsonResponse
{
    // Validate the incoming request
    $validator = Validator::make($request->all(), [
        'beneficiaryId' => 'required|exists:beneficiaries,beneficiaryId',
        'products' => 'required|array|min:1',
        'products.*.productId' => 'required|exists:products,productId',
        'products.*.quantity' => 'required|integer|min:1',
        'paymentMethod' => 'required|in:outright,loan',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        // Check authentication early
        $user = auth()->user();
        if (!$user || !$user->staff) {
            throw new \Exception('Authenticated user or staff data not found');
        }

        // Calculate total cost and validate stock
        $products = $request->products;
        $totalCost = 0;
        $validatedProducts = [];

        foreach ($products as $product) {
            $productId = $product['productId'];
            $quantity = $product['quantity'];

            $productModel = Products::findOrFail($productId);
            $stock = Stock::where('productId', $productId)->firstOrFail();
            $availableStock = $stock->quantityReceived - ($stock->quantitySold ?? 0);

            if ($quantity > $availableStock) {
                throw new \Exception("Insufficient stock for product ID {$productId}. Available: {$availableStock}, Requested: {$quantity}");
            }

            $totalCost += $productModel->cost * $quantity;
            $validatedProducts[] = [
                'productId' => $productId,
                'quantity' => $quantity,
                'cost' => $productModel->cost,
                'stock' => $stock,
            ];
        }

        // Generate a unique transaction ID
        $transactionId = Str::uuid()->toString();

        if ($request->paymentMethod === 'outright') {
            $totalCostInKobo = $totalCost * 100; // Convert to kobo

            $moniepointResponse = Http::withOptions(['verify' => false])->withHeaders([
                'Authorization' => 'Bearer ' . config('services.moniepoint.token'),
                'Cookie' => config('services.moniepoint.cookie'), // Ideally, cookies should be handled dynamically
            ])->post('https://api.pos.moniepoint.com/v1/transactions', [
                'terminalSerial' => config('services.moniepoint.terminal_serial'),
                'amount' => $totalCostInKobo,
                'merchantReference' => $transactionId,
                'transactionType' => 'PURCHASE',
                'paymentMethod' => 'CARD_PURCHASE',
            ]);

            // if ($moniepointResponse->successful() && $moniepointResponse->json('status') === 'success') {
            //     \Log::info('Moniepoint payment successful', [
            //         'transactionId' => $transactionId,
            //         'totalCost' => $totalCost,
            //     ]);

            if ($moniepointResponse->status() === 202) {

   

    // return response()->json([
        // 'status' => 'success',
        // 'message' => 'Payment request accepted by Moniepoint.',
        // 'moniepointStatus' => $moniepointResponse->status(),
        // 'moniepointDescription' => 'Accepted'
    // ], 202);

                return DB::transaction(function () use ($transactionId, $request, $validatedProducts, $totalCost, $user) {
                    // Store in PendingTransactions
                    $pendingTransaction = PendingTransactions::create([
                        'transactionId' => $transactionId,
                        'beneficiaryId' => $request->beneficiaryId,
                        'paymentMethod' => $request->paymentMethod,
                        'products' => json_encode($validatedProducts),
                        'totalCost' => $totalCost,
                        'status' => 'completed',
                    ]);

                    // Create the transaction
                    $transaction = Transactions::create([
                        'transactionId' => $transactionId,
                        'beneficiary' => $pendingTransaction->beneficiaryId,
                        'paymentMethod' => $pendingTransaction->paymentMethod,
                        'lga' => $user->staff->lga,
                        'soldBy' => $user->id,
                        'status' => $pendingTransaction->status,
                    ]);

                    // Process products
                    $transactionProducts = [];
                    foreach ($validatedProducts as $product) {
                        $transactionProducts[] = [
                            'transactionId' => $transactionId,
                            'productId' => $product['productId'],
                            'quantitySold' => $product['quantity'],
                            'cost' => $product['cost'],
                        ];

                        // Update stock
                        $product['stock']->increment('quantitySold', $product['quantity']);
                    }

                    // Insert transaction products
                    TransactionProducts::insert($transactionProducts);

                    // Delete pending transaction
                    $pendingTransaction->delete();

                    // Fetch the transaction with related data
                    $transaction = Transactions::with(['beneficiary', 'transaction_products.products'])
                        ->where('transactionId', $transactionId)
                        ->firstOrFail();

                    // Format response
                    $response = [
                        'id' => $transaction->id,
                        'beneficiary' => $transaction->beneficiary,
                        'transactionId' => $transaction->transactionId,
                        'lga' => $transaction->lga,
                        'soldBy' => $transaction->soldBy,
                        'paymentMethod' => $transaction->paymentMethod,
                        'status' => $transaction->status,
                        'created_at' => $transaction->created_at->toIso8601String(),
                        'updated_at' => $transaction->updated_at->toIso8601String(),
                        'transaction_products' => $transaction->transaction_products->map(function ($transactionProduct) {
                            return [
                                'id' => $transactionProduct->id,
                                'transactionId' => $transactionProduct->transactionId,
                                'productId' => $transactionProduct->productId,
                                'quantitySold' => $transactionProduct->quantitySold,
                                'cost' => $transactionProduct->cost,
                                'created_at' => $transactionProduct->created_at?->toIso8601String(),
                                'updated_at' => $transactionProduct->updated_at?->toIso8601String(),
                                'products' => [
                                    'productId' => $transactionProduct->products->productId,
                                    'productName' => $transactionProduct->products->productName ?? 'Unknown Product',
                                    'productType' => $transactionProduct->products->productType,
                                    'cost' => $transactionProduct->products->cost,
                                    'addedBy' => $transactionProduct->products->addedBy,
                                    'status' => $transactionProduct->products->status,
                                    'created_at' => $transactionProduct->products->created_at->toIso8601String(),
                                    'updated_at' => $transactionProduct->products->updated_at->toIso8601String(),
                                ],
                            ];
                        })->toArray(),
                    ];

                    return response()->json($response, 202);
                });
            } else {
                \Log::error('Moniepoint payment failed', [
                    'transactionId' => $transactionId,
                    'status' => $moniepointResponse->status(),
                    'body' => $moniepointResponse->body(),
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => $moniepointResponse->json('error', 'Payment request failed'),
                ], 422);
            }
        }

        // Handle loan payment method (if applicable)
        throw new \Exception('Loan payment method not implemented');
    } catch (\Exception $e) {
        \Log::error('Transaction initiation failed', [
            'error' => $e->getMessage(),
            'transactionId' => $transactionId ?? null,
        ]);

        return response()->json([
            'message' => 'Failed to initiate transaction',
            'error' => $e->getMessage(),
        ], 500);
    }
}
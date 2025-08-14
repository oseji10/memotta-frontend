  $moniepointResponse = Http::withOptions([
    'verify' => false,
])->withHeaders([
        'Authorization' => 'Bearer mptp_a72e62d6220b4c279f05f0d90c71f79b_cce5ff',
        'Cookie' => '__cf_bm=llJAllZZ4ww_EAgd7WsHAiW9Xhdt5tOKkWsvByK6X2c-1750629087-1.0.1.1-2zOUQHrb5PyiYLrXqoA6kiONrHhKIZ2z7ifHO.iSk1Ue539LjL8bhuUWeZ7RaafQfCvMnh9Ke08Ks7Kkt4k0T2H0uJb89.aTwZt52.qkpyM'
    ])->post('https://api.pos.moniepoint.com/v1/transactions', [
        'terminalSerial' => 'P260302358597',
        'amount' => $totalCostInKobo,
        'merchantReference' => $transactionId,
        'transactionType' => 'PURCHASE',
        'paymentMethod' => 'CARD_PURCHASE'
    ]);
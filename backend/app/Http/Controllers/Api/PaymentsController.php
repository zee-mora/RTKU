<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payments;
use App\Models\Trhouse_residents;
use App\Models\Expenses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PaymentsController extends Controller
{
    public function options(): JsonResponse
    {
        $options = Trhouse_residents::query()
            ->with(['resident', 'house'])
            ->where('is_active', true)
            ->whereNull('end_date')
            ->orderByDesc('start_date')
            ->get()
            ->map(static function (Trhouse_residents $occupancy): array {
                return [
                    'id' => $occupancy->id,
                    'house_number' => $occupancy->house?->house_number,
                    'resident_name' => $occupancy->resident?->fullname,
                    'label' => trim(sprintf(
                        '%s - %s',
                        $occupancy->house?->house_number ?? '-',
                        $occupancy->resident?->fullname ?? '-'
                    )),
                ];
            });

        return response()->json(['data' => $options]);
    }

    public function datatable(Request $request)
    {
        return \App\Helpers\Datatables\Datatables::method(
            DB::table('payments as p')
                ->leftJoin('trhouse_residents as tr', 'tr.id', '=', 'p.trhouse_resident_id')
                ->leftJoin('Mresidents as r', 'r.id', '=', 'tr.resident_id')
                ->leftJoin('Mhouses as h', 'h.id', '=', 'tr.house_id')
                ->select([
                    'p.id',
                    'p.trhouse_resident_id',
                    'p.amount',
                    'p.type',
                    'p.month',
                    'p.year',
                    'p.status',
                    'p.paid_at',
                    'r.fullname as resident_name',
                    'h.house_number as house_number',
                ]),
            [
                'id', 'resident_name', 'house_number', 'type', 'month', 'year', 'amount', 'status', 'paid_at'
            ],
            $request,
        )->make();
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'trhouse_resident_id' => ['required', 'integer', Rule::exists('trhouse_residents', 'id')],
            'amount' => ['required', 'numeric'],
            'type' => ['required', 'in:Satpam,Kebersihan'],
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer'],
            'status' => ['required', 'in:Lunas,Belum Bayar'],
            'periods' => ['nullable', 'integer', 'between:1,12'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $periods = (int) ($validated['periods'] ?? 1);
        $periods = max(1, min(12, $periods));

        if ($validated['type'] === 'Satpam' && $periods !== 1) {
            return response()->json([
                'message' => 'Iuran satpam harus dibayar per bulan.',
            ], 422);
        }

        if ($periods > 1 && $validated['status'] !== 'Lunas') {
            return response()->json([
                'message' => 'Pembayaran untuk beberapa bulan harus berstatus lunas.',
            ], 422);
        }

        $startPeriod = Carbon::create((int) $validated['year'], (int) $validated['month'], 1)->startOfMonth();
        $createdPayments = [];

        DB::transaction(function () use ($validated, $periods, $startPeriod, &$createdPayments): void {
            for ($index = 0; $index < $periods; $index++) {
                $periodDate = $startPeriod->copy()->addMonths($index);

                $createdPayments[] = Payments::create([
                    'trhouse_resident_id' => $validated['trhouse_resident_id'],
                    'amount' => $validated['amount'],
                    'type' => $validated['type'],
                    'month' => (int) $periodDate->month,
                    'year' => (int) $periodDate->year,
                    'status' => $validated['status'],
                    'paid_at' => $validated['status'] === 'Lunas' ? ($validated['paid_at'] ?? now()) : null,
                ]);
            }
        });

        return response()->json([
            'message' => $periods > 1
                ? 'Pembayaran beberapa bulan berhasil dicatat.'
                : 'Pembayaran dicatat.',
            'data' => $createdPayments,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $payment = Payments::query()->findOrFail($id);

        $validated = $request->validate([
            'amount' => ['required', 'numeric'],
            'type' => ['required', 'in:Satpam,Kebersihan'],
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer'],
            'status' => ['required', 'in:Lunas,Belum Bayar'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $payment->update($validated);

        return response()->json(['message' => 'Pembayaran diperbarui.', 'data' => $payment], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $payment = Payments::query()->findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Pembayaran dihapus.'], 200);
    }

    public function reportSummary(Request $request): JsonResponse
    {
        $year = (int) ($request->input('year') ?? date('Y'));

        $income = Payments::query()
            ->where('status', 'Lunas')
            ->where('year', $year)
            ->selectRaw('month as month, SUM(amount) as total')
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $expenses = Expenses::query()
            ->whereYear('expense_date', $year)
            ->selectRaw('MONTH(expense_date) as month, SUM(amount) as total')
            ->groupByRaw('MONTH(expense_date)')
            ->pluck('total', 'month')
            ->toArray();

        $months = range(1, 12);
        $data = array_map(function ($m) use ($income, $expenses) {
            return [
                'month' => $m,
                'income' => isset($income[$m]) ? (float) $income[$m] : 0.0,
                'expense' => isset($expenses[$m]) ? (float) $expenses[$m] : 0.0,
            ];
        }, $months);

        return response()->json(['data' => $data]);
    }

    public function reportDetail(Request $request): JsonResponse
    {
        $year = (int) ($request->input('year') ?? date('Y'));
        $month = (int) ($request->input('month') ?? date('n'));

        $payments = Payments::query()
            ->join('trhouse_residents as tr', 'tr.id', '=', 'payments.trhouse_resident_id')
            ->join('Mresidents as r', 'r.id', '=', 'tr.resident_id')
            ->where('payments.year', $year)
            ->where('payments.month', $month)
            ->select([
                'payments.id', 'payments.amount', 'payments.type', 'payments.status', 'payments.paid_at', 'r.fullname as resident_name'
            ])
            ->get();

        $expenses = Expenses::query()
            ->whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month)
            ->select(['id', 'description', 'amount', 'expense_date'])
            ->get();

        return response()->json(['data' => ['payments' => $payments, 'expenses' => $expenses]]);
    }
}

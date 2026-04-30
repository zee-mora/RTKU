<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Datatables\Datatables;
use App\Http\Controllers\Controller;
use App\Models\Mresidents;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PenghuniController extends Controller
{
    /**
     * get resident details by id
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $resident = Mresidents::findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $resident->id,
                'fullname' => $resident->fullname,
                'ktp_path' => $resident->ktp_path,
                'photo_url' => $resident->ktp_path ? Storage::url($resident->ktp_path) : null,
                'resident_status' => $resident->resident_status,
                'phone_number' => $resident->phone_number,
                'marital_status' => $resident->marital_status,
            ],
        ], 200);
    }

    public function Datatable(Request $request)
    {
        return Datatables::method(
            Mresidents::query(),
            [
                'id',
                'fullname',
                'ktp_path',
                'resident_status',
                'phone_number',
                'marital_status',
            ],
            $request,
        )->make();
    }

    public function Add(Request $req)
    {
        return $this->store($req);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fullname' => 'required|string|max:255',
            'phone_number' => 'required|string|max:30',
            'marital_status' => 'required|in:Sudah Menikah,Belum Menikah',
            'resident_status' => 'required|in:Tetap,Kontrak',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $photoPath = null;

        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('residents/photos', 'public');
        }

        $resident = Mresidents::create([
            'fullname' => $validated['fullname'],
            'ktp_path' => $photoPath,
            'resident_status' => $validated['resident_status'],
            'phone_number' => $validated['phone_number'],
            'marital_status' => $validated['marital_status'],
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Penghuni berhasil ditambahkan.',
            'data' => [
                'id' => $resident->id,
                'fullname' => $resident->fullname,
                'ktp_path' => $resident->ktp_path,
                'photo_url' => $resident->ktp_path ? Storage::url($resident->ktp_path) : null,
                'resident_status' => $resident->resident_status,
                'phone_number' => $resident->phone_number,
                'marital_status' => $resident->marital_status,
            ],
        ], 201);
    }

    /**
     * Update existing resident
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $resident = Mresidents::findOrFail($id);

        $validated = $request->validate([
            'fullname' => 'required|string|max:255',
            'phone_number' => 'required|string|max:30',
            'marital_status' => 'required|in:Sudah Menikah,Belum Menikah',
            'resident_status' => 'required|in:Tetap,Kontrak',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            // delete old file if exists
            if ($resident->ktp_path) {
                Storage::disk('public')->delete($resident->ktp_path);
            }
            $photoPath = $request->file('photo')->store('residents/photos', 'public');
            $resident->ktp_path = $photoPath;
        }

        $resident->fullname = $validated['fullname'];
        $resident->phone_number = $validated['phone_number'];
        $resident->marital_status = $validated['marital_status'];
        $resident->resident_status = $validated['resident_status'];
        $resident->updated_by = $request->user()?->id;
        $resident->save();

        return response()->json([
            'message' => 'Penghuni berhasil diperbarui.',
            'data' => [
                'id' => $resident->id,
                'fullname' => $resident->fullname,
                'ktp_path' => $resident->ktp_path,
                'photo_url' => $resident->ktp_path ? Storage::url($resident->ktp_path) : null,
                'resident_status' => $resident->resident_status,
                'phone_number' => $resident->phone_number,
                'marital_status' => $resident->marital_status,
            ],
        ], 200);
    }

    /**
     * Delete existing resident
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        if ($id != null) {
            $resident = Mresidents::find($id);
            if (!$resident) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Penghuni tidak ditemukan.',
                ], 404);
            }
            $resident->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Penghuni berhasil dihapus.',
            ], 200);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'ID penghuni tidak valid.',
            ], 400);
        }
    }
}

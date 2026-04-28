<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->res->json($validator->errors(), 422);
        }

        $credentials = $req->only(['email', 'password']);

        if (!$token = auth('api')->attempt($credentials)) {
            return $this->res->json([
                'message' => 'Email atau password salah.'
            ], 401);
        }

        return $this->res->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => auth('api')->user(),
            'status' => 'success',
            'message' => 'Login berhasil.'
        ]);
    }
}

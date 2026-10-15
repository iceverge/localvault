<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    public function index()
    {
        return Account::query()->orderByDesc('updated_at')->get();
    }

    private function validated(Request $request, bool $updating = false): array
    {
        return $request->validate([
            'site' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'url:http,https', 'max:2048'],
            'username' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'password' => [$updating ? 'sometimes' : 'required', 'required', 'string', 'max:4096'],
            'category' => ['required', Rule::in(['Work', 'Personal', 'Finance', 'Social', 'Development', 'Other'])],
            'notes' => ['nullable', 'string', 'max:10000'],
            'favorite' => ['sometimes', 'boolean'],
        ]);
    }

    public function store(Request $request)
    {
        return response()->json(Account::create($this->validated($request)), 201);
    }

    public function update(Request $request, Account $account)
    {
        $account->update($this->validated($request, true));

        return $account->fresh();
    }

    public function favorite(Request $request, Account $account)
    {
        $account->update($request->validate(['favorite' => ['required', 'boolean']]));

        return $account;
    }

    public function reveal(Account $account)
    {
        return response()->json(['password' => $account->password]);
    }

    public function destroy(Account $account)
    {
        $account->delete();

        return response()->noContent();
    }
}

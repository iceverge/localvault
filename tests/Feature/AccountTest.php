<?php

namespace Tests\Feature;

use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    private function payload(): array
    {
        return ['site' => 'Example', 'url' => 'https://example.com', 'username' => 'example-user', 'email' => 'user@example.com', 'password' => '  Exact-secret-12!  ', 'category' => 'Work', 'favorite' => false];
    }

    public function test_account_lifecycle_and_password_encryption(): void
    {
        $response = $this->postJson('/api/accounts', $this->payload())->assertCreated()->assertJsonMissingPath('password');
        $id = $response->json('id');
        $raw = DB::table('accounts')->where('id', $id)->value('password');
        $this->assertNotEquals($this->payload()['password'], $raw);
        $this->getJson('/api/accounts')->assertOk()->assertJsonCount(1)->assertJsonMissingPath('0.password');
        $this->postJson("/api/accounts/$id/reveal")->assertOk()->assertExactJson(['password' => $this->payload()['password']])->assertHeader('Cache-Control', 'no-store, private');
        $this->putJson("/api/accounts/$id", ['site' => 'Updated', 'category' => 'Personal'])->assertOk();
        $this->assertSame($this->payload()['password'], Account::find($id)->password);
        $this->putJson("/api/accounts/$id", ['site' => 'Updated', 'category' => 'Personal', 'password' => 'replacement!'])->assertOk();
        $this->postJson("/api/accounts/$id/reveal")->assertJsonPath('password', 'replacement!');
        $this->patchJson("/api/accounts/$id/favorite", ['favorite' => true])->assertOk()->assertJsonPath('favorite', true);
        $this->deleteJson("/api/accounts/$id")->assertNoContent();
        $this->assertDatabaseCount('accounts', 0);
        $this->postJson("/api/accounts/$id/reveal")->assertNotFound();
    }

    public function test_invalid_inputs_are_rejected(): void
    {
        $this->postJson('/api/accounts', [])->assertUnprocessable()->assertJsonValidationErrors(['site', 'password', 'category']);
        $this->postJson('/api/accounts', [...$this->payload(), 'url' => 'javascript:alert(1)', 'category' => 'Invalid', 'email' => 'bad'])->assertUnprocessable()->assertJsonValidationErrors(['url', 'category', 'email']);
    }

    public function test_remote_connections_and_untrusted_hosts_are_rejected(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '192.168.1.10'])->getJson('/api/accounts')->assertForbidden();
        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1', 'HTTP_HOST' => 'evil.example'])->getJson('http://evil.example/api/accounts')->assertForbidden();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = ['site', 'url', 'username', 'email', 'password', 'category', 'notes', 'favorite'];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return ['password' => 'encrypted', 'favorite' => 'boolean'];
    }
}

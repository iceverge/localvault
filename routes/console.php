<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('vault:initialize', function () {
    if (! config('app.key')) {
        $this->call('key:generate');
    }

    if (config('database.default') === 'sqlite' && ! file_exists(database_path('database.sqlite'))) {
        touch(database_path('database.sqlite'));
    }

    $this->call('migrate', ['--force' => true]);
    $this->info('LocalVault is ready. Existing encryption keys are preserved.');
})->purpose('Initialize local storage without replacing an existing encryption key');

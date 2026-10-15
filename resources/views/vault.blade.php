<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}"><meta name="theme-color" content="#182924">
<meta name="vault-password-prefix" content="{{ config('app.password_prefix') }}">
<title>LocalVault — Your private workspace</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
@viteReactRefresh
@vite('resources/js/app.tsx')
</head><body><div id="root"></div></body></html>

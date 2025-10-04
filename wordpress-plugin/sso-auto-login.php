<?php
add_action('init', function () {
if (!isset($_GET['sso-login'])) return;


$token = isset($_GET['token']) ? $_GET['token'] : '';
$redirect = isset($_GET['redirect']) ? $_GET['redirect'] : '/wp-admin';


// Secret can be stored in wp-config.php as define('SSO_SHARED_SECRET', '...');
$secret = defined('SSO_SHARED_SECRET') ? SSO_SHARED_SECRET : get_option('sso_shared_secret');
if (!$secret) wp_die('SSO not configured');


$parts = explode('.', $token);
if (count($parts) !== 2) wp_die('Invalid token');


// base64url decode helper
$b64url_decode = function ($data) {
$remainder = strlen($data) % 4;
if ($remainder) { $padlen = 4 - $remainder; $data .= str_repeat('=', $padlen); }
return base64_decode(strtr($data, '-_', '+/'));
};


$payload_json = $b64url_decode($parts[0]);
$sig = $b64url_decode($parts[1]);


if (!$payload_json || !$sig) wp_die('Invalid token format');


$calc = hash_hmac('sha256', $payload_json, $secret, true);
if (!hash_equals($calc, $sig)) wp_die('Bad signature');


$payload = json_decode($payload_json, true);
if (!$payload) wp_die('Bad payload');


// expiry & replay protection
if (time() > intval($payload['exp'] ?? 0)) wp_die('Token expired');
$nonce = $payload['nonce'] ?? '';
if (!$nonce) wp_die('No nonce');
if (get_transient('sso_nonce_' . $nonce)) wp_die('Replay');
set_transient('sso_nonce_' . $nonce, '1', 120); // 2 minutes


// audience binding (domain match)
$aud = $payload['aud'] ?? '';
$host = $_SERVER['HTTP_HOST'];
if ($aud !== $host) wp_die('Audience mismatch');


// login
$login = $payload['login'] ?? '';
$user = get_user_by('login', $login);
if (!$user) wp_die('User not found');


wp_set_current_user($user->ID);
wp_set_auth_cookie($user->ID, true);


// restrict redirects to same host
$safe = wp_validate_redirect($redirect, '/wp-admin');
wp_safe_redirect($safe);
exit;
});

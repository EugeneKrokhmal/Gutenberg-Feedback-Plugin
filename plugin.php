<?php
/**
 * Plugin Name: Feedback Form
 * Version: 1.0.0
 * Author: Eugene Krokhmal
 */

if (!defined('ABSPATH')) exit;

function feedback_register_block() {
    wp_register_script(
        'feedback-form-script',
        plugins_url('build/index.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-editor'],
        filemtime(plugin_dir_path(__FILE__) . 'build/index.js')
    );

    wp_enqueue_script(
        'feedback-submit',
        plugins_url('build/formRender.js', __FILE__),
        ['wp-element'],
        filemtime(plugin_dir_path(__FILE__) . 'build/formRender.js'),
        true
    );

    wp_localize_script('feedback-submit', 'feedbackAjax', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('feedback_nonce')
    ]);    

    wp_register_style(
        'feedback-form-style',
        plugins_url('build/style.css', __FILE__),
        [],
        filemtime(plugin_dir_path(__FILE__) . 'build/style.css')
    );

    register_block_type('feedback/form', [
        'editor_script' => 'feedback-form-script',
        'style'         => 'feedback-form-style',
    ]);
}
add_action('init', 'feedback_register_block');

function feedback_create_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'feedback';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}
register_activation_hook(__FILE__, 'feedback_create_table');

add_action('wp_ajax_submit_feedback', 'feedback_handle_submission');
add_action('wp_ajax_nopriv_submit_feedback', 'feedback_handle_submission');

function feedback_handle_submission() {
    if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'feedback_nonce')) {
        wp_send_json_error(['message' => 'Invalid nonce.'], 400);
    }

    if (empty($_POST['firstName']) || empty($_POST['email']) || empty($_POST['message'])) {
        wp_send_json_error(['message' => 'Missing required fields.'], 400);
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'feedback';

    $wpdb->insert($table_name, [
        'first_name' => sanitize_text_field($_POST['firstName']),
        'last_name'  => sanitize_text_field($_POST['lastName']),
        'email'      => sanitize_email($_POST['email']),
        'subject'    => sanitize_text_field($_POST['subject']),
        'message'    => sanitize_textarea_field($_POST['message']),
        'created_at' => current_time('mysql'),
    ]);

    wp_send_json_success(['message' => 'Thank you for your feedback!']);
}

function feedback_plugin_enqueue_scripts() {
    if (!is_admin()) {
        wp_enqueue_script(
            'feedback-form-render',
            plugins_url('build/formRender.js', __FILE__),
            ['wp-i18n', 'wp-element', 'wp-blocks'],
            filemtime(plugin_dir_path(__FILE__) . 'formRender.js'),
            true
        );
    }

    if (!is_admin()) {
        wp_enqueue_script(
            'feedback-entries-render',
            plugins_url('build/entriesRender.js', __FILE__),
            ['wp-i18n', 'wp-element', 'wp-blocks'],
            filemtime(plugin_dir_path(__FILE__) . 'build/entriesRender.js'),
            true
        );

        wp_localize_script('feedback-entries-render', 'feedbackEntriesData', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce'   => wp_create_nonce('feedback_entries_nonce')
        ]);
    }
}
add_action('wp_enqueue_scripts', 'feedback_plugin_enqueue_scripts');

function enable_rest_api_users($result) {
    if (is_wp_error($result)) {
        return $result;
    }
    return true;
}
add_filter('rest_authentication_errors', 'enable_rest_api_users');

function feedback_plugin_add_user_fields_to_rest_api($response, $user, $request) {
    if (get_current_user_id() !== $user->ID) {
        return $response;
    }

    $response->data['first_name'] = get_user_meta($user->ID, 'first_name', true);
    $response->data['last_name']  = get_user_meta($user->ID, 'last_name', true);
    $response->data['email']      = $user->user_email;

    return $response;
}
add_filter('rest_prepare_user', 'feedback_plugin_add_user_fields_to_rest_api', 10, 3);

function feedback_plugin_enqueue_admin_scripts() {
    if (current_user_can('administrator')) {
        wp_enqueue_script(
            'feedback-entries-render',
            plugins_url('build/entriesRender.js', __FILE__),
            ['wp-i18n', 'wp-element', 'wp-blocks'],
            filemtime(plugin_dir_path(__FILE__) . 'build/entriesRender.js'),
            true
        );
    }

    wp_localize_script('feedback-entries-render', 'feedbackEntriesData', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('feedback_entries_nonce')
    ]);
}
add_action('admin_enqueue_scripts', 'feedback_plugin_enqueue_admin_scripts');


add_action('wp_ajax_fetch_feedback_entries', 'feedback_fetch_entries');
add_action('wp_ajax_nopriv_fetch_feedback_entries', 'feedback_fetch_entries');

function feedback_fetch_entries() {
    if (!current_user_can('administrator')) {
        wp_send_json_error(['message' => 'You are not authorized to view this page.']);
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'feedback';
    $page = isset($_POST['page']) ? absint($_POST['page']) : 1;
    $offset = ($page - 1) * 10;

    $entries = $wpdb->get_results("SELECT id, first_name, last_name, email, subject, message FROM $table_name LIMIT 10 OFFSET $offset");
    $total_entries = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");

    wp_send_json_success([
        'entries' => $entries,
        'totalPages' => ceil($total_entries / 10),
    ]);
}

add_action('wp_ajax_fetch_feedback_entry_details', 'feedback_fetch_entry_details');
add_action('wp_ajax_nopriv_fetch_feedback_entry_details', 'feedback_fetch_entry_details');

function feedback_fetch_entry_details() {
    if (!current_user_can('administrator')) {
        wp_send_json_error(['message' => 'You are not authorized to view this page.']);
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'feedback';
    $entry_id = isset($_POST['entry_id']) ? absint($_POST['entry_id']) : 0;

    if (!$entry_id) {
        wp_send_json_error(['message' => 'Invalid entry ID.']);
    }

    $entry = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $entry_id));
    if (!$entry) {
        wp_send_json_error(['message' => 'Entry not found.']);
    }

    wp_send_json_success(['entry' => $entry]);
}

wp_set_script_translations(
    'feedback-form-render',
    'feedback-plugin',
    plugin_dir_path(__FILE__) . 'languages'
);

<?php
/*
Plugin Name: Workflowy-MP to Markdown Converter
Plugin URI: https://github.com/yourusername/workflowy-to-markdown
Description: A WordPress plugin that converts Workflowy-MD output to cleaner Markdown format. Use the shortcode [workflowy_markdown] to convert your Workflowy content into clean Markdown format in your posts or pages.
Version: 1.0
Author: Dushan Wegner
Author URI: https://dushanwegner.com
License: GPL v2 or later
*/

// Prevent direct access to this file
if (!defined('ABSPATH')) {
    exit;
}

// Add shortcode (by using a shortcode, any page can be turned into a workflowy-to-markdown converter)
function wf2md_converter_shortcode() {
    // Enqueue necessary scripts
    wp_enqueue_script('marked-js', 'https://cdn.jsdelivr.net/npm/marked/marked.min.js', array(), '4.0.0', true);
    wp_enqueue_script('wf2md-script', plugins_url('js/wf2md.js', __FILE__), array('jquery', 'marked-js'), '1.0', true);
    
    // Return HTML for the converter
    return '
    <div class="wf2md-converter">
        <textarea id="wf2md-textarea" style="width: 100%; height: 300px;"></textarea>
        <div style="margin: 10px 0;">
            <label style="display: inline-flex; align-items: center; gap: 5px;">
                <input type="checkbox" id="wf2md-remove-first-h2" style="margin: 0;">
                Remove first H2
            </label>
        </div>
        <button type="button" id="wf2md_cleanup_button" class="button button-primary">Clean up</button>
        <div id="wf2md-preview" style="margin-top: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 4px;"></div>
    </div>
    ';
}
add_shortcode('workflowy_markdown', 'wf2md_converter_shortcode');

// Add plugin scripts
function wf2md_enqueue_scripts() {
    if (has_shortcode(get_post()->post_content, 'workflowy_markdown')) {
        wp_enqueue_style('wf2md-styles', plugins_url('css/wf2md.css', __FILE__));
    }
}
add_action('wp_enqueue_scripts', 'wf2md_enqueue_scripts');

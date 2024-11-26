<?php
/*
Plugin Name: Workflowy-MP to Markdown Converter
Plugin URI: https://github.com/yourusername/workflowy-to-markdown
Description: A WordPress plugin that converts Workflowy-MD output to cleaner Markdown format. Use the shortcode [workflowy_markdown] to convert your Workflowy content into clean Markdown format in your posts or pages.
Version: 1.1
Author: Dushan Wegner
Author URI: https://dushanwegner.com
License: GPL v2 or later
*/

// Prevent direct access to this file
if (!defined('ABSPATH')) {
    exit;
}

// Add plugin scripts
function wf2md_enqueue_scripts() {
    wp_enqueue_script('jquery');
    
    // Use CDN for marked.js to ensure it's available
    wp_enqueue_script('marked-js', 'https://cdn.jsdelivr.net/npm/marked/marked.min.js', array(), '4.0.0', true);
    
    // Load our script after marked.js
    wp_enqueue_script('wf2md-script', plugins_url('js/wf2md.js', __FILE__), array('jquery', 'marked-js'), '1.0', true);
    
    // Add TinyMCE
    wp_enqueue_editor();
    
    // Add our styles
    wp_enqueue_style('wf2md-styles', plugins_url('css/wf2md.css', __FILE__));
}
add_action('wp_enqueue_scripts', 'wf2md_enqueue_scripts');

// Add shortcode (by using a shortcode, any page can be turned into a workflowy-to-markdown converter)
function wf2md_converter_shortcode() {
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
        <button type="button" id="wf2md_cleanup_button" class="wf2md_button button button-primary">Clean up</button>
        <br/>
        <div class="wf2md-preview-container">
            <div class="wf2md-tabs">
                <div class="wf2md-tab-buttons">
                    <button type="button" class="wf2md-tab-button active" data-tab="rich">Rich Text</button>
                    <button type="button" class="wf2md-tab-button" data-tab="html">HTML</button>
                </div>
            </div>
            
            <div class="wf2md-preview-section">
                <div id="wf2md-rich-tab" class="wf2md-tab active">
                    <button type="button" id="wf2md-select-preview" class="wf2md_button button">Select Rich Text</button>
                    <div id="wf2md-preview-wrapper">
                        <textarea id="wf2md-rich-preview"></textarea>
                    </div>
                </div>
                <div id="wf2md-html-tab" class="wf2md-tab">
                    <button type="button" id="wf2md-copy-html" class="wf2md_button button">Copy HTML</button>
                    <pre id="wf2md-html-preview"></pre>
                </div>
            </div>
        </div>
    </div>
    ';
}
add_shortcode('workflowy_markdown', 'wf2md_converter_shortcode');

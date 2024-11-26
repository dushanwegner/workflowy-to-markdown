jQuery(document).ready(function($) {
    // Configure marked options
    const options = {
        breaks: true,
        gfm: true
    };

    function updatePreview() {
        var text = $('#wf2md-textarea').val();
        // Convert markdown to HTML
        var html = marked.parse(text, options);
        // Clean up newlines around em tags while preserving punctuation
        html = html
            .replace(/(\w)\s*\n?\s*<em>/g, '$1 <em>')  // add space only after word characters
            .replace(/<em>\s*\n?\s*(\w)/g, '<em>$1')   // remove space after opening em
            .replace(/(\w)\s*\n?\s*<\/em>/g, '$1</em>') // remove space before closing em
            .replace(/<\/em>\s*\n?\s*(\w)/g, '</em> $1'); // add space only before word characters
        $('#wf2md-preview').html(html);
    }

    // Function to select rich text and show feedback
    function selectRichText() {
        const previewContent = document.getElementById('wf2md-preview');
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Select the preview content
        range.selectNodeContents(previewContent);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Show feedback message
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? '⌘' : 'Ctrl';
        const $button = $('#wf2md-select-preview');
        $button.text(`Selected! Press ${modifier}+C to copy`);
        setTimeout(() => {
            $button.text('Select Rich Text');
        }, 2000);
    }

    // Function to copy HTML and show feedback
    function copyHtml() {
        const text = $('#wf2md-textarea').val();
        // Convert markdown to HTML with our custom cleanup
        let html = marked.parse(text, options);
        html = html
            .replace(/(\w)\s*\n?\s*<em>/g, '$1 <em>')
            .replace(/<em>\s*\n?\s*(\w)/g, '<em>$1')
            .replace(/(\w)\s*\n?\s*<\/em>/g, '$1</em>')
            .replace(/<\/em>\s*\n?\s*(\w)/g, '</em> $1');

        // Create temporary textarea and copy its contents
        const $temp = $('<textarea>');
        $('body').append($temp);
        $temp.val(html).select();
        
        try {
            // Try to copy
            document.execCommand('copy');
            const $button = $('#wf2md-copy-html');
            $button.text('HTML Copied!');
            setTimeout(() => {
                $button.text('Copy HTML');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            const $button = $('#wf2md-copy-html');
            $button.text('Copy failed!');
            setTimeout(() => {
                $button.text('Copy HTML');
            }, 2000);
        } finally {
            $temp.remove();
        }
    }

    // Load checkbox state from cookie
    const removeFirstH2Cookie = 'wf2md_remove_first_h2';
    $('#wf2md-remove-first-h2').prop('checked', localStorage.getItem(removeFirstH2Cookie) === 'true');

    // Save checkbox state to cookie
    $('#wf2md-remove-first-h2').on('change', function() {
        localStorage.setItem(removeFirstH2Cookie, this.checked);
    });

    // Event handlers
    $('#wf2md-textarea').on('input', updatePreview);
    $('#wf2md-select-preview').on('click', selectRichText);
    $('#wf2md-copy-html').on('click', copyHtml);

    $('#wf2md_cleanup_button').on('click', function() {
        var text = $('#wf2md-textarea').val();

        // remove any initial spaces or newlines on the beginning of the text
        text = text.replace(/^\s+/, '');

        // turn first line into markdown-h1 if it does not start with - or #
        if (!text.startsWith('- ') && !text.startsWith('# ')) {
            text = '# ' + text;
        }

        console.log('Initial text:', text);

        // First convert top-level bullets to h2
        text = text.replace(/^- /gm, '\n## ');
        console.log('After converting top-level bullets:', text);

        // Then process indented bullets based on their level
        text = text.replace(/([^\n]*)\n(\s{2,})- ([^\n]*)/gm, function(match, prevLine, spaces, bulletContent) {
            console.log('Found indented bullet:', {
                fullMatch: match,
                prevLine: prevLine,
                bulletContent: bulletContent,
                spacesLength: spaces.length,
                spacesString: JSON.stringify(spaces)
            });

            // If it's a second level bullet (2 spaces), keep paragraph break
            if (spaces.length === 2) {
                console.log('Keeping paragraph break (2 spaces)');
                return prevLine + '\n\n- ' + bulletContent;
            }
            // For higher levels, join with previous line
            console.log('Joining with previous line (higher level)');
            return prevLine + ' ' + bulletContent;
        });

        // If remove first H2 is checked, remove it now after all bullet processing is done
        if ($('#wf2md-remove-first-h2').prop('checked')) {
            console.log('Before removing H2:', text.split('\n').map((line, i) => `${i}: ${line}`).join('\n\n\n'));

            // First, find the H1 and the first H2
            let parts = text.match(/(^# [^\n]+)(\n+)(## [^\n]+)(\n+)(.*)/s);
            if (parts) {
                // Reconstruct without the H2
                text = parts[1] + '\n\n' + parts[5];
                console.log('Parts:', {
                    h1: parts[1],
                    spacingAfterH1: parts[2].length,
                    h2: parts[3],
                    spacingAfterH2: parts[4].length,
                    rest: parts[5].substring(0, 50) + '...'
                });
            }
        }

        // First normalize all line breaks to single newlines
        text = text.replace(/\n{2,}/g, '\n');
        
        // Remove bullet points (- ) at any indentation level
        text = text.replace(/^(\s*)- /gm, '$1');
        
        // Fix italics formatting - process line by line
        text = text.split('\n').map(line => {
            return line.replace(/([^\s*])?(\s*)\*(\s*)([^*]+?)(\s*)\*(\s*)([^\s*])?/g, function(match, before, spacesBefore, spacesInStart, content, spacesInEnd, spacesAfter, after) {
                // Define character sets for spacing rules
                const punctuation = /^[.!?,;:)\]}"'(\[{]$/;
                
                // Build prefix - no space if it's punctuation
                let prefix = '';
                if (before) {
                    prefix = punctuation.test(before) ? before : before + ' ';
                }
                
                // Build suffix - no space if it's punctuation
                let suffix = '';
                if (after) {
                    suffix = punctuation.test(after) ? after : ' ' + after;
                }
                
                return prefix + '*' + content.trim() + '*' + suffix;
            });
        }).filter(line => line.trim()).join('\n\n');  // Filter empty lines and join with double newlines

        // remove any trailing newlines or spaces
        text = text.replace(/\s+$/, '');

        $('#wf2md-textarea').val(text);
        updatePreview();

        $('#wf2md-textarea').select();

        var $button = $(this);
        // Use ⌘ for macOS, Ctrl for other platforms
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? '⌘' : 'Ctrl';
        $button.text(`Cleaned up! Press ${modifier}+C to copy`);
        setTimeout(function() {
            $button.text('Clean up');
        }, 2000);
    });
});

jQuery(document).ready(function($) {
    function updatePreview() {
        var text = $('#wf2md-textarea').val();
        $('#wf2md-preview').html(marked.parse(text));
    }

    // Load checkbox state from cookie
    const removeFirstH2Cookie = 'wf2md_remove_first_h2';
    $('#wf2md-remove-first-h2').prop('checked', localStorage.getItem(removeFirstH2Cookie) === 'true');

    // Save checkbox state to cookie
    $('#wf2md-remove-first-h2').on('change', function() {
        localStorage.setItem(removeFirstH2Cookie, this.checked);
    });

    // Update preview on input
    $('#wf2md-textarea').on('input', updatePreview);

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

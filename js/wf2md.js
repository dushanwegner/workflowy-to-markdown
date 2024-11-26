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

        // remove all newlines that are more than double and replace them with a double newline
        text = text.replace(/\n{3,}/g, '\n\n');

        // turn lines that start with any amount of spaces and then "- " into new lines
        text = text.replace(/^\s*- /gm, '\n');

        // remove all newlines that are more than double and replace them with a double newline
        text = text.replace(/\n{3,}/g, '\n\n');

        // when italics-passages accidentally contain a space at the end, fix ist. Meaning: convert *xxxxx xxxx *xxx to *xxxxx xxxx* xxx.
        text = text.replace(/\*([^*]+)\s+\*/g, '*$1* ');

        // remove any trailing newlines or spaces
        text = text.replace(/\s+$/, '');

        $('#wf2md-textarea').val(text);
        updatePreview();

        // Copy to clipboard
        $('#wf2md-textarea').select();
        document.execCommand('copy');

        var $button = $(this);
        $button.text('Cleaned up version copied!');
        setTimeout(function() {
            $button.text('Clean up');
        }, 2000);
    });
});

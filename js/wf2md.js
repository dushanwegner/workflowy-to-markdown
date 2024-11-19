jQuery(document).ready(function($) {
    $('#wf2md_cleanup_button').on('click', function() {
        var text = $('#wf2md-textarea').val();

        // remove any initial spaces or newlines on the beginning of the text
        text = text.replace(/^\s+/, '');

        // turn first line into markdown-h1 if it does not start with - or #
        if (!text.startsWith('- ') && !text.startsWith('# ')) {
            text = '# ' + text;
        }

        // turn lines that start with - into markdown-h2
        text = text.replace(/^- /gm, '\n## ');

        // turn lines that start with any amount of spaces and then "- " into new lines
        text = text.replace(/^\s*- /gm, '\n');
        
        // remove all newlines that are more than double and replace them with a double newline
        text = text.replace(/\n{3,}/g, '\n\n');

        // remove any trailing newlines or spaces
        text = text.replace(/\s+$/, '');

        $('#wf2md-textarea').val(text);

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

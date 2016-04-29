var common = {
  editor: {
    forceSync: true,
    placeholder: 'Type here...! Supports Markdown :)',
    tabSize: 4,
    toolbar: [
      "bold", "italic", "heading", "|", 
      "quote", "code", "|", 
      "unordered-list", "ordered-list", "|", 
      "link", "image", "table", "horizontal-rule", "|",
      "preview", "side-by-side", "fullscreen", "|",
      {
        name: "markdown",
        action: function() {
          var win = window.open('http://daringfireball.net/projects/markdown/', '_blank');
          win.focus();
        },
        className: "fa fa-question-circle",
        title: "Guide"
      }
    ],
    insertTexts: {
      horizontalRule: ["", "\n-----\n"],
      table: ["", "\n| column1 | column2 | column3 |\n| -----------  | ----------- | ----------- |\n| text1         | text2        | text3        |\n| text1         | text2        | text3        |\n"],
    },
    renderingConfig: {
      codeSyntaxHighlighting: true
    },
    blockStyles: {
      italic: '_'
    }
  }
};
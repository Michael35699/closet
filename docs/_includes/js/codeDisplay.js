{% assign theId = include.content.name | slugify %}
{% assign theCode = include.content.code | replace: "'", "\\'" | newline_to_br | strip_newlines %}
{% assign fm = include.filterManager | strip %}

Prism.languages.plaintext = {
    tagstart: {
        pattern: /\[\[[a-zA-Z]+\d*/u,
        inside: {
            tagstart: /\[\[/u,
            tagname: /[a-zA-Z]+\d*/u,
        },
    },
    tagend: /\]\]/,
    altsep: /\|\|/,
    argsep: /::/,
}

{% for button in theButtons %}
{% assign theButton = button | split: ", " %}
readyRenderButton(
    '#{{ theId }} .btn-{{ theButton[1] }}',
    '#{{ theId }} > .display',
    '{{ theCode }}',
    {{ theButton[2] }} /* the preset */,
    {{ theButton[3] }} /* keep memory or not */,
    {% if fm %}
    // inject filterManager
    ((preset) => {
        const filterManager = new Closet.FilterManager(preset)
        {{ fm }}
        return filterManager
    })({{ theButton[2] }}),
    {% endif %}
)
{% endfor %}

readyFmButton(
    '#{{ theId }} .btn-fm',
    '#{{ theId }} .fm-display',
    `{{ fm }}`.trim(),
)

readyTryButton(
    '#{{ theId }} .btn-edit',
    '{{ theCode }}',
)

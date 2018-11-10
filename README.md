# MDBook Presentation Preprocessor
A preprocessor for utilizing an MDBook as slides
for a presentation.

The goal of this project is to allow the writing of one
MDBook that can be used as both presentation and me-book
style website.

## Usage
First you need to install the pre-processor by running the following
command.

```sh
cargo install mdbook-presentation-preprocessor
```

Next you need to add the preprocessor to your `book.toml`
```toml
[book]
authors = ["Your Name"]
multilingual = false
src = "src"
title = "An Interesting Thing"
[output.html]

[preprocessor.presentation-preprocessor]
```

Now you can freely use the following syntax to mark
sections of your book as web only or presentation only.
```md
# Header for the Page
$web-only$
This content should only be displayed when the page
is in web presentation mode
$web-only-end$

$slides-only$
This content should only be displated when the page
is in slide presentation mode
$slides-only-end$
```
To toggle between slides and web, you can press `alt+p`.

A current limitation is that you would not be able to conditional
extend a bulleted or numbered list. Instead it will create a second
list just below the first.

Since MDBook doesn't offer paging from the `/` route, if you
are in presentation mode and at `/`, it will automatically
reload the page at the first entry in the navigation list.

## How It Works

The preprocessor will extract the text from the
tags and passes it to `pulldown-cmark` to convert
it into HTML. The output is wrapped in the following

```html
<!-- For $slides-only$ tagged items -->
<div class="presentation-only">
    <!-- Content would go here-->
</div>
<!-- For $web-only$ tagged items -->
<div class="article-content">
    <!-- Content would go here-->
</div>
```

Since inline HTML is still valid markdown it shouldn't impact
the rest of your book's ability to render.

It also inserts some `css` as `js` to each page.

The `js` does a few things, first it updates the url
to include a query parameter presentation_mode with a value
of either `0` for slides or `1` for web. When updating the
url it uses the `history.replaceState` api to avoid reloading
the page. To ensure that this state persists, it will also
update all of the links on the page to include the same
query parameter.

Depending on what this query parameter says it will update
all of the wrapped items to have an additional class of
either `presenting` or `not-presenting`. The `css`
will set `display: hidden;` for any items that are
`.article-content.presenting` or `.presentation-only.not-presenting`.

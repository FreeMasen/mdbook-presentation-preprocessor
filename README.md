# MDBook Presentation Preprocessor
A preprocessor for utilizing an MDBook as slides
for a presentation.

The goal of this project is to allow the writing of one
MDBook that can be used as both presentation and mdbook
style website.

See it in action [here](https://freemasen.github.io/mdbook-presentation-preprocessor/),
the source for this is in the example directory.

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
This content should only be displayed when the page
is in slide presentation mode
$slides-only-end$
```
To toggle between slides and web, you can press `alt+p`.

A current limitation is that you would not be able to conditionally
extend a bulleted or numbered list. Instead it will create a second
list just below the first.

Since MDBook doesn't offer paging from the `/` route, if you
are in presentation mode and at `/`, it will automatically
reload the page at the first entry in the navigation list.

## How It Works

The preprocessor does two things, first it replaces
all of the directives with with HTML comments that
have the same content.

```md

<!-- slides-only-->

# Slides only information
- is
- found
- here

<!-- slides-only-end-->

<!--web-only-->

# Web only information
Would be found here

<!--web-only-end-->

```

Since inline HTML is still valid markdown it shouldn't impact
the rest of your book's ability to render.

It also inserts some `css` as `js` to each page.

The `js` does a few things, maintains a new `localStorage` variable
`presentation_mode`. The value `1` is for web and the value `0`
is for presentation. It also loops through the DOM, including the comments
to add a new class to any items that are between our two comments. This would make the above
look like this

```html
<!-- slides-only-->
<h1 class="presentation-only">Slides only information</h1>
<ul class="presentation-only">
    <li>is</li>
    <li>found</li>
    <li>here</li>
</ul>
<!-- slides-only-end-->
<!--web-only-->
<h1 class="article-content">Web only information</h1>
<p class="article-content">Would be found here</p>
<!--web-only-end-->
```

It also updates these items to have another class that
indicates if `presentation_mode` is `Web` or `Slides`.

Lastly it adds an event listener for the `alt+p` shortcut.

Depending on the value of `presentation_mode` it will update
all of the wrapped items to have an additional class of
either `presenting` or `not-presenting`. The `css`
will set `display: hidden;` for any items that are
`.article-content.presenting` or `.presentation-only.not-presenting`.


# Contributing
If you are interested in contributing, I would be happy for the help

If you are find a bug, please open an issue!

If you want to make a change to the source code, please consider the following
- The `./presentationHider.ts` file is where you should be editing any of the javascript
    - To update the actual javascript, please run `tsc --outFile ./src/presentationHider.js`
- The `./presentationHider.scss` file is where you should be editing any of the css
    - To update the actual css please run your sass compiler of choice to update `./src/presentationHider.css`
    - I personally use [`rsass`](https://crates.io/crates/rsass) with the following command
        - `rsass ./presentationHider.scss > ./src/presentationHider.css`
- When editing any of the rust functionality, please keep any of the logic outside of the `impl Preprocessor` block to allow the code to be tested

For reference see [the api docs](https://github.com/FreeMasen/mdbook-presentation-preprocessor/blob/master/api_docs/api/presentationHider.md)

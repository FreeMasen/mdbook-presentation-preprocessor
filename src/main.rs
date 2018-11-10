//! # MDBook Presentation Preprocessor
//! A preprocessor for utilizing an MDBook as slides
//! for a presentation.
//!
//! The goal of this project is to allow the writing of one
//! MDBook that can be used as both presentation and me-book
//! style website.
//!
//! ## Usage
//! > book.toml
//! ```toml
//!
//! ```
extern crate mdbook;
extern crate pulldown_cmark;
extern crate serde_json;
extern crate docopt;
#[macro_use]
extern crate serde_derive;
extern crate serde;
#[macro_use]
extern crate log;

use mdbook::{
    preprocess::{CmdPreprocessor, Preprocessor, PreprocessorContext},
    book::{BookItem, Book},
    errors::{Error, Result as MdResult},
};
use pulldown_cmark::{
    html::push_html,
    Parser,
};
use docopt::Docopt;
static USAGE: &str = "
Usage:
    mdbook-presentation-preprocessor
    mdbook-presentation-preprocessor supports <supports>
";

#[derive(Deserialize)]
struct Args {
    pub arg_supports: Option<String>,
}


static NAME: &str = "mdbook-hide-presentation";
static JS: &str = include_str!("./presentationHider.js");
static CSS: &str = include_str!("./presentationHider.css");

fn main() -> MdResult<()> {
    let args: Args = Docopt::new(USAGE)
                            .and_then(|a| a.deserialize())
                            .unwrap_or_else(|e| e.exit());
    debug!("Running hide-presentation {:?}", args.arg_supports);
    let pre = WrapPresentation;
    if let Some(ref arg) = args.arg_supports {
        debug!("just getting support info {:?}", arg);
        if pre.supports_renderer(arg) {
            ::std::process::exit(0);
        } else {
            ::std::process::exit(1);
        }
    }
    debug!("pre-processing");
    let (ctx, book) = CmdPreprocessor::parse_input(::std::io::stdin())?;
    let processed_book = pre.run(&ctx, book)?;
    serde_json::to_writer(::std::io::stdout(), &processed_book)?;
    Ok(())
}

struct WrapPresentation;

impl Preprocessor for WrapPresentation {
    fn name(&self) -> &str {
        NAME
    }

    fn run(
            &self,
            _: &PreprocessorContext,
            mut book: Book,
    ) -> Result<Book, Error> {
        debug!("Wrapping presentation only items with a div");
        process_chapters(&mut book.sections)?;
        Ok(book)
    }

    fn supports_renderer(&self, renderer: &str) -> bool {
        match renderer {
            "html" => true,
            _ => false,
        }
    }
}

fn process_chapters<'a, I>(items: I) -> MdResult<()>
where
    I: IntoIterator<Item = &'a mut BookItem> + 'a,
{
    for item in items {
        if let BookItem::Chapter(ref mut ch) = *item {
            debug!("{}: processing chapter '{}'", NAME, ch.name);
            let new_ch = replace(&ch.content, "web-only", "article-content");
            let new_ch = replace(&new_ch, "slides-only", "presentation-only");
            let prefix = format!("<style>{}</style>\n\n", CSS);
            let suffix = format!("\n\n<script>{}</script>", JS);
            ch.content = format!("{}{}{}", prefix, new_ch, suffix);
        }
    }
    Ok(())
}

fn replace(s: &str, name: &str, class: &str) -> String {
    let start_tag = format!("${}$", name);
    let end_tag = format!("${}-end$", name);
    let start_length = start_tag.len();
    let end_length = end_tag.len();
    let starts = s.match_indices(&start_tag);
    let ends = s.match_indices(&end_tag);
    let mut new_ch = String::new();
    let mut last_end = 0;
    for ((start, _), (end, _)) in starts.zip(ends) {
        debug!("start: {}, end: {}", start, end);
        let to_be_replaced = &s[start + start_length..end];
        new_ch += &s[last_end..start];
        new_ch += &format!(r#"<div class="{}">"#, class);
        let p = Parser::new(to_be_replaced);
        push_html(&mut new_ch, p);
        new_ch += "</div>";
        last_end = end + end_length;
    }
    new_ch += &s[last_end..s.len()];
    new_ch
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn basic_test() {
        let md = "
# Header
- list
- of
- items

$web-only$
# web only header
- web
- only
- list
$web-only-end$
$slides-only$
# presenting only header
- presenting
- only
- list
$slides-only-end$
";
        let first_pass = replace(md, "web-only", "article-content");

        assert_eq!(replace(&first_pass, "slides-only", "presentation-only"), r##"
# Header
- list
- of
- items

<div class="article-content">
<h1>web only header</h1>
<ul>
<li>web</li>
<li>only</li>
<li>list</li>
</ul>
</div>
<div class="presentation-only">
<h1>presenting only header</h1>
<ul>
<li>presenting</li>
<li>only</li>
<li>list</li>
</ul>
</div>
"##);
    }

    #[test]
    fn empty_test() {
        let test = r#"# Header
- list
- of
- items
"#;
        assert_eq!(test, replace(test, "web-only", ""));

    }
}
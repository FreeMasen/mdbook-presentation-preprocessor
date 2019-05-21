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
extern crate docopt;
extern crate mdbook;
extern crate serde_json;
#[macro_use]
extern crate serde_derive;
extern crate serde;
#[macro_use]
extern crate log;
extern crate chrono;
extern crate env_logger;

use chrono::Local;
use docopt::Docopt;
use env_logger::Builder;
use log::LevelFilter;
use mdbook::{
    book::{Book, BookItem},
    errors::{Error, Result as MdResult},
    preprocess::{CmdPreprocessor, Preprocessor, PreprocessorContext},
};
use std::env;
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
    init_logging();
    let args: Args = Docopt::new(USAGE)
        .and_then(|a| a.deserialize())
        .unwrap_or_else(|e| e.exit());
    info!("Running presentation preprocessor");
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

    fn run(&self, _ctx: &PreprocessorContext, mut book: Book) -> Result<Book, Error> {
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
            let new_ch = replace(&ch.content, "web-only");
            let new_ch = replace(&new_ch, "slides-only");
            let new_ch = replace_with_parts(
                &new_ch,
                "$notes$",
                "\n<!--notes",
                "$notes-end$",
                "-->",
            );
            let prefix = format!("<style>{}</style>\n\n", CSS);
            let suffix = format!("\n\n<script>{}</script>", JS);
            ch.content = format!("{}{}{}", prefix, new_ch, suffix);
            process_chapters(&mut ch.sub_items)?;
        }
    }
    Ok(())
}

fn replace(s: &str, name: &str) -> String {
    let start_tag = format!("${}$", name);
    let start_comment = format!("\n<!--{}-->\n", name);
    let end_tag = format!("${}-end$", name);
    let end_comment = format!("\n<!--{}-end-->\n", name);
    replace_with_parts(s, &start_tag, &start_comment, &end_tag, &end_comment)
}

fn replace_with_parts(s: &str, pat1: &str, rep1: &str, pat2: &str, rep2: &str) -> String {
    let ret = s.replace(pat1, rep1);
    ret.replace(pat2, rep2)
}

fn init_logging() {
    use std::io::Write;
    let mut builder = Builder::new();

    builder.format(|formatter, record| {
        writeln!(
            formatter,
            "{} [{}] ({}): {}",
            Local::now().format("%Y-%m-%d %H:%M:%S"),
            record.level(),
            record.target(),
            record.args()
        )
    });

    if let Ok(var) = env::var("RUST_LOG") {
        builder.parse(&var);
    } else {
        // if no RUST_LOG provided, default to logging at the Info level
        builder.filter(None, LevelFilter::Info);
        // Filter extraneous html5ever not-implemented messages
        builder.filter(Some("html5ever"), LevelFilter::Error);
    }

    builder.init();
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
        let first_pass = replace(md, "web-only");

        assert_eq!(
            replace(&first_pass, "slides-only"),
            r##"
# Header
- list
- of
- items

<!--web-only-->
# web only header
- web
- only
- list
<!--web-only-end-->
<!--slides-only-->
# presenting only header
- presenting
- only
- list
<!--slides-only-end-->
"##
        );
    }

    #[test]
    fn empty_test() {
        let test = r#"# Header
- list
- of
- items
"#;
        assert_eq!(test, replace(test, "web-only"));
    }

    #[test]
    fn notes_test() {
        let test = r#"$notes$
- notes
- for the presentation
- and stuff
$notes-end$
"#;
        let expectation = r#"
<!--notes
- notes
- for the presentation
- and stuff
-->
"#;
        assert_eq!(expectation, replace_with_parts(test, "$notes$",
                "\n<!--notes",
                "$notes-end$",
                "-->",));
    }
}

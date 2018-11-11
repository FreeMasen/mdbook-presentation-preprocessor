

enum PresentationMode {
    Slides = 0,
    Web = 1,
}

class PresentationModeHider {

    private mode: PresentationMode;
    private queryKey = 'presentation_mode=';

    constructor() {
        this.mode = this.getMode();
        this.setMode();
        this.updatePage();
        if (this.mode === PresentationMode.Slides && (
            location.pathname === ''
            || location.pathname === '/')
            ) {
            let chList = document.querySelector('.sidebar > .chapter') as HTMLUListElement;
            let firstLi = chList.firstChild as HTMLLIElement;
            let firstLink = firstLi.firstChild as HTMLAnchorElement;
            firstLink.click();
        }
        window.addEventListener('popstate', () => {
            this.mode = this.getMode();
            this.setMode();
            this.updatePage();
        });
        window.addEventListener('keyup', ev => {
            if (!ev.altKey) return;
            if (ev.key == 'p' || ev.key == 'P' || ev.code == 'KeyP') {
                this.toggle();
            }
        });
    }
    private getMode(): PresentationMode {
        // if there was no query, we are on the web
        if (location.search == '') {
            return PresentationMode.Web;
        }
        let modeIdx = location.search.indexOf(this.queryKey);
        // if the query doesn't have our key, we are on the web
        if (modeIdx < 0) {
            return PresentationMode.Web;
        }
        let modeValue = location.search.substr(modeIdx + this.queryKey.length, 1);
        try {
            let mode = parseInt(modeValue);
            // if the mode is invalid, fallback to the web
            if (mode > 1) {
                return PresentationMode.Web;
            }
            return mode;
        } catch (e) {
            // if the mode is invalid, fallback to the web
            console.error(e);
            return PresentationMode.Web;
        }
    }

    private setMode() {
        let newUrl = this.updateQuery(location.href);
        history.replaceState({}, '', newUrl);
    }

    private getQuery() {
        return this.queryKey + this.mode;
    }

    private updatePage() {
        let cls =  '.presentation-only';
        let elements = document.querySelectorAll(cls);
        this.updateElements(elements);
        this.updateElements(document.querySelectorAll('.article-content'))
        this.updateLinks();
    }
    
    private updateElements(elements) {
        for (var i = 0; i < elements.length; i++) {
            let el = elements[i];
            let elCls = el.getAttribute('class');
            if (this.mode === PresentationMode.Slides) {
                el.setAttribute('class', this.swapClass('presenting', 'not-presenting', elCls));
            } else {
                el.setAttribute('class', this.swapClass('not-presenting', 'presenting', elCls));
            }
        }
    }

    private swapClass(add: string, remove: string, old: string): string {
        let split = old.split(' ');
        let addIdx = null;
        split = split.filter((c, i) => {
            if (c == add) {
                addIdx = i;
            }
            return c != remove;
        });
        if (addIdx === null) {
            split.push(add)
        }
        return split.join(' ');
    }

    private addClass(add: string, old: string): string {
        let split = old.split(' ');
        if (split.indexOf(add) > -1) {
            return old;
        }
        split.push(add);
        return split.join(' ');
    }
    private removeClass(remove: string, old: string): string {
        let split = old.split(' ');
        let idx = split.indexOf(remove);
        if (idx < 0) {
            return old;
        }
        split.splice(idx, 1);
        return split.join(' ');
    }
    private updateLinks() {
        let links = document.getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
            links[i].href = this.updateQuery(links[i].href)
        }
    }

    private updateQuery(q: string): string {
        let modeIdx = q.indexOf(this.queryKey);
        if (modeIdx > -1) {
            var currentQuery = q.substr(modeIdx, this.queryKey.length + 1);
            return q.replace(currentQuery, this.getQuery());
        } else {
            if (q.indexOf('?') < 0) {
                return q + '?' + this.getQuery();
            }
            return q + '&' + this.getQuery();
        }
    }

    private toggle() {
        switch (this.mode) {
            case PresentationMode.Slides:
                this.mode = PresentationMode.Web;
                break;
            case PresentationMode.Web:
                this.mode = PresentationMode.Slides;
                break;
        }
        this.setMode();
        this.updatePage();
    }
}

let ___presentationModeHider = new PresentationModeHider();
var PresentationMode;
(function (PresentationMode) {
    PresentationMode[PresentationMode["Slides"] = 0] = "Slides";
    PresentationMode[PresentationMode["Web"] = 1] = "Web";
})(PresentationMode || (PresentationMode = {}));
var PresentationModeHider = (function () {
    function PresentationModeHider() {
        var _this = this;
        this.queryKey = 'presentation_mode';
        this.webClass = 'article-content';
        this.preClass = 'presentation-only';
        this.notesClass = 'notes-only';
        this.mode = this.getMode();
        this.setMode();
        this.assignClassesViaComments();
        if (this.mode === PresentationMode.Slides && (location.pathname === ''
            || location.pathname === '/')) {
            var chList = document.querySelector('.sidebar > .chapter');
            var firstLi = chList.firstChild;
            var firstLink = firstLi.firstChild;
            firstLink.click();
        }
        window.addEventListener('keyup', function (ev) {
            if (!ev.altKey)
                return;
            if (ev.key == 'p' || ev.key == 'P' || ev.code == 'KeyP') {
                _this.toggle();
            }
        });
    }
    PresentationModeHider.prototype.assignClassesViaComments = function () {
        var iter = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT, null);
        var node;
        var modeClass = this.mode === PresentationMode.Web ? 'not-presenting' : 'presenting';
        var cls = null;
        while (node = iter.nextNode()) {
            if (node.nodeType === 8) {
                var value = node.nodeValue.trim();
                if (value === "web-only") {
                    cls = this.webClass;
                }
                else if (value === "slides-only") {
                    cls = this.preClass;
                }
                else if (value.startsWith('notes')) {
                    this.processNotes(value);
                }
                else if (value === "web-only-end"
                    || value === "slides-only-end"
                    || value === "notes-end") {
                    cls = null;
                }
            }
            else if (node.nodeType === 1 && cls !== null) {
                node.classList.add(cls, modeClass);
            }
        }
    };
    PresentationModeHider.prototype.getMode = function () {
        var mode = localStorage.getItem(this.queryKey);
        if (mode === null) {
            return PresentationMode.Web;
        }
        try {
            var ret = parseInt(mode);
            if (ret > 1 || ret < 0) {
                console.error('presentation_mode was out of range', ret);
                return PresentationMode.Web;
            }
            return ret;
        }
        catch (e) {
            console.error('presentation_mode present in localStorage but value is not an integer', mode, e);
            return PresentationMode.Web;
        }
    };
    PresentationModeHider.prototype.setMode = function () {
        localStorage.setItem(this.queryKey, this.mode.toString());
    };
    PresentationModeHider.prototype.updatePage = function () {
        this.updateElements(document.querySelectorAll('.presentation-only'));
        this.updateElements(document.querySelectorAll('.article-content'));
    };
    PresentationModeHider.prototype.updateElements = function (elements) {
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (this.mode === PresentationMode.Slides) {
                el.classList.replace('not-presenting', 'presenting');
            }
            else {
                el.classList.replace('presenting', 'not-presenting');
            }
        }
    };
    PresentationModeHider.prototype.toggle = function () {
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
    };
    PresentationModeHider.prototype.processNotes = function (text) {
        var startIdx = text.indexOf('\n');
        console.log("%c" + text.substr(startIdx + 1), 'font-size: 14pt;');
    };
    return PresentationModeHider;
}());
var ___presentationModeHider = new PresentationModeHider();

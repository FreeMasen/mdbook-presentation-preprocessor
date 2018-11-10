var ___presentationModeHider;
window.addEventListener('DOMContentLoaded', function () {
    if (!___presentationModeHider) {
        ___presentationModeHider = new PresentationModeHider();
    }
});
var PresentationMode;
(function (PresentationMode) {
    PresentationMode[PresentationMode["Slides"] = 0] = "Slides";
    PresentationMode[PresentationMode["Web"] = 1] = "Web";
})(PresentationMode || (PresentationMode = {}));
var PresentationModeHider = /** @class */ (function () {
    function PresentationModeHider() {
        var _this = this;
        this.queryKey = 'presentation_mode=';
        this.mode = this.getMode();
        this.setMode();
        this.updatePage();
        if (this.mode === PresentationMode.Slides && (location.pathname === ''
            || location.pathname === '/')) {
            var chList = document.querySelector('.sidebar > .chapter');
            var firstLi = chList.firstChild;
            var firstLink = firstLi.firstChild;
            firstLink.click();
        }
        window.addEventListener('popstate', function () {
            _this.mode = _this.getMode();
            _this.setMode();
            _this.updatePage();
        });
        window.addEventListener('keyup', function (ev) {
            if (!ev.altKey)
                return;
            if (ev.key == 'p' || ev.key == 'P' || ev.code == 'KeyP') {
                _this.toggle();
            }
        });
    }
    PresentationModeHider.prototype.getMode = function () {
        // if there was no query, we are on the web
        if (location.search == '') {
            return PresentationMode.Web;
        }
        var modeIdx = location.search.indexOf(this.queryKey);
        // if the query doesn't have our key, we are on the web
        if (modeIdx < 0) {
            return PresentationMode.Web;
        }
        var modeValue = location.search.substr(modeIdx + this.queryKey.length, 1);
        try {
            var mode = parseInt(modeValue);
            // if the mode is invalid, fallback to the web
            if (mode > 1) {
                return PresentationMode.Web;
            }
            return mode;
        }
        catch (e) {
            // if the mode is invalid, fallback to the web
            console.error(e);
            return PresentationMode.Web;
        }
    };
    PresentationModeHider.prototype.setMode = function () {
        var newUrl = this.updateQuery(location.href);
        history.replaceState({}, '', newUrl);
    };
    PresentationModeHider.prototype.getQuery = function () {
        return this.queryKey + this.mode;
    };
    PresentationModeHider.prototype.updatePage = function () {
        var cls = '.presentation-only';
        var elements = document.querySelectorAll(cls);
        this.updateElements(elements);
        this.updateElements(document.querySelectorAll('.article-content'));
        this.updateLinks();
    };
    PresentationModeHider.prototype.updateElements = function (elements) {
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var elCls = el.getAttribute('class');
            if (this.mode === PresentationMode.Slides) {
                el.setAttribute('class', this.swapClass('presenting', 'not-presenting', elCls));
            }
            else {
                el.setAttribute('class', this.swapClass('not-presenting', 'presenting', elCls));
            }
        }
    };
    PresentationModeHider.prototype.swapClass = function (add, remove, old) {
        var split = old.split(' ');
        var addIdx = null;
        split = split.filter(function (c, i) {
            if (c == add) {
                addIdx = i;
            }
            return c != remove;
        });
        if (addIdx === null) {
            split.push(add);
        }
        return split.join(' ');
    };
    PresentationModeHider.prototype.addClass = function (add, old) {
        var split = old.split(' ');
        if (split.indexOf(add) > -1) {
            return old;
        }
        split.push(add);
        return split.join(' ');
    };
    PresentationModeHider.prototype.removeClass = function (remove, old) {
        var split = old.split(' ');
        var idx = split.indexOf(remove);
        if (idx < 0) {
            return old;
        }
        split.splice(idx, 1);
        return split.join(' ');
    };
    PresentationModeHider.prototype.updateLinks = function () {
        var links = document.getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
            links[i].href = this.updateQuery(links[i].href);
        }
    };
    PresentationModeHider.prototype.updateQuery = function (q) {
        var modeIdx = q.indexOf(this.queryKey);
        if (modeIdx > -1) {
            var currentQuery = q.substr(modeIdx, this.queryKey.length + 1);
            return q.replace(currentQuery, this.getQuery());
        }
        else {
            if (q.indexOf('?') < 0) {
                return q + '?' + this.getQuery();
            }
            return q + '&' + this.getQuery();
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
    return PresentationModeHider;
}());

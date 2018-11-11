
/**
 * The presentation mode enum
 */
enum PresentationMode {
    /**
     * Presenting
     */
    Slides = 0,
    /**
     * Not presenting
     */
    Web = 1,
}
/**
 * The object that will handle all of the
 * presentation mode activities
 */
class PresentationModeHider {
    /**
     * The current mode
     */
    private mode: PresentationMode;
    /**
     * A constant value for the localStorage
     * Key
     */
    private queryKey = 'presentation_mode=';

    constructor() {
        this.mode = this.getMode();
        this.setMode();
        this.updatePage();
        if (this.mode === PresentationMode.Slides && (
            location.pathname === ''
            || location.pathname === '/')) {
            let chList = document.querySelector('.sidebar > .chapter') as HTMLUListElement;
            let firstLi = chList.firstChild as HTMLLIElement;
            let firstLink = firstLi.firstChild as HTMLAnchorElement;
            firstLink.click();
        }
        window.addEventListener('keyup', ev => {
            if (!ev.altKey) return;
            if (ev.key == 'p' || ev.key == 'P' || ev.code == 'KeyP') {
                this.toggle();
            }
        });
    }
    /**
     * Get the current presentation mode from storage
     * @returns The last known presentation mode or the default (Web)
     */
    private getMode(): PresentationMode {
        let mode = localStorage.getItem(this.queryKey);
        if (mode === null) {
            return PresentationMode.Web
        }
        try {
            let ret = parseInt(mode);
            if (ret > 1 || ret < 0) {
                console.error('presentation_mode was out of range', ret);
                return PresentationMode.Web;
            }
            return ret;
        } catch (e) {
            console.error('presentation_mode present in localStorage but value is not an integer', mode, e);
            return PresentationMode.Web;
        }
    }
    /**
     * Update the storage to have the same value as `this.mode`
     */
    private setMode() {
        localStorage.setItem(this.queryKey, this.mode.toString());
    }
    /**
     * Find all of the `.presentation-only` and `.article-content` items
     * and update them to have either a `presenting` or `not-presenting` class
     */
    private updatePage() {
        this.updateElements(document.querySelectorAll('.presentation-only'));
        this.updateElements(document.querySelectorAll('.article-content'))
    }
    /**
     * Update a list of `HTMLDivElement`s to have either the `presenting`
     * or `not-presenting` class
     * @param elements A list of `HTMLDivElement`s to be updated
     */
    private updateElements(elements: NodeListOf<HTMLDivElement>) {
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
    /**
     * Add one class and remove another to a class list
     * @param add The new class to add
     * @param remove The old class to remove
     * @param old The current class list
     */
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
    /**
     * Toggle betwen`Web` and `Slides` presentation mode
     * @remarks
     * This will update localStorage and the view
     */
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

const ___presentationModeHider = new PresentationModeHider();
const END_KEY: string = 'end-date';
const MIN_KEY: string = 'total-minutes';
class PresentationTimer {
    timeout: number;
    /**
     * @type Date
     * The end of our presentation
     */
    end: Date;
    /**
     * @type number
     * The length of our presentation
     */
    minutes: number;

    constructor() {
        window.addEventListener('keyup', ev => {
            if (!ev.altKey) {
                return;
            }
            switch (ev.key) {
                case 'g': // Go!
                    return this.start();
                case 'ArrowUp': // Increase Timer by 1 minute
                    return this.updateEnd(+1);
                case 'ArrowDown': // Decrease Timer by 1 minute
                    return this.updateEnd(-1);
                case 'm': // Prompt to manually enter minutes
                    return this.promptForMinutes();
                case '.': // Full Stop!
                    return this.stop();
            }
        });
        let maybeSaved = this.getEnd();
        if (maybeSaved) {
            this.end = new Date(maybeSaved);
            this.tick();
        }
    }

    /**
     * Run the async loop. Update the time, check for
     * complete and update the dom
     */
    tick() {
        this.timeout = null;
        let now = new Date();
        if (now >= this.end) {
            return this.update(0,0);
        }
        let diff = +this.end - +now;
        let secs = Math.floor(diff / 1000);
        let mins = Math.floor(secs / 60);
        this.update(mins, secs - (mins * 60))
        this.timeout = window.setTimeout(this.tick.bind(this), 1000);
    }

    /**
     * Maybe get the end date if saved in local storage
     * Provides a 1 hour buffer for after a presentation is over
     * @returns Date
     */
    getEnd() {
        let maybeSaved = localStorage.getItem(END_KEY);
        this.minutes = +localStorage.getItem(MIN_KEY) || 45;
        let target = new Date();
        target.setHours(target.getHours() + 1);
        if (!maybeSaved || +maybeSaved < +target) {
            localStorage.removeItem(END_KEY);
            return;
        }
        return maybeSaved;
    }
    /**
     * Start the counter
     */
    start() {
        let now = new Date();
        let mins = now.getMinutes();
        now.setMinutes(mins + this.minutes);
        this.end = now;
        this.saveGlobals();
        this.tick();
    }
    /**
     * Full stop, clearing the end date from local storage
     * and removing the counter from the dom
     */
    stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        localStorage.removeItem(END_KEY);
        let counter = document.getElementById('counter');
        if (!counter) {
            return;
        }
        counter.parentElement.removeChild(counter);
    }
    
    /**
     * 
     * @param {number} mins Whole minutes Remaining
     * @param {number} secs Sub-minute seconds remaining
     */
    update(mins: number, secs: number) {
        let counter = this.getCounterEl();
        counter.innerHTML = this.formatTime(mins, secs);
        counter.style.borderColor = this.getColor(mins * 60 + secs);
    }
    /**
     * Format the time for inserting into the dom
     * @param {number} mins Whole minutes Remaining
     * @param {number} secs Sub-minute seconds
     */
    formatTime(mins: number, secs: number): string {
        if (mins >= 60) {
            let hrs = Math.floor(mins / 60);
            mins = mins - (hrs  * 60);
            return `${hrs}:${this.twoDigits(mins)}:${this.twoDigits(secs)}`;
        }
        return `${this.twoDigits(mins)}:${this.twoDigits(secs)}`;
    }
    /**
     * add leading zero to number < 10
     * @param {number} n Number to format
     */
    twoDigits(n: number): string {
        return `0${n}`.substr(-2);
    }
    /**
     * Get the counter element or create one if it doesn't
     * already exist
     */
    getCounterEl() {
        let counter = document.getElementById('counter');
        if (counter) {
            return counter;
        }
        counter = document.createElement('div');
        counter.style.position = 'fixed';
        counter.style.left = 'calc(100% - 10px)';
        counter.style.top = '55px';
        counter.style.width = '70px';
        counter.style.textAlign = 'right';
        counter.style.border = '2px solid var(--quote-border)';
        counter.style.color = 'var(--fg)';
        counter.style.borderRadius = '5px';
        counter.style.paddingLeft = '5px';
        counter.style.backgroundColor = 'var(--bg)';
        counter.setAttribute('id', 'counter');
        counter.addEventListener('mouseenter', ev => {
            (ev.currentTarget as HTMLDivElement).style.left = 'calc(100% - 70px)';
            (ev.currentTarget as HTMLDivElement).style.textAlign = 'left';
        });
        counter.addEventListener('mouseleave', ev => {
            (ev.currentTarget as HTMLDivElement).style.left = 'calc(100% - 10px)';
            (ev.currentTarget as HTMLDivElement).style.textAlign = 'right';
        });
        document.body.appendChild(counter);
        return counter;
    }
    /**
     * Increments the r and g values of an RGB color for the first 50%
     * of a talk, at 50% both reach 255, after 50% it slowly brings
     * the G value to 0
     * 
     * This creates a black to yellow to orange to red effect
     * @param {number} seconds The remaining number of seconds in the presentation
     */
    getColor(seconds: number) {
        const total = this.minutes * 60;
        const percent = seconds / total;
        const inverse = 1 - percent;
        let red = 0;
        let green = 0;
        if (inverse < 0.5) {
            red = green = (inverse * 255) * 2;
        } else {
            red = 255;
            green = 255 * (percent * 2);
        }
        let ret = `rgb(${red.toFixed(2)}, ${green.toFixed(2)}, 0)`;
        return ret;
    }
    /**
     * Update the end time and # of minutes for this presentation
     * @param {number} by value to be added to minutes (negative values to decrease)
     */
    updateEnd(by: number) {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        let current = this.end.getMinutes();
        current += by;
        this.minutes += by;
        this.end.setMinutes(current);
        this.saveGlobals();
        this.tick();
    }
    
    /**
     * Save both end time and minutes to local storage
     */
    saveGlobals() {
        localStorage.setItem(END_KEY, this.end.toString());
        this.saveMinutes();
    }

    /**
     * Save just the minutes global value to local storage
     */
    saveMinutes() {
        localStorage.setItem(MIN_KEY, this.minutes.toString());
    }
    /**
     * Open modal for entering minutes
     */
    promptForMinutes() {
        if (document.getElementById('minutes-prompt')) {
            return;
        }
        const div = document.createElement('div');
        div.setAttribute('id', 'minutes-prompt');
        div.style.position = 'absolute';
        div.style.left = 'calc(50% - 50px)';
        div.style.top = 'calc(50% - 25px)';
        div.style.display = 'flex';
        div.style.flexFlow = 'column';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.boxShadow = '1px 1px 1px 1px var(--quote-border)';
        div.style.backgroundColor = 'var(--bg)';
        div.style.padding = '5px';
        let label = document.createElement('label');
        label.setAttribute('for', 'minutes-inputs');
        label.appendChild(
            document.createTextNode('Presentation Length')
        );
        let input = document.createElement('input');
        input.setAttribute('type', 'number');
        input.setAttribute('min', '1');
        input.setAttribute('name', 'minutes-input');
        input.setAttribute('id', 'minutes-input');
        input.value = (this.minutes || 0).toString();
        let button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.addEventListener('click', this.promptOk.bind(this));
        button.appendChild(
            document.createTextNode('OK')
        );
        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(button);
        document.body.appendChild(div);
        input.focus();
    }
    /**
     * Result handler for clicking OK in the modal
     */
    promptOk() {
        let input = document.getElementById('minutes-input') as HTMLInputElement;
        if (input) {
            let newMinutes = +input.value;
            if (this.end) {
                this.updateEnd(newMinutes - this.minutes);
            } else {
                this.minutes = newMinutes;
                this.saveMinutes();
            }
        }
        input.parentElement.parentElement.removeChild(input.parentElement);
    }
}

const ___presentationTimer = new PresentationTimer();
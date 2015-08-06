"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
define(["require", "exports", './utils'], function (require, exports, utils) {
    var Signal = phosphor.core.Signal;
    var emit = phosphor.core.emit;
    /**
     * Setup global keycodes and inverse keycodes.
     *
     * See http://unixpapa.com/js/key.html for a complete description. The short of
     * it is that there are different keycode sets. Firefox uses the "Mozilla keycodes"
     * and Webkit/IE use the "IE keycodes". These keycode sets are mostly the same
     * but have minor differences.
     **/
    // These apply to Firefox, (Webkit and IE)
    // This does work **only** on US keyboard.
    var _keycodes = {
        'a': 65,
        'b': 66,
        'c': 67,
        'd': 68,
        'e': 69,
        'f': 70,
        'g': 71,
        'h': 72,
        'i': 73,
        'j': 74,
        'k': 75,
        'l': 76,
        'm': 77,
        'n': 78,
        'o': 79,
        'p': 80,
        'q': 81,
        'r': 82,
        's': 83,
        't': 84,
        'u': 85,
        'v': 86,
        'w': 87,
        'x': 88,
        'y': 89,
        'z': 90,
        '1 !': 49,
        '2 @': 50,
        '3 #': 51,
        '4 $': 52,
        '5 %': 53,
        '6 ^': 54,
        '7 &': 55,
        '8 *': 56,
        '9 (': 57,
        '0 )': 48,
        '[ {': 219,
        '] }': 221,
        '` ~': 192,
        ', <': 188,
        '. >': 190,
        '/ ?': 191,
        '\\ |': 220,
        '\' "': 222,
        'numpad0': 96,
        'numpad1': 97,
        'numpad2': 98,
        'numpad3': 99,
        'numpad4': 100,
        'numpad5': 101,
        'numpad6': 102,
        'numpad7': 103,
        'numpad8': 104,
        'numpad9': 105,
        'multiply': 106,
        'add': 107,
        'subtract': 109,
        'decimal': 110,
        'divide': 111,
        'f1': 112,
        'f2': 113,
        'f3': 114,
        'f4': 115,
        'f5': 116,
        'f6': 117,
        'f7': 118,
        'f8': 119,
        'f9': 120,
        'f11': 122,
        'f12': 123,
        'f13': 124,
        'f14': 125,
        'f15': 126,
        'backspace': 8,
        'tab': 9,
        'enter': 13,
        'shift': 16,
        'ctrl': 17,
        'alt': 18,
        'meta': 91,
        'capslock': 20,
        'esc': 27,
        'space': 32,
        'pageup': 33,
        'pagedown': 34,
        'end': 35,
        'home': 36,
        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40,
        'insert': 45,
        'delete': 46,
        'numlock': 144,
    };
    // These apply to Firefox and Opera
    var _mozilla_keycodes = {
        '; :': 59,
        '= +': 61,
        '- _': 173,
        'meta': 224
    };
    // This apply to Webkit and IE
    var _ie_keycodes = {
        '; :': 186,
        '= +': 187,
        '- _': 189
    };
    var browser = utils.browser[0];
    var platform = utils.platform;
    if (browser === 'Firefox' || browser === 'Opera' || browser === 'Netscape') {
        utils.extend(_keycodes, _mozilla_keycodes);
    }
    else if (browser === 'Safari' || browser === 'Chrome' || browser === 'MSIE') {
        utils.extend(_keycodes, _ie_keycodes);
    }
    var keycodes = {};
    var invKeycodes = {};
    for (var name in _keycodes) {
        var names = name.split(' ');
        if (names.length === 1) {
            var n = names[0];
            keycodes[n] = _keycodes[n];
            invKeycodes[_keycodes[n]] = n;
        }
        else {
            var primary = names[0];
            var secondary = names[1];
            keycodes[primary] = _keycodes[name];
            keycodes[secondary] = _keycodes[name];
            invKeycodes[_keycodes[name]] = primary;
        }
    }
    function normalizeKey(key) {
        return invKeycodes[keycodes[key]];
    }
    ;
    /**
     * Return a dict containing the normalized shortcut and the number of time
     * it should be pressed:
     *
     * Put a shortcut into normalized form:
     * 1. Make lowercase
     * 2. Replace cmd by meta
     * 3. Sort '-' separated modifiers into the order alt-ctrl-meta-shift
     * 4. Normalize keys
     **/
    function normalizeShortcut(shortcut) {
        if (platform === 'MacOS') {
            shortcut = shortcut.toLowerCase().replace('cmdtrl-', 'cmd-');
        }
        else {
            shortcut = shortcut.toLowerCase().replace('cmdtrl-', 'ctrl-');
        }
        shortcut = shortcut.toLowerCase().replace('cmd', 'meta');
        shortcut = shortcut.replace(/-$/, '_'); // catch shortcuts using '-' key
        shortcut = shortcut.replace(/,$/, 'comma'); // catch shortcuts using '-' key
        if (shortcut.indexOf(',') !== -1) {
            var sht = shortcut.split(',');
            sht = sht.map(normalizeShortcut);
            return shortcut;
        }
        shortcut = shortcut.replace(/comma/g, ','); // catch shortcuts using '-' key
        var values = shortcut.split("-");
        if (values.length === 1) {
            return normalizeKey(values[0]);
        }
        else {
            var modifiers = values.slice(0, -1);
            var key = normalizeKey(values[values.length - 1]);
            modifiers.sort();
            return modifiers.join('-') + '-' + key;
        }
    }
    ;
    /**
     * Convert a shortcut (shift-r) to a KeyboardEvent object
     **/
    function shortcutToEvent(shortcut, type) {
        type = type || 'keydown';
        shortcut = normalizeShortcut(shortcut);
        shortcut = shortcut.replace(/-$/, '_'); // catch shortcuts using '-' key
        var values = shortcut.split("-");
        var modifiers = values.slice(0, -1);
        var key = values[values.length - 1];
        var opts = { which: keycodes[key] };
        if (modifiers.indexOf('alt') !== -1) {
            opts.altKey = true;
        }
        if (modifiers.indexOf('ctrl') !== -1) {
            opts.ctrlKey = true;
        }
        if (modifiers.indexOf('meta') !== -1) {
            opts.metaKey = true;
        }
        if (modifiers.indexOf('shift') !== -1) {
            opts.shiftKey = true;
        }
        var evt = new KeyboardEvent();
        evt.key = key;
        utils.extend(evt, opts);
        return evt;
    }
    ;
    /**
     * Return `true` if the event only contains modifiers keys and
     * false otherwise.
     **/
    function onlyModifierEvent(event) {
        var key = invKeycodes[event.which];
        return ((event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) && (key === 'alt' || key === 'ctrl' || key === 'meta' || key === 'shift'));
    }
    ;
    /**
     * Convert an Event object to a normalized shortcut string (shift-r).
     **/
    function eventToShortcut(event) {
        var shortcut = '';
        var key = invKeycodes[event.which];
        if (event.altKey && key !== 'alt') {
            shortcut += 'alt-';
        }
        if (event.ctrlKey && key !== 'ctrl') {
            shortcut += 'ctrl-';
        }
        if (event.metaKey && key !== 'meta') {
            shortcut += 'meta-';
        }
        if (event.shiftKey && key !== 'shift') {
            shortcut += 'shift-';
        }
        shortcut += key;
        return shortcut;
    }
    ;
    /**
     * Flatten a tree of shortcut sequences.
     * Iterate over all the key/values of available shortcuts.
     **/
    function flattenShortTree(tree) {
        var dct = {};
        for (var key in tree) {
            var value = tree[key];
            if (typeof (value) === 'string') {
                dct[key] = value;
            }
            else {
                var ftree = flattenShortTree(value);
                for (var subkey in ftree) {
                    dct[key + ',' + subkey] = ftree[subkey];
                }
            }
        }
        return dct;
    }
    /**
     * A class to deal with keyboard events and shortcuts.
     */
    var ShortcutManager = (function () {
        /**
         * Construct a ShortcutManager.
         */
        function ShortcutManager(delay, actions) {
            this._shortcuts = null;
            this._delay = 800;
            this._actions = null;
            this._queue = null;
            this._clearTimeout = -1;
            this._delay = delay; // delay in milliseconds
            this._actions = actions;
            Object.seal(this);
        }
        /**
         * Clear the pending shortcut soon, and cancel previous clearing
         * that might be registered.
         **/
        ShortcutManager.prototype.clearSoon = function () {
            var _this = this;
            clearTimeout(this._clearTimeout);
            this._clearTimeout = setTimeout(function () {
                _this.clearQueue();
            }, this._delay);
        };
        /**
         * Clear the pending shortcut sequence now.
         **/
        ShortcutManager.prototype.clearQueue = function () {
            this._queue = [];
            clearTimeout(this._clearTimeout);
        };
        ShortcutManager.prototype.help = function () {
            var help = [];
            var ftree = flattenShortTree(this._shortcuts);
            for (var shortcut in ftree) {
                var action = this._actions.get(shortcut);
                var helpString = action.help || '== no help ==';
                var helpIndex = action.help_index;
                if (helpString) {
                    var shortstring = (action.shortstring || shortcut);
                    help.push({
                        shortcut: shortstring,
                        help: helpString,
                        help_index: helpIndex
                    });
                }
            }
            help.sort(function (a, b) {
                if (a.help_index === b.help_index) {
                    return 0;
                }
                if (a.help_index === undefined || a.help_index > b.help_index) {
                    return 1;
                }
                return -1;
            });
            return help;
        };
        ShortcutManager.prototype.clearShortcuts = function () {
            this._shortcuts = null;
        };
        /**
         * Return a node of the shortcut tree which an action name (string) if leaf,
         * and an object with `object.subtree===true`
         **/
        ShortcutManager.prototype.getShortcut = function (shortcut) {
            var shortcuts;
            if (typeof (shortcut) === 'string') {
                shortcuts = shortcut.split(',');
            }
            else {
                shortcuts = shortcut;
            }
            return this._getLeaf(shortcuts, this._shortcuts);
        };
        ShortcutManager.prototype.setShortcut = function (shortcut, actionName) {
            var shortcuts;
            if (typeof (shortcut) === 'string') {
                shortcuts = shortcut.split(',');
            }
            else {
                shortcuts = shortcut;
            }
            return this._setLeaf(shortcuts, actionName, this._shortcuts);
        };
        /**
         * Add a action to be handled by shortcut manager.
         *
         * - `shortcut` should be a `Shortcut Sequence` of the for `Ctrl-Alt-C,Meta-X`...
         * - `data` could be an `action name`, an `action` or a `function`.
         *   if a `function` is passed it will be converted to an anonymous `action`.
         *
         **/
        ShortcutManager.prototype.addShortcut = function (shortcut, data, suppressHelpUpdate) {
            var action_name = this._actions.get_name(data);
            if (!action_name) {
                throw ('does not know how to deal with ', data);
            }
            shortcut = normalizeShortcut(shortcut);
            this.setShortcut(shortcut, action_name);
            if (!suppressHelpUpdate) {
                // update the keyboard shortcuts notebook help
                emit(this, ShortcutManager.shortcutsChanged, void 0);
            }
        };
        /**
         * Convenience method to call `add_shortcut(key, value)` on several items
         *
         *  data : Dict of the form {key:value, ...}
         **/
        ShortcutManager.prototype.addShortcuts = function (shortcuts) {
            for (var shortcut in shortcuts) {
                this.addShortcut(shortcut, shortcuts.get(shortcut), true);
            }
            // update the keyboard shortcuts notebook help
            emit(this, ShortcutManager.shortcutsChanged, void 0);
        };
        /**
         * Remove the binding of shortcut `sortcut` with its action.
         * throw an error if trying to remove a non-exiting shortcut
         **/
        ShortcutManager.prototype.removeShortcut = function (shortcut, suppressHelpUpdate) {
            shortcut = normalizeShortcut(shortcut);
            var shortcuts = this._getShortcutList(shortcut);
            try {
                this._removeLeaf(shortcuts, this._shortcuts);
                if (!suppressHelpUpdate) {
                    // update the keyboard shortcuts notebook help
                    emit(this, ShortcutManager.shortcutsChanged, void 0);
                }
            }
            catch (ex) {
                throw ('try to remove non-existing shortcut');
            }
        };
        /**
         * Call the corresponding shortcut handler for a keyboard event
         * @method call_handler
         * @return {Boolean} `true|false`, `false` if no handler was found, otherwise the  value return by the handler.
         * @param event {event}
         *
         * given an event, call the corresponding shortcut.
         * return false is event wan handled, true otherwise
         * in any case returning false stop event propagation
         **/
        ShortcutManager.prototype.callHandler = function (event) {
            this.clearSoon();
            if (onlyModifierEvent(event)) {
                return true;
            }
            var shortcut = eventToShortcut(event);
            this._queue.push(shortcut);
            var actionName = this.getShortcut(this._queue);
            if (typeof (actionName) === 'undefined' || actionName === null) {
                this.clearQueue();
                return true;
            }
            if (this._actions.exists(actionName)) {
                event.preventDefault();
                this.clearQueue();
                this._actions.call(actionName, event);
                return true;
            }
            return false;
        };
        ShortcutManager.prototype.handles = function (event) {
            var shortcut = eventToShortcut(event);
            var actionName = this.getShortcut(this._queue.concat(shortcut));
            return (typeof (actionName) !== 'undefined');
        };
        ShortcutManager.prototype._isLeaf = function (shortcutArray, tree) {
            if (shortcutArray.length === 1) {
                return (typeof (tree[shortcutArray[0]]) === 'string');
            }
            else {
                var subtree = tree[shortcutArray[0]];
                return this._isLeaf(shortcutArray.slice(1), subtree);
            }
        };
        ShortcutManager.prototype._removeLeaf = function (shortcutArray, tree) {
            if (shortcutArray.length === 1) {
                var currentNode = tree[shortcutArray[0]];
                if (typeof (currentNode) === 'string') {
                    delete tree[shortcutArray[0]];
                }
                else {
                    throw ('try to delete non-leaf');
                }
            }
            else {
                this._removeLeaf(shortcutArray.slice(1), tree[shortcutArray[0]]);
                if (Object.keys(tree[shortcutArray[0]]).length === 0) {
                    delete tree[shortcutArray[0]];
                }
            }
        };
        ShortcutManager.prototype._setLeaf = function (shortcutArray, actionName, tree) {
            var currentNode = tree[shortcutArray[0]];
            if (shortcutArray.length === 1) {
                if (currentNode !== undefined && typeof (currentNode) !== 'string') {
                    console.warn('[warning], you are overriting a long shortcut with a shorter one');
                }
                tree[shortcutArray[0]] = actionName;
                return true;
            }
            else {
                if (typeof (currentNode) === 'string') {
                    console.warn('you are trying to set a shortcut that will be shadowed' + 'by a more specific one. Aborting for :', actionName, 'the follwing  ' + 'will take precedence', currentNode);
                    return false;
                }
                else {
                    tree[shortcutArray[0]] = tree[shortcutArray[0]] || {};
                }
                this._setLeaf(shortcutArray.slice(1), actionName, tree[shortcutArray[0]]);
                return true;
            }
        };
        /**
         * Get a list of shortcuts from a comma separate shortcut name or list.
         */
        ShortcutManager.prototype._getShortcutList = function (shortcut) {
            var shortcuts;
            if (typeof (shortcut) === 'string') {
                shortcuts = shortcut.split(',');
            }
            else {
                shortcuts = shortcut;
            }
            return shortcuts;
        };
        /**
         * Find a leaf/node in a subtree of the keyboard shortcut.
         *
         **/
        ShortcutManager.prototype._getLeaf = function (shortcutArray, tree) {
            if (shortcutArray.length === 1) {
                return tree[shortcutArray[0]];
            }
            else if (typeof (tree[shortcutArray[0]]) !== 'string') {
                return this._getLeaf(shortcutArray.slice(1), tree[shortcutArray[0]]);
            }
            return null;
        };
        ShortcutManager.shortcutsChanged = new Signal();
        return ShortcutManager;
    })();
    exports.ShortcutManager = ShortcutManager;
});
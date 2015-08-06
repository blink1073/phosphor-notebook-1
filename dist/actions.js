"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
define(["require", "exports"], function (require, exports) {
    var _actions = {
        'run-select-next': {
            icon: 'fa-play',
            help: 'run cell, select below',
            help_index: 'ba',
            handler: function (env) {
                env.notebook.execute_cell_and_select_below();
            }
        },
        'execute-in-place': {
            help: 'run cell',
            help_index: 'bb',
            handler: function (env) {
                env.notebook.execute_cell();
            }
        },
        'execute-and-insert-after': {
            help: 'run cell, insert below',
            help_index: 'bc',
            handler: function (env) {
                env.notebook.execute_cell_and_insert_below();
            }
        },
        'go-to-command-mode': {
            help: 'command mode',
            help_index: 'aa',
            handler: function (env) {
                env.notebook.command_mode();
            }
        },
        'split-cell-at-cursor': {
            help: 'split cell',
            help_index: 'ea',
            handler: function (env) {
                env.notebook.split_cell();
            }
        },
        'enter-edit-mode': {
            help_index: 'aa',
            handler: function (env) {
                env.notebook.edit_mode();
            }
        },
        'select-previous-cell': {
            help: 'select cell above',
            help_index: 'da',
            handler: function (env) {
                var index = env.notebook.get_selected_index();
                if (index !== 0 && index !== null) {
                    env.notebook.select_prev();
                    env.notebook.focus_cell();
                }
            }
        },
        'select-next-cell': {
            help: 'select cell below',
            help_index: 'db',
            handler: function (env) {
                var index = env.notebook.get_selected_index();
                if (index !== (env.notebook.ncells() - 1) && index !== null) {
                    env.notebook.select_next();
                    env.notebook.focus_cell();
                }
            }
        },
        'cut-selected-cell': {
            icon: 'fa-cut',
            help_index: 'ee',
            handler: function (env) {
                var index = env.notebook.get_selected_index();
                env.notebook.cut_cell();
                env.notebook.select(index);
            }
        },
        'copy-selected-cell': {
            icon: 'fa-copy',
            help_index: 'ef',
            handler: function (env) {
                env.notebook.copy_cell();
            }
        },
        'paste-cell-before': {
            help: 'paste cell above',
            help_index: 'eg',
            handler: function (env) {
                env.notebook.paste_cell_above();
            }
        },
        'paste-cell-after': {
            help: 'paste cell below',
            icon: 'fa-paste',
            help_index: 'eh',
            handler: function (env) {
                env.notebook.paste_cell_below();
            }
        },
        'insert-cell-before': {
            help: 'insert cell above',
            help_index: 'ec',
            handler: function (env) {
                env.notebook.insert_cell_above();
                env.notebook.select_prev();
                env.notebook.focus_cell();
            }
        },
        'insert-cell-after': {
            help: 'insert cell below',
            icon: 'fa-plus',
            help_index: 'ed',
            handler: function (env) {
                env.notebook.insert_cell_below();
                env.notebook.select_next();
                env.notebook.focus_cell();
            }
        },
        'change-selected-cell-to-code-cell': {
            help: 'to code',
            help_index: 'ca',
            handler: function (env) {
                env.notebook.to_code();
            }
        },
        'change-selected-cell-to-markdown-cell': {
            help: 'to markdown',
            help_index: 'cb',
            handler: function (env) {
                env.notebook.to_markdown();
            }
        },
        'change-selected-cell-to-raw-cell': {
            help: 'to raw',
            help_index: 'cc',
            handler: function (env) {
                env.notebook.to_raw();
            }
        },
        'change-selected-cell-to-heading-1': {
            help: 'to heading 1',
            help_index: 'cd',
            handler: function (env) {
                env.notebook.to_heading(undefined, 1);
            }
        },
        'change-selected-cell-to-heading-2': {
            help: 'to heading 2',
            help_index: 'ce',
            handler: function (env) {
                env.notebook.to_heading(undefined, 2);
            }
        },
        'change-selected-cell-to-heading-3': {
            help: 'to heading 3',
            help_index: 'cf',
            handler: function (env) {
                env.notebook.to_heading(undefined, 3);
            }
        },
        'change-selected-cell-to-heading-4': {
            help: 'to heading 4',
            help_index: 'cg',
            handler: function (env) {
                env.notebook.to_heading(undefined, 4);
            }
        },
        'change-selected-cell-to-heading-5': {
            help: 'to heading 5',
            help_index: 'ch',
            handler: function (env) {
                env.notebook.to_heading(undefined, 5);
            }
        },
        'change-selected-cell-to-heading-6': {
            help: 'to heading 6',
            help_index: 'ci',
            handler: function (env) {
                env.notebook.to_heading(undefined, 6);
            }
        },
        'toggle-output-visibility-selected-cell': {
            help: 'toggle output',
            help_index: 'gb',
            handler: function (env) {
                env.notebook.toggle_output();
            }
        },
        'toggle-output-scrolling-selected-cell': {
            help: 'toggle output scrolling',
            help_index: 'gc',
            handler: function (env) {
                env.notebook.toggle_output_scroll();
            }
        },
        'move-selected-cell-down': {
            icon: 'fa-arrow-down',
            help_index: 'eb',
            handler: function (env) {
                env.notebook.move_cell_down();
            }
        },
        'move-selected-cell-up': {
            icon: 'fa-arrow-up',
            help_index: 'ea',
            handler: function (env) {
                env.notebook.move_cell_up();
            }
        },
        'toggle-line-number-selected-cell': {
            help: 'toggle line numbers',
            help_index: 'ga',
            handler: function (env) {
                env.notebook.cell_toggle_line_numbers();
            }
        },
        'show-keyboard-shortcut-help-dialog': {
            help_index: 'ge',
            handler: function (env) {
                env.quick_help.show_keyboard_shortcuts();
            }
        },
        'delete-cell': {
            help: 'delete selected cell',
            help_index: 'ej',
            handler: function (env) {
                env.notebook.delete_cell();
            }
        },
        'interrupt-kernel': {
            icon: 'fa-stop',
            help_index: 'ha',
            handler: function (env) {
                env.notebook.kernel.interrupt();
            }
        },
        'restart-kernel': {
            icon: 'fa-repeat',
            help_index: 'hb',
            handler: function (env) {
                env.notebook.restart_kernel();
            }
        },
        'undo-last-cell-deletion': {
            help_index: 'ei',
            handler: function (env) {
                env.notebook.undelete_cell();
            }
        },
        'merge-selected-cell-with-cell-after': {
            help: 'merge cell below',
            help_index: 'ek',
            handler: function (env) {
                env.notebook.merge_cell_below();
            }
        },
        'close-pager': {
            help_index: 'gd',
            handler: function (env) {
                env.pager.collapse();
            }
        }
    };
    /**
    * A bunch of `Advance actions` for Jupyter.
    * Cf `Simple Action` plus the following properties.
    *
    * handler: first argument of the handler is the event that triggerd the action
    *  (typically keypress). The handler is responsible for any modification of the
    *  event and event propagation.
    *  Is also responsible for returning false if the event have to be further ignored,
    *  true, to tell keyboard manager that it ignored the event.
    *
    *  the second parameter of the handler is the environemnt passed to Simple Actions
    *
    **/
    var custom_ignore = {
        'ignore': {
            handler: function () {
                return true;
            }
        },
        'move-cursor-up-or-previous-cell': {
            handler: function (env, event) {
                var index = env.notebook.get_selected_index();
                var cell = env.notebook.get_cell(index);
                var cm = env.notebook.get_selected_cell().code_mirror;
                var cur = cm.getCursor();
                if (cell && cell.at_top() && index !== 0 && cur.ch === 0) {
                    if (event) {
                        event.preventDefault();
                    }
                    env.notebook.command_mode();
                    env.notebook.select_prev();
                    env.notebook.edit_mode();
                    cm = env.notebook.get_selected_cell().code_mirror;
                    cm.setCursor(cm.lastLine(), 0);
                }
                return false;
            }
        },
        'move-cursor-down-or-next-cell': {
            handler: function (env, event) {
                var index = env.notebook.get_selected_index();
                var cell = env.notebook.get_cell(index);
                if (cell.at_bottom() && index !== (env.notebook.ncells() - 1)) {
                    if (event) {
                        event.preventDefault();
                    }
                    env.notebook.command_mode();
                    env.notebook.select_next();
                    env.notebook.edit_mode();
                    var cm = env.notebook.get_selected_cell().code_mirror;
                    cm.setCursor(0, 0);
                }
                return false;
            }
        },
        'scroll-down': {
            handler: function (env, event) {
                if (event) {
                    event.preventDefault();
                }
                return env.notebook.scroll_manager.scroll(1);
            },
        },
        'scroll-up': {
            handler: function (env, event) {
                if (event) {
                    event.preventDefault();
                }
                return env.notebook.scroll_manager.scroll(-1);
            },
        },
        'scroll-cell-center': {
            help: "Scroll the current cell to the center",
            handler: function (env, event) {
                if (event) {
                    event.preventDefault();
                }
                var cell = env.notebook.get_selected_index();
                return env.notebook.scroll_cell_percent(cell, 50, 0);
            }
        },
        'scroll-cell-top': {
            help: "Scroll the current cell to the top",
            handler: function (env, event) {
                if (event) {
                    event.preventDefault();
                }
                var cell = env.notebook.get_selected_index();
                return env.notebook.scroll_cell_percent(cell, 0, 0);
            }
        },
        'save-notebook': {
            help: "Save and Checkpoint",
            help_index: 'fb',
            icon: 'fa-save',
            handler: function (env, event) {
                env.notebook.save_checkpoint();
                if (event) {
                    event.preventDefault();
                }
                return false;
            }
        }
    };
    var ActionHandler = (function () {
        function ActionHandler(env) {
            this._env = null;
            this._actions = null;
            this._env = env || {};
            this._setActions();
            Object.seal(this);
        }
        /**
         * Register an `action` with an optional name and prefix.
         *
         * If name and prefix are not given they will be determined automatically.
         * If action if just a `function` it will be wrapped in an anonymous action.
         *
         * Return the full name to access this action .
         **/
        ActionHandler.prototype.register = function (action, name, prefix) {
            action = this.normalise(action);
            if (!name) {
                name = 'autogenerated-' + String(action.handler);
            }
            prefix = prefix || 'auto';
            var full_name = prefix + '.' + name;
            this._actions.set(full_name, action);
            return full_name;
        };
        /**
         * Given an `action` or `function`, return a normalised `action`
         * by setting all known attributes and removing unknown attributes.
         **/
        ActionHandler.prototype.normalise = function (data) {
            if (typeof (data) === 'function') {
                data = { handler: data };
            }
            if (typeof (data.handler) !== 'function') {
                throw ('unknown datatype, cannot register');
            }
            var _data = data;
            data = {};
            data.handler = _data.handler;
            data.help = _data.help || '';
            data.icon = _data.icon || '';
            data.help_index = _data.help_index || '';
            return data;
        };
        ActionHandler.prototype.get_name = function (name_or_data) {
            /**
             * given an `action` or `name` of a action, return the name attached to this action.
             * if given the name of and corresponding actions does not exist in registry, return `null`.
             **/
            if (typeof (name_or_data) === 'string') {
                if (this.exists(name_or_data)) {
                    return name_or_data;
                }
                else {
                    return null;
                }
            }
            else {
                return this.register(name_or_data);
            }
        };
        ActionHandler.prototype.get = function (name) {
            return this._actions.get(name);
        };
        ActionHandler.prototype.call = function (name, event, env) {
            return this._actions.get(name).handler(env || this._env, event);
        };
        ActionHandler.prototype.exists = function (name) {
            return (typeof (this._actions.get(name)) !== 'undefined');
        };
        // Will actually generate/register all the Jupyter actions
        ActionHandler.prototype._setActions = function () {
            var final_actions = new Map();
            var k;
            for (k in this._actions) {
                if (_actions.hasOwnProperty(k)) {
                    // Js closure are function level not block level need to wrap in a IIFE
                    // and append ipython to event name these things do intercept event so are wrapped
                    // in a function that return false.
                    var handler = _prepare_handler(final_actions, k, this._actions.get(k));
                    (function (key, hdlr) {
                        var action = { handler: function (env, evt) {
                            hdlr(env);
                            if (evt) {
                                evt.preventDefault();
                            }
                            return false;
                        } };
                        final_actions.set('ipython.' + key, action);
                    })(k, handler);
                }
            }
            for (k in custom_ignore) {
                // Js closure are function level not block level need to wrap in a IIFE
                // same as above, but decide for themselves wether or not they intercept events.
                if (custom_ignore.hasOwnProperty(k)) {
                    var handler = _prepare_handler(final_actions, k, custom_ignore[k]);
                    (function (key, hdlr) {
                        var action = { handler: function (env, evt) {
                            return hdlr(env, evt);
                        } };
                        final_actions.set('ipython.' + key, action);
                    })(k, handler);
                }
            }
            this._actions = final_actions;
        };
        return ActionHandler;
    })();
    exports.ActionHandler = ActionHandler;
    // private stuff that prepend `.ipython` to actions names
    // and uniformize/fill in missing pieces in of an action.
    function _prepare_handler(registry, subkey, sourceAction) {
        var action = {
            help: sourceAction.help || subkey.replace(/-/g, ' '),
            help_index: sourceAction.help_index,
            icon: sourceAction.icon,
            handler: sourceAction.handler
        };
        registry.set('ipython.' + subkey, action);
        return action.handler;
    }
});
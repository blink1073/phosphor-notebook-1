"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
define(["require", "exports", './utils'], function (require, exports, utils) {
    /**
     * The url for the kernelspec service.
     */
    var SESSION_KERNELSPEC_URL = 'api/kernelspecs';
    /**
     * Handler for available kernelspecs.
     */
    var KernelSelector = (function () {
        /**
         * Create a kernel selector.
         */
        function KernelSelector(baseUrl) {
            this._url = "unknown";
            this._kernelspecs = new Map();
            this._url = utils.urlJoinEncode(baseUrl, SESSION_KERNELSPEC_URL);
        }
        /**
         * Request kernelspecs and return a list of kernel names.
         */
        KernelSelector.prototype.load = function () {
            var _this = this;
            var settings = {
                method: "GET",
                dataType: "json"
            };
            return utils.ajaxRequest(this._url, settings).then(function (success) {
                var err = new Error('Invalid KernelSpec info');
                if (success.xhr.status !== 200) {
                    throw err;
                }
                var data = success.data;
                if (!data.hasOwnProperty('default') ||
                    typeof data.default !== 'string') {
                    throw err;
                }
                if (!data.hasOwnProperty('kernelspecs') ||
                    !Array.isArray(data.kernelspecs)) {
                    throw err;
                }
                var names = [];
                for (var i = 0; i < data.kernelspecslength; i++) {
                    var ks = data.kernelspecs[i];
                    validateKernelSpec(ks);
                    _this._kernelspecs.set(ks.name, ks);
                    names.push(ks.name);
                }
                return names;
            });
        };
        /**
         * Select a kernel.
         */
        KernelSelector.prototype.select = function (kernel) {
            if (typeof kernel === 'string') {
                kernel = { name: kernel };
            }
            var selected = kernel;
            return this._kernelspecs.get(selected.name);
        };
        /**
         * Find kernel names by language.
         */
        KernelSelector.prototype.findByLanguage = function (language) {
            var kernelspecs = this._kernelspecs;
            var available = _sortedNames(kernelspecs);
            var matches = [];
            if (language && language.length > 0) {
                available.map(function (name) {
                    if (kernelspecs.get(name).spec.language.toLowerCase() === language.toLowerCase()) {
                        matches.push(name);
                    }
                });
            }
            return matches;
        };
        return KernelSelector;
    })();
    exports.KernelSelector = KernelSelector;
    /**
     * Sort kernel names.
     */
    function _sortedNames(kernelspecs) {
        return Object.keys(kernelspecs).sort(function (a, b) {
            // sort by display_name
            var da = kernelspecs.get(a).spec.display_name;
            var db = kernelspecs.get(b).spec.display_name;
            if (da === db) {
                return 0;
            }
            else if (da > db) {
                return 1;
            }
            else {
                return -1;
            }
        });
    }
    /**
     * Validate an object as being of IKernelSpecID type.
     */
    function validateKernelSpec(info) {
        var err = new Error("Invalid IKernelSpecId");
        if (!info.hasOwnProperty('name') || typeof info.name !== 'string') {
            throw err;
        }
        if (!info.hasOwnProperty('spec') || !info.hasOwnProperty('resources')) {
            throw err;
        }
        var spec = info.spec;
        if (!spec.hasOwnProperty('language') || typeof spec.language !== 'string') {
            throw err;
        }
        if (!spec.hasOwnProperty('display_name') ||
            typeof spec.display_name !== 'string') {
            throw err;
        }
        if (!spec.hasOwnProperty('argv') || !Array.isArray(spec.argv)) {
            throw err;
        }
        if (!spec.hasOwnProperty('codemirror_mode') ||
            typeof spec.codemirror_mode !== 'string') {
            throw err;
        }
        if (!spec.hasOwnProperty('env') || !spec.hasOwnProperty('help_links')) {
            throw err;
        }
    }
});

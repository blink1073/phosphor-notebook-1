"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
define(["require", "exports", './utils', './kernel'], function (require, exports, utils, kernel) {
    /**
     * CommManager class
     */
    var CommManager = (function () {
        /**
         * Create a CommManager instance.
         */
        function CommManager(sendFunc) {
            this._comms = null;
            this._sendFunc = null;
            this._sendFunc = sendFunc;
            this._comms = new Map();
            this._targets = new Map();
        }
        /**
         * Create a new Comm, register it, and open its Kernel-side counterpart
         * Mimics the auto-registration in `Comm.__init__` in the Jupyter Comm.
         */
        CommManager.prototype.newComm = function (target_name, data, metadata) {
            var comm = new Comm(target_name, this._sendFunc);
            this.registerComm(comm);
            comm.open(data, metadata);
            return comm;
        };
        /**
         * Register a target function for a given target name.
         */
        CommManager.prototype.registerTarget = function (target_name, f) {
            this._targets.set(target_name, f);
        };
        /**
         * Unregister a target function for a given target name
         */
        CommManager.prototype.unregisterTarget = function (target_name, f) {
            this._targets.delete(target_name);
        };
        /**
         * Register a comm in the mapping.
         */
        CommManager.prototype.registerComm = function (comm) {
            var promise = Promise.resolve(comm);
            this._comms.set(comm.commId, promise);
            return comm.commId;
        };
        /**
         * Remove a comm from the mapping.
         */
        CommManager.prototype.unregisterComm = function (comm) {
            this._comms.delete(comm.commId);
        };
        /**
         * comm_open message handler.
         */
        CommManager.prototype.commOpen = function (msg) {
            var content = msg.content;
            var that = this;
            var commId = content.commId;
            var promise = utils.loadClass(content.target_name, content.target_module, this._targets).then(function (target) {
                var cb = this._sendFunc;
                var comm = new Comm(content.target_name, cb, commId);
                try {
                    var response = target(comm, msg);
                }
                catch (e) {
                    comm.close();
                    that.unregisterComm(comm);
                    console.error("Exception opening new comm");
                    return Promise.reject(e);
                }
                // Regardless of the target return value, we need to
                // then return the comm
                return Promise.resolve(response).then(function () {
                    return comm;
                });
            }, function () {
                throw Error('Could not open comm');
            });
            this._comms.set(commId, promise);
            return promise;
        };
        /**
         * comm_close message handler.
         */
        CommManager.prototype.commClose = function (msg) {
            var _this = this;
            var content = msg.content;
            var promise = this._comms.get(content.commId);
            if (promise === undefined) {
                console.error('Comm promise not found for comm id ' + content.commID);
                return;
            }
            promise.then(function (comm) {
                _this.unregisterComm(comm);
                try {
                    comm.handleClose(msg);
                }
                catch (e) {
                    console.log("Exception closing comm: ", e, e.stack, msg);
                }
                // don't return a comm, so that further .then() functions
                // get an undefined comm input
            });
            this._comms.delete(content.commID);
            return Promise.resolve(undefined);
        };
        /**
         * comm_msg message handler.
         */
        CommManager.prototype.commMsg = function (msg) {
            var content = msg.content;
            var promise = this._comms.get(content.commId);
            if (promise === undefined) {
                console.error('Comm promise not found for comm id ' + content.commID);
                return;
            }
            promise = promise.then(function (comm) {
                try {
                    comm.handleMsg(msg);
                }
                catch (e) {
                    console.log("Exception handling comm msg: ", e, e.stack, msg);
                }
                return comm;
            });
            this._comms.set(content.commId, promise);
            return promise;
        };
        return CommManager;
    })();
    exports.CommManager = CommManager;
    var Comm = (function () {
        function Comm(target_name, sendFunc, commID) {
            this._sendFunc = null;
            this._targetName = "unknown";
            this._commId = "unknown";
            this._msgCallback = null;
            this._closeCallback = null;
            this._targetName = target_name;
            this._commId = commID || utils.uuid();
            this._sendFunc = sendFunc;
        }
        Object.defineProperty(Comm.prototype, "commId", {
            /**
             * Get the comm id.
             */
            get: function () {
                return this._commId;
            },
            /**
             * Set the comm id.
             */
            set: function (id) {
                this._commId = id;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Send a comm_open message.
         */
        Comm.prototype.open = function (data, metadata) {
            var content = {
                comm_id: this._commId,
                target_name: this._targetName,
                data: data || {},
            };
            var sendFunc = this._sendFunc;
            return sendFunc("comm_open", content, metadata);
        };
        /**
         * Send a comm_msg message.
         */
        Comm.prototype.send = function (data, metadata, buffers) {
            var content = {
                comm_id: this._commId,
                data: data || {},
            };
            var sendFunc = this._sendFunc;
            return sendFunc("comm_msg", content, metadata, buffers);
        };
        /**
         * Send a comm_close message.
         */
        Comm.prototype.close = function (data, metadata) {
            var content = {
                comm_id: this._commId,
                data: data || {},
            };
            var sendFunc = this._sendFunc;
            return sendFunc("comm_close", content, metadata);
        };
        /**
         * Register an comm_msg callback.
         */
        Comm.prototype.onMsg = function (cb) {
            this._msgCallback = cb;
        };
        /**
         * Register a comm_close callback.
         */
        Comm.prototype.onClose = function (cb) {
            this._closeCallback = cb;
        };
        /**
         * Handle an incoming comm_msg message.
         */
        Comm.prototype.handleMsg = function (msg) {
            var cb = this._msgCallback;
            if (cb)
                cb(msg);
        };
        /**
         * Handle an incoming comm_close message.
         */
        Comm.prototype.handleClose = function (msg) {
            var cb = this._closeCallback;
            if (cb)
                cb(msg);
        };
        return Comm;
    })();
    exports.Comm = Comm;
});

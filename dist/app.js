"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    var Bootstrapper = phosphor.shell.Bootstrapper;
    var NotebookApplication = (function (_super) {
        __extends(NotebookApplication, _super);
        function NotebookApplication() {
            _super.apply(this, arguments);
        }
        NotebookApplication.prototype.configurePlugins = function () {
            return this.pluginList.add([]);
        };
        return NotebookApplication;
    })(Bootstrapper);
    exports.NotebookApplication = NotebookApplication;
    console.log('loaded app');
});

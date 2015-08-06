"use strict";
///<reference path="../components/phosphor/dist/phosphor.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./mathjaxutils"], function (require, exports, mathjaxutils) {
    var DOM = phosphor.virtualdom.dom;
    var Component = phosphor.virtualdom.Component;
    var BaseComponent = phosphor.virtualdom.BaseComponent;
    var createFactory = phosphor.virtualdom.createFactory;
    var render = phosphor.virtualdom.render;
    var div = DOM.div;
    var pre = DOM.pre;
    var img = DOM.img;
    var MimeBundleComponent = (function (_super) {
        __extends(MimeBundleComponent, _super);
        function MimeBundleComponent() {
            _super.apply(this, arguments);
        }
        MimeBundleComponent.prototype.render = function () {
            // possible optimization: iterate through 
            var x;
            if (x = this.data["image/png"]) {
                return img({ src: "data:image/png;base64," + x });
            }
            else if (x = this.data["image/jpg"]) {
                return img({ src: "data:image/jpg;base64," + x });
            }
            else if (x = this.data["text/plain"]) {
                return pre(x);
            }
        };
        return MimeBundleComponent;
    })(Component);
    exports.MimeBundle = createFactory(MimeBundleComponent);
    var ExecuteResultComponent = (function (_super) {
        __extends(ExecuteResultComponent, _super);
        function ExecuteResultComponent() {
            _super.apply(this, arguments);
        }
        ExecuteResultComponent.prototype.render = function () {
            return exports.MimeBundle(this.data.data);
        };
        return ExecuteResultComponent;
    })(Component);
    exports.ExecuteResult = createFactory(ExecuteResultComponent);
    var DisplayDataComponent = (function (_super) {
        __extends(DisplayDataComponent, _super);
        function DisplayDataComponent() {
            _super.apply(this, arguments);
        }
        DisplayDataComponent.prototype.render = function () {
            return exports.MimeBundle(this.data.data);
        };
        return DisplayDataComponent;
    })(Component);
    exports.DisplayData = createFactory(DisplayDataComponent);
    var StreamComponent = (function (_super) {
        __extends(StreamComponent, _super);
        function StreamComponent() {
            _super.apply(this, arguments);
        }
        StreamComponent.prototype.render = function () {
            return pre(this.data.text);
        };
        return StreamComponent;
    })(Component);
    exports.Stream = createFactory(StreamComponent);
    var JupyterErrorComponent = (function (_super) {
        __extends(JupyterErrorComponent, _super);
        function JupyterErrorComponent() {
            _super.apply(this, arguments);
        }
        JupyterErrorComponent.prototype.render = function () {
            var o = this.data;
            return pre(o.ename + '\n' + o.evalue + '\n' + (o.traceback.join('\n')));
        };
        return JupyterErrorComponent;
    })(Component);
    exports.JupyterError = createFactory(JupyterErrorComponent);
    // customized renderer example from marked.js readme
    var renderer = new marked.Renderer();
    renderer.heading = function (text, level) {
        var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        return "<h" + level + " id=\"" + escapedText + "\">" + text + "<a class=\"anchor-link\" href=\"#" + escapedText + "\">\u00B6</a></h" + level + ">";
    };
    renderer.unescape = function (html) {
        // from https://github.com/chjj/marked/blob/2b5802f258c5e23e48366f2377fbb4c807f47658/lib/marked.js#L1085
        return html.replace(/&([#\w]+);/g, function (_, n) {
            n = n.toLowerCase();
            if (n === 'colon')
                return ':';
            if (n.charAt(0) === '#') {
                return n.charAt(1) === 'x'
                    ? String.fromCharCode(parseInt(n.substring(2), 16))
                    : String.fromCharCode(+n.substring(1));
            }
            return '';
        });
    };
    renderer.check_url = function (href) {
        try {
            var prot = decodeURIComponent(this.unescape(href))
                .replace(/[^\w:]/g, '')
                .toLowerCase();
        }
        catch (e) {
            return false;
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
            return false;
        }
        return true;
    };
    renderer.link = function (href, title, text) {
        //modified from the mark.js source to open all urls in new tabs
        if (this.options.sanitize && !this.check_url(href)) {
            return '';
        }
        return "<a href=\"" + href + "\" " + (title ? "title=\"" + title + "\"" : "") + " " + (href[0] !== "#" ? "target=_blank" : "") + ">" + text + "</a>";
    };
    var MarkdownCellComponent = (function (_super) {
        __extends(MarkdownCellComponent, _super);
        function MarkdownCellComponent() {
            _super.apply(this, arguments);
        }
        MarkdownCellComponent.prototype.onUpdateRequest = function (msg) {
            var _this = this;
            // replace the innerHTML of the node with the rendered markdown
            var t = mathjaxutils.remove_math(this.data.source);
            marked(t.html, { sanitize: true, renderer: renderer }, function (err, html) {
                _this.node.innerHTML = mathjaxutils.replace_math(html, t.math);
                // TODO: do some serious sanitization, using, for example, the caja sanitizer
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, _this.node]);
            });
        };
        return MarkdownCellComponent;
    })(BaseComponent);
    exports.MarkdownCell = createFactory(MarkdownCellComponent);
    /**
     * We inherit from BaseComponent so that we can explicitly control the rendering.  We want to use the virtual dom to render
     * the output, but we want to explicitly manage the code editor.
    */
    var CodeCellComponent = (function (_super) {
        __extends(CodeCellComponent, _super);
        function CodeCellComponent(data, children) {
            _super.call(this, data, children);
            this.editor_node = document.createElement('div');
            this.editor_node.classList.add("ipy-input");
            this.output_node = document.createElement('div');
            this.node.appendChild(this.editor_node);
            this.node.appendChild(this.output_node);
            this._editor = CodeMirror(this.editor_node, {
                mode: 'python',
                value: this.data.source,
                lineNumbers: true });
        }
        CodeCellComponent.prototype.onUpdateRequest = function (msg) {
            // we could call setValue on the editor itself, but the dts file doesn't recognize it.
            this._editor.getDoc().setValue(this.data.source);
            // we may want to save the refs at some point
            render(this.renderOutput(), this.output_node);
        };
        CodeCellComponent.prototype.onAfterAttach = function (msg) {
            this._editor.refresh();
        };
        CodeCellComponent.prototype.renderOutput = function () {
            var r = [];
            var outputs = this.data.outputs;
            for (var i = 0; i < outputs.length; i++) {
                var x = outputs[i];
                switch (x.output_type) {
                    case "execute_result":
                        r.push(exports.ExecuteResult(x));
                        break;
                    case "display_data":
                        r.push(exports.DisplayData(x));
                        break;
                    case "stream":
                        r.push(exports.Stream(x));
                        break;
                    case "error":
                        r.push(exports.JupyterError(x));
                        break;
                }
            }
            return r;
        };
        return CodeCellComponent;
    })(BaseComponent);
    exports.CodeCell = createFactory(CodeCellComponent);
    var NotebookComponent = (function (_super) {
        __extends(NotebookComponent, _super);
        function NotebookComponent() {
            _super.apply(this, arguments);
        }
        NotebookComponent.prototype.render = function () {
            var cells = this.data.cells;
            var r = [];
            for (var i = 0; i < cells.length; i++) {
                var c = cells[i];
                switch (c.cell_type) {
                    case "code":
                        r.push(exports.CodeCell(c));
                        break;
                    case "markdown":
                        r.push(exports.MarkdownCell(c));
                        break;
                }
            }
            return r;
        };
        return NotebookComponent;
    })(Component);
    exports.Notebook = createFactory(NotebookComponent);
});

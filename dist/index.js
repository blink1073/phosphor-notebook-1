"use strict";
define(["require", "exports", "./NotebookComponent", "./demodata", "./mathjaxutils"], function (require, exports, NotebookComponent, demo, mathjaxutils) {
    var render = phosphor.virtualdom.render;
    function main() {
        //    var notebook = new NotebookApp.NotebookApplication;
        // notebook.run();
        var test = document.getElementById('nb');
        mathjaxutils.init();
        render(NotebookComponent.Notebook(demo.notebook), test);
    }
    exports.main = main;
    ;
});
/*

            this.session = new session.Session(options);
            this.session.start(success, failure);

    Notebook.prototype._session_started = function (){
        this._session_starting = false;
        this.kernel = this.session.kernel;
        var ncells = this.ncells();
        for (var i=0; i<ncells; i++) {
            var cell = this.get_cell(i);
            if (cell instanceof codecell.CodeCell) {
                cell.set_kernel(this.session.kernel);
            }
        }
    };

    Notebook.prototype._session_start_failed = function(jqxhr, status, error){
        this._session_starting = false;
        utils.log_ajax_error(jqxhr, status, error);
    };


The notebook has a kernel associated with it.  It passes an "execute" call back down to the cells, which the
cells can call with their ids and the text in the cell.  Or maybe the cell should set its text in a separate call
and then execute it.

   */

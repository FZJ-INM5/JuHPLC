/**
 * Created by v.mauel on 16.05.2017.
 */
class JuHPLC {

    constructor(chromatogram) {
        this.chromatogram = chromatogram;

        window.juhplc = this;


    }



    scaleGraphY(graphName){
        this._addscaleGraphYModal();
        $('#scaleGraphYModal').modal('show');
        $('#scaleGraphYGraphName').val(graphName);
    }

    scaleGraphYTo(graphName,min,max){
        window.app.$eventHub.$emit('setScaleY',{channelName:graphName,min:min,max:max});
        //this.juhplcdygraphs.setYScale(graphName,min,max);
        this._removescaleGraphYModal();
    }

    _removescaleGraphYModal(){
        $('#scaleGraphYModal').modal("hide");
        setTimeout(function(){
            $('#scaleGraphYModal').remove();
        },500);

    }

    _addscaleGraphYModal(){
        var self = this;
        var template = '<div class="modal fade" id="scaleGraphYModal" tabindex="-1" role="dialog" aria-hidden="true">\n' +
            '  <div class="modal-dialog" role="document">\n' +
            '    <div class="modal-content">\n' +
            '      <div class="modal-header">\n' +
            '        <h5 class="modal-title">Scale Graph</h5>\n' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
            '          <span aria-hidden="true">&times;</span>\n' +
            '        </button>\n' +
            '      </div>\n' +
            '      <div class="modal-body">Graph:<br/>' +
            '        <select id="scaleGraphYGraphName"></select><br/>' +
			'        min:<input type="text" id="scaleGraphYmin"/><br/>' +
			'        max:<input type="text" id="scaleGraphYmax"/><br/>' +
            '      </div>\n' +
            '      <div class="modal-footer">\n' +
            '        <button type="button" class="btn btn-primary" id="scaleGraphYSaveBtn">Save changes</button>\n' +
            '        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '</div>';
       $('body').append(template);

       for(var graph in window.chromatogram.Data.Data) {
           if (window.chromatogram.Data.Data.hasOwnProperty(graph)) {
               $('#scaleGraphYGraphName').append(
                   $('<option></option>').val(graph).html(graph)
               );
           }
       }

        $('#scaleGraphYModal').on('hidden.bs.modal', function () {
            self._removescaleGraphYModal();
        });
        $('#scaleGraphYSaveBtn').click(function (test) {
            console.log(test);
            self.scaleGraphYTo($('#scaleGraphYGraphName').val(),$('#scaleGraphYmin').val(),$('#scaleGraphYmax').val());
        });
    }

    scaleGraphX(){
        this._addscaleGraphXModal();
        $('#scaleGraphXModal').modal('show');
    }

    scaleGraphXTo(min,max){
        window.app.$eventHub.$emit('setScaleX',{min:min,max:max});
        this._removescaleGraphXModal();
    }

    _removescaleGraphXModal(){
        $('#scaleGraphXModal').modal("hide");
        setTimeout(function(){
            $('#scaleGraphXModal').remove();
        },500);

    }

    _addscaleGraphXModal(){
        var self = this;
        var template = '<div class="modal fade" id="scaleGraphXModal" tabindex="-1" role="dialog" aria-hidden="true">\n' +
            '  <div class="modal-dialog" role="document">\n' +
            '    <div class="modal-content">\n' +
            '      <div class="modal-header">\n' +
            '        <h5 class="modal-title">Scale Graph</h5>\n' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
            '          <span aria-hidden="true">&times;</span>\n' +
            '        </button>\n' +
            '      </div>\n' +
            '      <div class="modal-body">' +
			'        min:<input type="text" id="scaleGraphXmin"/><br/>' +
			'        max:<input type="text" id="scaleGraphXmax"/><br/>' +
            '      </div>\n' +
            '      <div class="modal-footer">\n' +
            '        <button type="button" class="btn btn-primary" id="scaleGraphXSaveBtn">Save changes</button>\n' +
            '        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '</div>';
       $('body').append(template);

        $('#scaleGraphXModal').on('hidden.bs.modal', function () {
            self._removescaleGraphXModal();
        });
        $('#scaleGraphXSaveBtn').click(function () {
            self.scaleGraphXTo($('#scaleGraphXmin').val(),$('#scaleGraphXmax').val());
        });
    }

}

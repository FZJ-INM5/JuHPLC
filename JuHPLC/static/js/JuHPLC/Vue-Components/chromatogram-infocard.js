 Vue.component('chromatogram-infocard', {
  props: {
      chromatogram:{},
  },
  template:'<div class="card" >\n' +
  '                            <div class="card-header"><h5>{{ chromatogram.Sample }}</h5></div>\n' +
  '                            <div class="card-block">\n' +
  '                                <table class="table small table-sm">\n' +
  '                                    <tr>\n' +
  '                                        <th style="white-space:nowrap;">Column</th>\n' +
  '                                        <td>{{ chromatogram.Column }}</td>\n' +
  '                                    </tr>\n' +
  '                                    <tr>\n' +
  '                                        <th style="white-space:nowrap;">Flow</th>\n' +
  '                                        <td>{{ chromatogram.Flow }}</td>\n' +
  '                                    </tr>\n' +
  '                                    <tr>\n' +
  '                                        <th style="white-space:nowrap;">UV Wavelength</th>\n' +
  '                                        <td>{{ chromatogram.UVWaveLength }}</td>\n' +
  '                                    </tr>\n' +
  '                                    <tr>\n' +
  '                                        <th style="white-space:nowrap;">Concentration</th>\n' +
  '                                        <td>{{ chromatogram.Concentration }} {{ chromatogram.ConcentrationUnit }}</td>\n' +
  '                                    </tr>\n' +
  '                                    <tr>\n' +
  '                                        <th style="white-space:nowrap;">Injection Volume</th>\n' +
  '                                        <td>{{ chromatogram.InjectionVolume }}</td>\n' +
  '                                    </tr>\n' +
  '                                    <tr>\n' +
  '                                        <th style="white-space:nowrap;">Sample Rate</th>\n' +
  '                                        <td>{{ chromatogram.SampleRate }}</td>\n' +
  '                                    </tr>\n' +
  '                                </table>\n' +
  '                            </div>\n' +
  '                        </div>'
});
Vue.use("chromatogram-infocard");
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WebApp.settings')
django.setup()

import unittest
import json
from django.http import HttpRequest
from types import SimpleNamespace
from JuHPLC.Views import NewChromatogram

class DummyModel:
    def __init__(self):
        self.saved = False
    def save(self):
        self.saved = True

class DummyQuery:
    def __init__(self, ret=None):
        self.ret = ret
        self.deleted = False
    def delete(self):
        self.deleted = True
    def filter(self, **k):
        return self
    def all(self):
        return []
    def first(self):
        return self.ret

class ViewTests(unittest.TestCase):
    def setUp(self):
        # patch models
        self.orig_Peak = NewChromatogram.Peak
        self.orig_Chromatogram = NewChromatogram.Chromatogram
        self.orig_Baseline = NewChromatogram.Baseline
        class P(DummyModel):
            objects = DummyQuery()
        class B(DummyModel):
            objects = DummyQuery()
        class C(DummyModel):
            objects = SimpleNamespace(get=lambda pk: DummyModel())
        NewChromatogram.Peak = P
        NewChromatogram.Baseline = B
        NewChromatogram.Chromatogram = C
    def tearDown(self):
        NewChromatogram.Peak = self.orig_Peak
        NewChromatogram.Baseline = self.orig_Baseline
        NewChromatogram.Chromatogram = self.orig_Chromatogram

    def _make_request(self, data):
        req = HttpRequest()
        req._body = json.dumps(data).encode('utf-8')
        req.user = None
        return req

    def test_add_peak(self):
        req = self._make_request({"GraphName":"G","StartTime":1,"EndTime":2})
        resp = NewChromatogram.ChromatogramAddPeak.__wrapped__(req,1)
        self.assertEqual(resp.status_code, 200)

    def test_overwrite_peaks(self):
        data = {"UV":[{"StartTime":1,"EndTime":2,"Name":"p"}]}
        req = self._make_request(data)
        resp = NewChromatogram.ChromatogramOverwritePeaks.__wrapped__(req,1)
        self.assertEqual(resp.status_code, 200)

    def test_overwrite_baseline_and_save_comment(self):
        data = {"UV":{"DatetimeValue":[1],"Type":"t"}}
        req = self._make_request(data)
        resp = NewChromatogram.ChromatogramOverwriteBaseline.__wrapped__(req,1)
        self.assertEqual(resp.status_code, 200)

        req2 = self._make_request({"Comment":"c"})
        resp2 = NewChromatogram.ChromatogramSaveComment.__wrapped__(req2,1)
        self.assertEqual(resp2.status_code, 200)

    def test_config_view(self):
        captured = {}
        def fake_render(req, template, ctx):
            captured['ctx'] = ctx
            return 'ok'
        self.orig_render = NewChromatogram.render
        NewChromatogram.render = fake_render
        NewChromatogram.serial = SimpleNamespace(tools=SimpleNamespace(list_ports=SimpleNamespace(comports=lambda: [1,2])))
        res = NewChromatogram.Config(HttpRequest())
        self.assertEqual(res, 'ok')
        self.assertEqual(captured['ctx']['serialports'], [1,2])
        NewChromatogram.render = self.orig_render

    def test_serial_ports_macos(self):
        import sys
        sys.platform = 'darwin'
        class DummySerial(DummyModel):
            def close(self):
                pass
        NewChromatogram.glob = SimpleNamespace(glob=lambda pattern: ['/dev/tty.usb'])
        NewChromatogram.serial = SimpleNamespace(
            Serial=lambda port, timeout=1: DummySerial(),
            SerialException=Exception
        )
        ports = NewChromatogram.serial_ports()
        self.assertEqual(ports, ['/dev/tty.usb'])

    def test_new_chromatogram_view(self):
        captured = {}
        def fake_render(req, tpl, ctx):
            captured['ctx'] = ctx
            return 'rendered'
        NewChromatogram.render = fake_render
        class BrokenQuery:
            def order_by(self, *a, **k):
                raise Exception('fail')
        NewChromatogram.Chromatogram.objects = BrokenQuery()
        res = NewChromatogram.NewChromatogram(HttpRequest())
        self.assertEqual(res, 'rendered')
        self.assertIn('FactorsUnits', captured['ctx'])

if __name__ == '__main__':
    unittest.main()

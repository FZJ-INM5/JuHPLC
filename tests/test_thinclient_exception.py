import runpy
import sys
import types
import unittest
from unittest import mock

class DummyWSApp:
    def __init__(self, *args, **kwargs):
        pass
    def run_forever(self):
        raise RuntimeError('boom')

dummy_websocket = types.SimpleNamespace(WebSocketApp=DummyWSApp,
                                        enableTrace=lambda flag: None)

class ThinClientExceptionTests(unittest.TestCase):
    def test_main_loop_handles_exception(self):
        with mock.patch.dict(sys.modules, {'websocket': dummy_websocket}):
            with mock.patch('time.sleep', side_effect=[None, StopIteration()]):
                with mock.patch('logging.exception') as log_exc:
                    with self.assertRaises(StopIteration):
                        runpy.run_module('thinclient', run_name='__main__')
                    log_exc.assert_called()

if __name__ == '__main__':
    unittest.main()

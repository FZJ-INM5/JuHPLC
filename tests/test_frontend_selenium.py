import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebApp.settings")
django.setup()

import unittest
from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from JuHPLC.models import Chromatogram

class FrontendSeleniumTests(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        try:
            cls.browser = webdriver.Chrome(options=options)
            cls.browser.implicitly_wait(10)
            cls.driver_available = True
        except Exception:
            cls.driver_available = False
            cls.browser = None

    @classmethod
    def tearDownClass(cls):
        if getattr(cls, 'browser', None):
            cls.browser.quit()
        super().tearDownClass()

    def setUp(self):
        if not getattr(self, 'driver_available', False):
            self.skipTest('Webdriver not available')

    def test_index_page_displays_chromatogram(self):
        user = User.objects.create(username='selenium')
        Chromatogram.objects.create(
            Column='c', Datetime=0, Flow='f', UVWavelength='u', Sample='s',
            InjectionVolume='i', Concentration='c', ConcentrationUnit='u',
            Comment='com', AcquireADC=False, DeadTime=0, FactorsUnits='',
            ChannelOrderShift='', MaxRuntime=0, RheodyneSwitch=False,
            SampleRate=1, NextChromatogram=0, HalfLife=0.0, User=user)
        self.browser.get(self.live_server_url + '/')
        body_text = self.browser.find_element(By.TAG_NAME, 'body').text
        self.assertIn('All Chromatograms', body_text)
        self.assertIn('selenium', body_text)

if __name__ == '__main__':
    unittest.main()

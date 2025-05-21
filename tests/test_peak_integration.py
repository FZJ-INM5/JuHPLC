import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebApp.settings")
django.setup()

import unittest
from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from django.core.management import call_command

from JuHPLC.models import Chromatogram, HplcData, Peak
import math


def generate_gauss_peak(m, sigma, factor):
    return [(1/(sigma*math.sqrt(2*math.pi))*math.exp(-0.5*((t-m)/sigma)**2))*factor for t in range(2*m)]

def calculate_peak_area(values, start, end):
    x1, x2 = start, end
    y1, y2 = values[start], values[end]
    m = (y2 - y1) / (x2 - x1)
    n = -(m * x1 - y1)
    area = 0.0
    for i in range(start, end + 1):
        baseline = m * i + n
        area += abs(values[i] - baseline)
    return area


class PeakIntegrationFrontendTests(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Ensure migrations are applied for the selenium test database
        call_command('migrate', verbosity=0, interactive=False)
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

    def test_peak_area_display(self):
        user = User.objects.create(username='peaktest')
        chrom = Chromatogram.objects.create(
            Column='c', Datetime=0, Flow='f', UVWavelength='u', Sample='s',
            InjectionVolume='i', Concentration='c', ConcentrationUnit='u',
            Comment='com', AcquireADC=False, DeadTime=0, FactorsUnits='UV - 1 - a.u.',
            ChannelOrderShift='UV - 0', MaxRuntime=0, RheodyneSwitch=False,
            SampleRate=1, NextChromatogram=0, HalfLife=0.0, User=user)

        values = generate_gauss_peak(5*60, 50, 10000)
        for idx, val in enumerate(values):
            HplcData.objects.create(Chromatogram=chrom, ChannelName='UV', Datetime=idx, Value=val)

        Peak.objects.create(Chromatogram=chrom, ChannelName='UV', StartTime=200, EndTime=400, Name='p1')
        expected_area = calculate_peak_area(values, 200, 400)

        self.browser.get(self.live_server_url + f'/ChromatogramDetails/{chrom.id}')
        cell = self.browser.find_element(By.CSS_SELECTOR, '#UVPeakTable tbody tr td:nth-child(8)')
        displayed_area = float(cell.text)
        self.assertAlmostEqual(displayed_area, expected_area, places=1)


if __name__ == '__main__':
    unittest.main()

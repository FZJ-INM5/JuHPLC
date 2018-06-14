#!/usr/bin/python
# -*- coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_submodules
hiddenimports = collect_submodules('django.contrib')
# -*- coding: utf-8 -*-
# Generated by Django 1.11b1 on 2017-05-17 06:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('JuHPLC', '0004_peak_channelname'),
    ]

    operations = [
        migrations.AddField(
            model_name='chromatogram',
            name='FactorsUnits',
            field=models.TextField(default='UV - 0.001 - µAu\r\nCounter - 1 - CPS'),
            preserve_default=False,
        ),
    ]

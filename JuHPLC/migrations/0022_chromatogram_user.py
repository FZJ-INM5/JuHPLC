# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2019-01-13 16:26
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('JuHPLC', '0021_marker'),
    ]

    operations = [
        migrations.AddField(
            model_name='chromatogram',
            name='User',
            field=models.ForeignKey(default=2, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]

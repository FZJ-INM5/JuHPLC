# Generated by Django 2.0.1 on 2018-08-14 08:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('JuHPLC', '0018_auto_20180620_1346'),
    ]

    operations = [
        migrations.CreateModel(
            name='Calibration',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Chromatograms', models.ManyToManyField(to='JuHPLC.Chromatogram')),
            ],
        ),
        migrations.CreateModel(
            name='JSONJuHPLCChromatogram',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
    ]
# Generated by Django 2.0.1 on 2018-02-20 12:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('JuHPLC', '0010_chromatogram_maxruntime'),
    ]

    operations = [
        migrations.AddField(
            model_name='chromatogram',
            name='RheodyneSwitch',
            field=models.BooleanField(default=False),
            preserve_default=False,
        ),
    ]

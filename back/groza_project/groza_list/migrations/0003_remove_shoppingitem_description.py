# Generated by Django 5.2 on 2025-04-27 15:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('groza_list', '0002_shoppingitem_description_shoppinglist_updated_at'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shoppingitem',
            name='description',
        ),
    ]

# Generated by Django 5.0.2 on 2024-03-17 06:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_alter_user_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='github_id',
            field=models.IntegerField(null=True, unique=True),
        ),
    ]

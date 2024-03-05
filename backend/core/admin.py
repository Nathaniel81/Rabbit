from django.contrib import admin
from .models import Subrabbit, Post, Comment, Vote

admin.site.register(Subrabbit)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Vote)

from django.db import models
from accounts.models import User
from django_editorjs_fields import EditorJsJSONField
from django.core.validators import MinLengthValidator, MaxLengthValidator


class Subrabbit(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=21, unique=True, validators=[
        MinLengthValidator(3), MaxLengthValidator(21)])
    description = models.CharField(max_length=500, blank=True)
    subscribers = models.ManyToManyField(User, related_name='subscriptions', blank=True)
    moderators = models.ManyToManyField(User, related_name='moderates', blank=True)
    rules = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, null=True, blank=True)
    # Field to store content using EditorJs
    content=EditorJsJSONField(
        plugins=[
            "@editorjs/image",
            "@editorjs/header",
            "editorjs-github-gist-plugin",
            "@editorjs/code@2.6.0",
            "@editorjs/list@latest",
            "@editorjs/inline-code",
            "@editorjs/table",
        ],
        # Configuration for specific tools used in EditorJs
         tools={
                "Link":{
                    "config":{
                        "endpoint":
                            'api/link/'  # API endpoint for handling links
                        }
                },
                "Image":{
                    "config":{
                        "endpoints":{
                            "byFile":'api/upload-file/',  # API endpoint for uploading files
                            "byUrl":'api/upload-image/'  # API endpoint for uploading images
                        },
                       
                    }
                },
            }
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    subrabbit = models.ForeignKey(Subrabbit, related_name='posts', on_delete=models.CASCADE)
    def __str__(self):
        return self.title

class VoteType(models.TextChoices):
    UP = 'UP', 'Upvote'
    DOWN = 'DOWN', 'Downvote'

class Vote(models.Model):
    user = models.ForeignKey(User, related_name='votes', on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='votes', on_delete=models.CASCADE)
    type = models.CharField(max_length=4, choices=VoteType.choices)

    class Meta:
        unique_together = ('user', 'post')

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    parent_post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    parent_comment_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.author}'s comment on \"{self.parent_post}\""

class CommentVote(models.Model):
    user = models.ForeignKey(User, related_name='user_votes', on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='post_votes', null=True, 
                                                    blank=True, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, related_name='comment_votes', 
                                        null=True, blank=True, on_delete=models.CASCADE)
    type = models.CharField(max_length=4, choices=VoteType.choices)

    class Meta:
        unique_together = ('user', 'post', 'comment')

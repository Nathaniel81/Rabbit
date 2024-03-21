import requests
from bs4 import BeautifulSoup
from cloudinary.uploader import upload
from django.core.files.storage import FileSystemStorage
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def fetch_url_metadata(request):
    """
    View for fetching metadata from a URL.

    This view allows users to fetch metadata such as title, description,
    and image from a provided URL while creating a post.

    Parameters:
        request: The request object containing the URL to fetch metadata from.

    Returns:
        Response: Response containing the fetched metadata.
    """

    url = request.GET.get('url')

    if not url:
        return Response('Invalid URL', status=400)

    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    title = soup.title.string if soup.title else ''
    description_tag = soup.find('meta', attrs={'name': 'description'})
    description = description_tag['content'] if description_tag else ''
    image_tag = soup.find('meta', attrs={'property': 'og:image'})
    image_url = image_tag['content'] if image_tag else ''

    return Response({
        'success': 1,
        'meta': {
            'title': title,
            'description': description,
            'image': {
                'url': image_url,
            },
        },
    })

@api_view(['POST'])
def upload_image(request):
    """
    View for uploading images.

    This view handles POST requests for uploading images. It expects an 'image' file in the request data
    and returns the URL of the uploaded image. The image is stored on Cloudinary storage, which is the default
    file storage of the project.

    Parameters:
        request: The request object containing the uploaded image file.

    Returns:
        Response: Response containing the URL of the uploaded image.
    """

    uploaded_file = request.FILES['image']
    result = upload(uploaded_file)
    file_url = result['secure_url']

    return Response({
        'success': 1,
        'file': {
            'url': file_url,
        },
    })

@api_view(['POST'])
def upload_file(request):
    """
    View for uploading files.

    This view handles POST requests for uploading files. It expects a 'file' file in the request data
    and returns the URL, name, and size of the uploaded file.

    Parameters:
        request: The request object containing the uploaded file.

    Returns:
        Response: Response containing the URL, name, and size of the uploaded file.
    """

    uploaded_file = request.FILES['file']
    fs = FileSystemStorage()
    filename = fs.save(uploaded_file.name, uploaded_file)
    file_url = fs.url(filename)
    file_size = fs.size(filename)
    return Response({
        'success': 1,
        'file': {
            'url': file_url,
            'name': uploaded_file.name,
            'size': file_size,
        },
    })

import PostFeed from '../PostFeed'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { getCsrfToken } from '@/lib/utils'


const Feed = () => {
    const homePagePostsQueryKey = ['homePagePosts'];

    const { data: homePagePostsData } = useQuery({
      queryKey: homePagePostsQueryKey,
      queryFn: async () => {
        const config = {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "x-csrftoken": getCsrfToken()
            },
          }
        const response = await axios.get(`/api/posts/`, config);
        const postData = await response.data;
        return postData;
      },
    });
    console.log(homePagePostsData)

  return <PostFeed posts={homePagePostsData} />
}

export default Feed

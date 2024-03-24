import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Post as PostType } from '@/types/post'
import Post from './Post'
import { useIntersection } from '@mantine/hooks'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { Votes } from '@/types/post'
import { getCsrfToken } from '@/lib/utils'


const PostFeed = () => {
  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { user } = userLogin;
  const INFINITE_SCROLL_PAGINATION_RESULTS = 3;
  const { slug } = useParams();

  const subrabbitName = slug || '';

  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const config = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "x-csrftoken": getCsrfToken()
    },
  };

  const { 
    data, 
    fetchNextPage, 
    isFetchingNextPage 
} = useInfiniteQuery({
    queryKey: ['infinite-query', slug],
    queryFn: async ({ pageParam = 1 }) => {
        const query =
            `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
            (subrabbitName ? `&subrabbitName=${subrabbitName}` : '');

        const { data } = await axios.get(query, config);
        return data;
    },
    initialPageParam: 1,
    getNextPageParam: (_, pages) => {
        return pages.length + 1;
    },
    // initialData: { pages: [initialPosts], pageParams: [1] },
});

const posts = data?.pages.flatMap((page) => page);
useEffect(() => {
  if (entry?.isIntersecting && posts && posts[posts?.length - 1]?.next) {
    fetchNextPage(); // Load more posts when the last post comes into view
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [entry, fetchNextPage]);


  return (
    <ul className='flex flex-col col-span-2 space-y-6'>
      {posts?.map((postItem, postIndex) => postItem?.results?.map((post: PostType, index: number) => {
        const votesAmt = post.votes.reduce((acc: number, vote: Votes) => {
          if (vote.type === 'UP') return acc + 1
          if (vote.type === 'DOWN') return acc - 1
          return acc
        }, 0)
        const currentVote = post.votes.find(
          (vote: Votes) => vote.user === user?.user_id
        )
  
        if (index === postItem.results.length - 1 && postIndex === posts.length - 1) {
          // Add a ref to the last post in the list
          return (
            <li key={post.id} ref={ref}>
              <Post
                post={post}
                votesAmt={votesAmt}
                currentVote={currentVote}
              />
            </li>
          )
        } else {
          return (
            <Post
              key={post.id}
              post={post}
              votesAmt={votesAmt}
              currentVote={currentVote}
            />
          )
        }
      }))}
      {isFetchingNextPage && (
        <li className='flex justify-center'>
          <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
        </li>
      )}
    </ul>
  );
};           

export default PostFeed;

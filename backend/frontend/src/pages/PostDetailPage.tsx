import { buttonVariants } from '@/components/ui/Button';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import EditorOutput from '@/components/EditorOutput';
import { formatTimeToNow } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'
import { useParams, Link } from 'react-router-dom';
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import PostVote from '@/components/PostVote';
import { useQuery } from '@tanstack/react-query';
import { getCsrfToken } from '@/lib/utils';
import axios from 'axios';
import { Post } from '@/types/post'
import CommentsSection from '@/components/CommentsSection';


const PostDetailPage = () => {
    const { id } = useParams();
    const userLogin = useSelector((state: RootState) => state.userInfo);
    const { user } = userLogin;

    const queryKey = ['postDetail'];
    const { data: post } = useQuery<Post>({
      queryKey: queryKey,
      queryFn: async () => {
        const config = {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-csrftoken": getCsrfToken()
          },
        }
        const response = await axios.get(`/api/post-detail/${id}/`, config);
        const res = await response.data
        return res;
      },
    });

    const votesAmt = post?.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') return acc + 1
      if (vote.type === 'DOWN') return acc - 1
      return acc
      }, 0)

      const currentVote = post?.votes.find(
        (vote) => vote.user === user?.user_id
      )

    if (!post) {
      return <div>Loading...</div>;
    }

  return (
    <div className='sm:container max-w-7xl mx-auto h-full py-12 my-7'>
        <Link
          to='/'
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'self-start -mt-22'
          )}>
          <ChevronLeft className='mr-2 h-4 w-4' />
          Home
        </Link>
        <div className='h-full flex flex-col sm:flex-row align items-center sm:items-start justify-between mt-1'>
          <Suspense fallback={<PostVoteShell />}>
            <PostVote
              postId={post?.id}
              initialVotesAmt={votesAmt}
              initialVote={currentVote?.type}
            />
          </Suspense>

        <div className='sm:w-0 w-full flex-1 bg-white p-4 rounded-sm'>
         <p className='max-h-40 mt-1 truncate text-xs text-gray-500'>
           Posted by u/{post?.author.username }{' '}
           {post && formatTimeToNow(new Date(post?.created_at))}
         </p>
         <h1 className='text-xl font-semibold py-2 leading-6 text-gray-900'>
           {post?.title}
         </h1>
     
         <EditorOutput content={post?.content} />
         <Suspense
           fallback={
             <Loader2 className='h-5 w-5 animate-spin text-zinc-500' />
           }>
           <CommentsSection post={post} />
         </Suspense>
        </div>
      </div>
    </div>
  );
};

function PostVoteShell() {
    return (
      <div className='flex items-center flex-col pr-6 w-20'>
        {/* upvote */}
        <div className={buttonVariants({ variant: 'ghost' })}>
          <ArrowBigUp className='h-5 w-5 text-zinc-700' />
        </div>
  
        {/* score */}
        <div className='text-center py-2 font-medium text-sm text-zinc-900'>
          <Loader2 className='h-3 w-3 animate-spin' />
        </div>
  
        {/* downvote */}
        <div className={buttonVariants({ variant: 'ghost' })}>
          <ArrowBigDown className='h-5 w-5 text-zinc-700' />
        </div>
      </div>
    )
  }

export default PostDetailPage;

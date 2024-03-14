import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { formatTimeToNow } from "@/lib/utils"
import { MessageSquare } from 'lucide-react'
import { Link } from "react-router-dom"
import { useRef } from "react"
import EditorOutput from './EditorOutput'
import { Post } from '@/types/post'
import PostVote from './PostVote'



const PostFeed = ({ posts, subrabbitName }: { posts: Post[], subrabbitName: string }) => {
  const pRef = useRef<HTMLParagraphElement>(null)
  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { user } = userLogin;

      return (
        <ul className='flex flex-col col-span-2 space-y-6'>
          {posts?.map((post, index) => {

            const votesAmt = post.votes.reduce((acc, vote) => {
              if (vote.type === 'UP') return acc + 1
              if (vote.type === 'DOWN') return acc - 1
              return acc
            }, 0)
    
            const currentVote = post.votes.find(
              (vote) => vote.user === user?.user_id
            )

            return (
              <li key={index}>
                <div className='rounded-md bg-white shadow'>
                    <div className='px-6 py-4 flex justify-between'>
                        <PostVote
                          postId={post.id}
                          initialVotesAmt={votesAmt}
                          initialVote={currentVote?.type}
                        />
                        <div className='w-0 flex-1'>
                          <div className='max-h-40 mt-1 text-xs text-gray-500'>
                            {subrabbitName ? (
                              <>
                                <Link
                                  className='underline text-zinc-900 text-sm underline-offset-2'
                                  to={`/r/${subrabbitName}`}>
                                  r/{subrabbitName}
                                </Link>
                                <span className='px-1'>•</span>
                              </>
                            ) : null}
                            <span>Posted by u/{post.author.username}</span>{' '}
                            {formatTimeToNow(new Date(post.created_at))}
                          </div>
                            <Link to={`/r/${subrabbitName}/post/${post.id}`}>
                              <h1 className='text-lg font-semibold py-2 leading-6 text-gray-900'>
                                {post.title || post.id}
                              </h1>
                            </Link>
                            <div className='relative text-sm max-h-40 w-full overflow-clip' ref={pRef}> 
                              <EditorOutput content={post.content} />
                              {pRef.current?.clientHeight === 160 ? (
                                <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent'>
                                </div>
                              ) : null}
                            </div>
                        </div>
                    </div>
                    <div className='bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6'>
                      <Link
                        to={`/r/${subrabbitName}/post/${post.id}`}
                        className='w-fit flex items-center gap-2'>
                        <MessageSquare className='h-4 w-4' /> 
                        {post?.comments.length} comment{post?.comments.length > 1 && 's'}
                      </Link>
                     </div>
                </div>
              </li>
            )
          })}
        </ul>
      )
    }              


export default PostFeed

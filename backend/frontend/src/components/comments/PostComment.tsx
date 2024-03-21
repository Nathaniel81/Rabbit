import { useOnClickOutside } from '@/hooks/use-on-click-outside'
import { formatTimeToNow } from '@/lib/utils'
import { CommentRequest } from '@/lib/validators/comment'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { MessageSquare } from 'lucide-react'
import { useRef, useState } from 'react'
import { Label } from '../ui/Label'
import { Textarea } from '../ui/Textarea'

import { useToast } from '@/hooks/useToast'
import { getCsrfToken } from '@/lib/utils'
import { openModal } from '@/redux/slices/modalSlice'
import { AppDispatch, RootState } from '@/redux/store'
import { Comment, Votes } from '@/types/post'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Icons } from '../Icons'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { Button } from '../ui/Button'
import CommentVotes from './CommentVotes'

interface PostCommentProps {
    comment: Comment
    votesAmt: number
    currentVote?: Votes | undefined
    postId?: string | undefined | null
}

const PostComment = ({
  comment,
  votesAmt,
  currentVote,
  postId,
}: PostCommentProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [input, setInput] = useState<string>('');
  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { user } = userLogin;
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const commentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ['postDetail'];

  useOnClickOutside(commentRef, () => {
    setIsReplying(false)
  })

  const { mutate: postComment, isPending } = useMutation({
    mutationFn: async ({ postId, content, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, content, replyToId }
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
       }
       try {
         const { data } = await axios.post(
           `/api/subrabbit/post/comment/`,
           payload,
           config
         )
         return data
       } catch (err) {
        console.log(err)
       }
    },

    onError: () => {
      return toast({
        title: 'Something went wrong.',
        description: "Comment wasn't created successfully. Please try again.",
        variant: 'destructive',
      })
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKey, exact: true })
        setInput('')
        setIsReplying(false)
      },
  })

  useEffect(() => {
    if (isReplying && comment.parent_comment) {
      setInput(`@${comment.parent_comment.author.username} `);
    }
  }, [isReplying, comment.parent_comment]);

  return (
    <div ref={commentRef} className='flex flex-col'>
      <div className='flex items-center'>
          <Avatar>
              {user?.profile_picture ? (
                <div className='relative aspect-square h-full w-full'>
                  <img
                    src={user?.profile_picture}
                    alt='profile picture'
                    referrerPolicy='no-referrer'
                    className='h-full object-cover'
                  />
                </div>
              ) : (
                <AvatarFallback>
                  <span className='sr-only'>{user?.username}</span>
                  <Icons.user className='h-4 w-4' />
                </AvatarFallback>
              )}
          </Avatar>
          <div className='ml-2 flex items-center gap-x-2'>
            <p className='text-sm font-medium text-gray-900'>u/{comment.author.username}</p>
  
            <p className='max-h-40 truncate text-xs text-zinc-500'>
              {formatTimeToNow(new Date(comment.created_at))}
            </p>
          </div>
        </div>
        <p className='text-sm text-zinc-900 mt-2'>
          {comment.content}
        </p>
          <div className='flex gap-2 items-center'>
              <CommentVotes
                commentId={comment.id}
                votesAmt={votesAmt}
                currentVote={currentVote}
              />
              <Button
                onClick={() => {
                  if (!user) {
                    dispatch(openModal('signin'))
                  } else {
                    setIsReplying(true)
                  }
                }}
                variant='ghost'
                size='xs'>
                <MessageSquare className='h-4 w-4 mr-1.5' />
                Reply
              </Button>
            </div>

            {isReplying ? (
                <div className='grid w-full gap-1.5'>
                  <Label htmlFor='comment'>Your comment</Label>
                  <div className='mt-2'>
                    <Textarea
                      onFocus={(e) =>
                        e.currentTarget.setSelectionRange(
                          e.currentTarget.value.length,
                          e.currentTarget.value.length
                        )
                      }
                      autoFocus
                      id='comment'
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows={1}
                      placeholder='What are your thoughts?'
                    />

                    <div className='mt-2 flex justify-end gap-2'>
                      <Button
                        tabIndex={-1}
                        variant='subtle'
                        onClick={() => setIsReplying(false)}>
                        Cancel
                      </Button>
                      <Button
                        isLoading={isPending}
                        onClick={() => {
                          if (!input) return
                          postComment({
                            postId: postId || '',
                            content: input,
                            replyToId: comment.parent_comment?.id ?? comment.id,
                          })
                        }}>
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
      ) : null}
    </div>
  )
}

export default PostComment
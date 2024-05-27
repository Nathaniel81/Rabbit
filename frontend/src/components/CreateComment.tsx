import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { getCsrfToken } from '@/lib/utils'
import { CommentRequest } from '@/lib/validators/comment'
import axios, { AxiosError } from 'axios'
import { FC, useState } from 'react'
import { Label } from './ui/Label'
import { Textarea } from './ui/Textarea'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { openModal } from '@/redux/state'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'

interface CreateCommentProps {
  postId: string
  replyToId?: string
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const queryKey = [`postDetail ${postId}`];

  const { toast } = useToast();
  const [input, setInput] = useState<string>('');

  const { mutate: comment, isPending } = useMutation({
    mutationFn: async ({ postId, content, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, content, replyToId }
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
      }

      const { data } = await axios.post(
        `/api/subrabbit/post/comment/`, payload, config)
      return data
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          dispatch(openModal('signin'));
          return toast({
            title: 'Login Required',
            description: 'Please login or create an account.',
            variant: 'destructive',
          });
        }
      }

      return toast({
        title: 'Something went wrong.',
        description: "Comment wasn't created successfully. Please try again.",
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      setInput('')
      queryClient.invalidateQueries({ queryKey: queryKey, exact: true })
    },
  })

  return (
    <div className='grid w-full gap-1.5'>
      <Label htmlFor='comment'>Your comment</Label>
      <div className='mt-2'>
        <Textarea
          id='comment'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder='What are your thoughts?'
        />

        <div className='mt-2 flex justify-end'>
          <Button
            isLoading={isPending}
            disabled={input.length === 0 || isPending}
            onClick={() => comment({ postId, content: input, replyToId })}>
            Post
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateComment

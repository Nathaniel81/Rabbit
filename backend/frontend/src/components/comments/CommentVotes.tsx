import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils'
import { CommentVoteRequest } from '@/lib/validators/vote';
import { usePrevious } from '@mantine/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { FC, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store'
import { openModal } from '@/redux/slices/modalSlice';
import { getCsrfToken } from '@/lib/utils';

// type PartialVote = Pick<CommentVote, 'type'>

interface CommentVotesProps {
  commentId: string
  votesAmt: number
  currentVote?: VoteType
}

enum VoteType {
    UP = 'UP',
    DOWN = 'DOWN'
  }


const CommentVotes: FC<CommentVotesProps> = ({
  commentId,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
}) => {
//   const postDetails = useSelector((state: RootState) => state.postDetail);
//   const { post } = postDetails;

//   const userLogin = useSelector((state: RootState) => state.userLogin);
//   const { userInfo } = userLogin;

  const dispatch = useDispatch<AppDispatch>();
  const [votesAmt, setVotesAmt] = useState<number>(_votesAmt)
  const [currentVote, setCurrentVote] = useState(_currentVote)
  const prevVote = usePrevious(currentVote)
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ['postDetail'];

  const { mutate: vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: CommentVoteRequest = {
        voteType: type,
        commentId,
      }
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
      }
      await axios.patch('/api/subrabbit/post/comment/vote/', payload, config)
    },
    onError: (err, voteType) => {
      if (voteType === 'UP') setVotesAmt((prev) => prev - 1)
      else setVotesAmt((prev) => prev + 1)

      // reset current vote
      setCurrentVote(prevVote)

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          dispatch(openModal('signin'))
        return toast({
            title: 'Unauthorized',
            description: 'Please Login.',
            variant: 'destructive',
          });
        }
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your vote was not registered. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKey, exact: true })
      },
    onMutate: (type: VoteType) => {
      if (currentVote?.type === type) {
        // User is voting the same way again, so remove their vote
        setCurrentVote(undefined)
        if (type === 'UP') setVotesAmt((prev) => prev - 1)
        else if (type === 'DOWN') setVotesAmt((prev) => prev + 1)
      } else {
        // User is voting in the opposite direction, so subtract 2
        setCurrentVote({ type })
        if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
        else if (type === 'DOWN')
          setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
      }
    },
  })

  return (
    <div className='flex gap-1'>
      {/* upvote */}
      <Button
        onClick={() => vote('UP')}
        size='xs'
        variant='ghost'
        aria-label='upvote'>
        <ArrowBigUp
          className={cn('h-5 w-5 text-zinc-700', {
            'text-emerald-500 fill-emerald-500': currentVote?.type === 'UP',
          })}
        />
      </Button>

      {/* score */}
      <p className='text-center py-2 px-1 font-medium text-xs text-zinc-900'>
        {votesAmt}
      </p>

      {/* downvote */}
      <Button
        onClick={() => vote('DOWN')}
        size='xs'
        className={cn({
          'text-emerald-500': currentVote?.type === 'DOWN',
        })}
        variant='ghost'
        aria-label='downvote'>
        <ArrowBigDown
          className={cn('h-5 w-5 text-zinc-700', {
            'text-red-500 fill-red-500': currentVote?.type === 'DOWN',
          })}
        />
      </Button>
    </div>
  )
}

export default CommentVotes

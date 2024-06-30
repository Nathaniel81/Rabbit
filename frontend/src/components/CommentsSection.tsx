import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Comment } from '@/types/post';
import PostComment from './comments/PostComment';
import CreateComment from './CreateComment';
import { FC } from 'react';
import { useParams } from 'react-router-dom';

type CommentsSectionProps = {
  comments?: Comment[];
};

const CommentsSection: FC<CommentsSectionProps> = ({ comments }) => {
  const { id } = useParams();
  const user = useSelector((state: RootState) => state.user);

  const renderComments = (commentList: Comment[], parentId: string | null = null) => {
    return commentList
      .filter((comment) => comment.parent_comment_id === parentId)
      .sort((a, b) => b.comment_votes.length - a.comment_votes.length)
      .map((comment) => {
        const votesAmt = comment.comment_votes.reduce((acc, vote) => {
          if (vote.type === 'UP') return acc + 1;
          if (vote.type === 'DOWN') return acc - 1;
          return acc;
        }, 0);
        const currentVote = comment.comment_votes.find(
          (vote) => vote.user === user?.user_id
        );

        return (
          <div key={comment.id} className='flex flex-col'>
            <PostComment
              comment={comment}
              currentVote={currentVote}
              votesAmt={votesAmt}
              postId={id}
            />
            <div className='ml-2 py-2 pl-4 border-l-2 border-zinc-200'>
              {renderComments(commentList, comment.id)}
            </div>
          </div>
        );
      });
  };

  return (
    <div className='flex flex-col gap-y-4 mt-4'>
      <hr className='w-full h-px my-6' />
      {id && <CreateComment postId={id} />}
      <div className='flex flex-col gap-y-6 mt-4'>
        {renderComments(comments || [])}
      </div>
    </div>
  );
};

export default CommentsSection;

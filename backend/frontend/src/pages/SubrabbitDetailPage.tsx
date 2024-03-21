import { Icons } from '@/components/Icons';
import SubrabbitActionPanel from '@/components/SubrabbitActionPanel';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RootState } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Image as ImageIcon, Link2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PostFeed from '@/components/PostFeed';
import { getCsrfToken } from '@/lib/utils';


const SubrabbitDetailPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const { slug } = useParams();

  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { user } = userLogin;

  const queryKey = ['subrabbitDetail'];
  const { data: subrabbit } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
      }
      const response = await axios.get(`/api/subrabbit/${slug}/`, config);
      const res = await response.data
      return res;
    },
  });


  return (
    <div className='sm:container max-w-7xl mx-auto h-full pt-12'>
      <div>
        {/* Main content */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
          {/* Left column */}
          <ul className='flex flex-col col-span-2 space-y-6'>
            <h1 className='font-bold text-3xl md:text-4xl h-14'>
              r/{slug ?? subrabbit?.name}
            </h1>
            {/* Post input section */}
            <li className='overflow-hidden rounded-md bg-white shadow'>
              <div className='h-full px-6 py-4 flex justify-between gap-6'>
                <div className='relative'>
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
                  <span className='absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white' />
                </div>
                <Input
                  onClick={() => navigate(path + '/submit')}
                  readOnly
                  placeholder='Create post'
                />
                <Button
                  onClick={() => navigate(path + '/submit')}
                  variant='ghost'>
                  <ImageIcon className='text-zinc-600' />
                </Button>
                <Button
                  onClick={() => navigate(path + '/submit')}
                  variant='ghost'>
                  <Link2 className='text-zinc-600' />
                </Button>
              </div>
            </li>
            <PostFeed />
          </ul>
          <div className='overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
            <div className='px-6 py-4'>
              <p className='font-semibold py-3'>About r/{slug}</p>
            </div>
            {/* Subrabbit action panel */}
            <SubrabbitActionPanel />
          </div>
        </div>
      </div>
    </div>
  )
};

export default SubrabbitDetailPage;

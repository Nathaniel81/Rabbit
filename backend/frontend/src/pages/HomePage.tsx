import AuthenticationModal from '@/components/AuthenticationModal';
import PostFeed from '@/components/PostFeed';
import { buttonVariants } from '@/components/ui/Button';
import { getCsrfToken } from '@/lib/utils';
import { RootState } from '@/redux/rootReducer';
import { loginWithGithub } from '@/redux/slices/authSlice';
import { AppDispatch } from '@/redux/store';
import { Subrabbit } from '@/types/subrabbit';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Home as HomeIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Loader from '@/components/Loader';


const HomePage = () => {
  const [searchparams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const code = searchparams.get('code');
  const navigate = useNavigate();

  const modalState = useSelector((state: RootState) => state.modal);
  const { isOpen } = modalState;
  
  useEffect(() => {
    if (code) {
      dispatch(loginWithGithub(code));
      navigate('/');
    }
  }, [code, dispatch, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // If code is present in the URL, redirect to the same URL with hash
      window.location.href = window.location.origin + '/#' + window.location.pathname + window.location.search;
    }
  }, []);

  const queryKey = ['communities'];
  const { data, isPending } = useQuery<Subrabbit[]>({
    queryKey,
    queryFn: async () => {
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken()
        },
      }
      const response = await axios.get(`/api/subrabbits/`, config);
      const res = await response.data;
      return res;
    },
  });

  if (isPending) return <Loader />

  return (
    <div className='sm:container max-w-7xl mx-auto h-full pt-12 mt-6'>
      <div>
        {isOpen && <AuthenticationModal />}
      </div>
      <h1 className='font-bold text-3xl md:text-4xl'>Your feed</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
        <PostFeed />
        {/* subrabbit info */}
        <div className='order-first md:order-last'>
          <div className='overflow-hidden h-fit rounded-lg border border-gray-200'>
            <div className='bg-secondary px-6 py-4'>
              <p className='font-semibold py-3 flex items-center gap-1.5'>
                <HomeIcon className='h-4 w-4' />
                Home
              </p>
            </div>
            <dl className='-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6'>
              <div className='flex justify-between gap-x-4 py-3'>
                <p className='text-zinc-500'>
                  Your personal Rabbit frontpage. Come here to check in with your
                  favorite communities.
                </p>
              </div>
              {/* Create Community link */}
              <Link
                className={buttonVariants({
                  className: 'w-full mt-4 mb-6',
                })}
                to={`/r/create`}>
                Create Community
              </Link>
            </dl>
          </div>
          {/* List of popular communities */}
          <div className="w-full h-fit border flex-col gap-2 rounded-xl py-3 px-2 bg-secondary hidden lg:flex mt-5">
            <p className="px-3 font-semibold">Popular Communities</p>
              <div className="flex flex-col gap-3">
              {data?.map((subrabbit, index) => (
                <Link 
                to={`r/${subrabbit.name}`}
                key={index} 
                className="group flex gap-3 rounded-full px-3 py-1.5 cursor-pointer transition-transform duration-300 hover:bg-gray-100 hover:scale-105 hover:translate-x-1">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-600">{subrabbit?.name}</p>
                    <p className="text-xs text-gray-400">{subrabbit?.members_count} members</p>
                  </div>
                </Link>
              ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage;

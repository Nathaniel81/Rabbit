import { loginWithGithub } from '@/redux/slices/authSlice';
import { AppDispatch } from '@/redux/store';
import { useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux'
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { RootState } from '@/redux/store';
import { buttonVariants } from '@/components/ui/Button';
import { Home as HomeIcon } from 'lucide-react'


const HomePage = () => {
  const [searchparams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const code = searchparams.get('code');
  const navigate = useNavigate();

  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { loading } = userLogin;

  
  useEffect(() => {
    if (code) {
      dispatch(loginWithGithub(code));
      navigate('/')
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

  if (loading) <div className='mt-16'>Loading..</div>

  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl'>Your feed</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
        {/* <Feed /> */}
        <div>1</div>
        
        {/* subreddit info */}
        <div className='overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
          <div className='bg-emerald-100 px-6 py-4'>
            <p className='font-semibold py-3 flex items-center gap-1.5'>
              <HomeIcon className='h-4 w-4' />
              Home
            </p>
          </div>
          <dl className='-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6'>
            <div className='flex justify-between gap-x-4 py-3'>
              <p className='text-zinc-500'>
                Your personal Breadit frontpage. Come here to check in with your
                favorite communities.
              </p>
            </div>

            <Link
              className={buttonVariants({
                className: 'w-full mt-4 mb-6',
              })}
              to={`/r/create`}>
              Create Community
            </Link>
          </dl>
        </div>
      </div>
    </>
  )
}

export default HomePage;

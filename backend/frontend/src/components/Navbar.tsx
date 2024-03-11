import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useToast } from '@/hooks/useToast';
import { resetUserInfo } from '@/redux/slices/authSlice';
import { openModal } from '@/redux/slices/modalSlice';
import { AppDispatch, RootState } from '@/redux/store';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import { Avatar, AvatarFallback } from './ui/Avatar';
import { buttonVariants } from './ui/Button';



const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userLogin = useSelector((state: RootState) => state.userInfo);
  const { user } = userLogin;
  const { toast } = useToast()

  const signIn = () => {
    dispatch(openModal('signin'))
  }

  const logoutHandler = () => {
    axios.post('/api/user/logout/')
      .then(response => {
        console.log('Logged out successfully', response.data);
        localStorage.removeItem('userInfo')
        navigate('/')
        dispatch(resetUserInfo())
      })
      .catch(error => {
        console.error('Logout failed:', error);
        toast({
          title: "Logout Failed",
          description: "There was a problem logging out. Please try again later.",
          variant: 'destructive',
        })
      });
  };


  return (
      <div className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2'>
        <div className='box flex items-center justify-between gap-2'>
          <Link to='/' className='flex gap-2 items-center'>
            <Icons.logo className='h-10 w-10 sm:h-8 sm:w-8' />
            <p className='hidden text-zinc-700 text-sm font-medium md:block'>Rabbit</p>
          </Link>
        <div className="flex justify-between gap-5">
          {/* <SearchBar /> */}
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className='h-8 w-8 '>
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
                </DropdownMenuTrigger>
                <DropdownMenuContent className='bg-white' align='end'>
                  <div className='flex items-center justify-start gap-2 p-2'>
                    <div className='flex flex-col space-y-1 leading-none'>
                      {user?.username && <p className='font-medium'>{user?.username}</p>}
                      {user?.email && (
                        <p className='w-[200px] truncate text-sm text-muted-foreground'>
                          {user?.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to='/'>Feed</Link>
                  </DropdownMenuItem>
          
                  <DropdownMenuItem asChild>
                    <Link to='/r/create'>Create Community</Link>
                  </DropdownMenuItem>
          
                  <DropdownMenuItem asChild>
                    <Link to='/settings'>Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <span onClick={logoutHandler}>
                      Logout
                    </span>
              </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className={`${buttonVariants()} cursor-pointer`}
            onClick={signIn}>
              Sign In
            </div>
          )}
          </div>
        </div>
      </div>
  )
}

export default Navbar

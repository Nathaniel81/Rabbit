import { useQuery } from 'react-query';

interface User {
  id: string,
  email: string,
  profile_picture: string
}

const UsersPage = () => {
    const { isLoading, data } = useQuery<User[]>('users', () =>
    fetch('/api/user/').then(res =>
      res.json()
    )
    );

    // if (error) return 'An error has occurred: ' + error.message;
    console.log(data)

  return (
    <div className='mt-10'>
        {isLoading ? 'Loading...' : (
          <>
            {data?.map((user: User) => (
               <div key={user.id}>
                <h1 key={user.id}>{user.email}</h1>
                <img src={user.profile_picture} className="h-[100px] w-[100px]" />
               </div> 
            ))}
          </>
        )}
    </div>
  )
}

export default UsersPage
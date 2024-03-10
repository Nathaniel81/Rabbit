import { useQuery } from 'react-query';
import axios from 'axios';



interface User {
  id: string,
  email: string,
  profile_picture: string
}

const UsersPage = () => {


  const { isLoading, error, data } = useQuery('users', async () => {
    try {
      const response = await axios.get('/api/user/', {
        // headers: {
        //   'Content-Type': 'application/json',
        //   Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Include your access token here
        // },
        // withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error:', error.message);
      throw error;
    }
  });
  

  console.log(data);
    
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className='mt-10 box'>
      {/* {data && (
        <>
          {data.map((user: User) => (
            <div key={user.id}>
              <h1>{user.email}</h1>
              <img src={user.profile_picture} alt={user.email} className="h-[100px] w-[100px]" />
            </div> 
          ))}
        </>
      )} */}
    </div>
  );
}

export default UsersPage;

// import { useQuery } from 'react-query';
import { Link, useNavigate } from "react-router-dom";
// import { useParams } from 'react-router-dom';
import {useEffect } from 'react'
import { useSearchParams } from "react-router-dom";
import axios from 'axios';

interface Rabbit {
  id: string,
  name: string
}



function HomePage() {
  const [searchparams] = useSearchParams();
  const navigate = useNavigate();
  
  const code =searchparams.get('code')
  console.log('Code: ', code)

  const send_github__code_to_server = async () => {  

    if (searchparams) {
        try {
        const urlparam = searchparams.get('code')
        const resp = await axios.post('/api/user/auth/github/', {'code':urlparam})
        const result = resp.data

        console.log('server res: ', result)

        if (resp.status===200) {
            const user ={
            'email':result.email,
            'username':result.username
            }
            localStorage.setItem('user', JSON.stringify(user))
            navigate('/')
        }

      } catch (error) {
        if (error.response) {
            console.log(error.response.data);
          } 
        }  
      }
    }

  
  useEffect(() => {
    console.log('Effect')
    if (code) {
      console.log('Code')

       send_github__code_to_server()  
    }   
  }, [code])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // If code is present in the URL, redirect to the same URL with hash
      window.location.href = window.location.origin + '/#' + window.location.pathname + window.location.search;
    }
  }, []);


  
  return (
    <>
      <div className='mt-20 box'>
        {/* {isLoading ? 'Loading...' : (
          <>
            {data?.map((rabbit: Rabbit) => (
              <h1 key={rabbit.id}>{rabbit.name}</h1>
            ))}
          </>
        )} */}
        <div>
          <Link to='/users'>
            Users
          </Link>
        </div>
      </div>
    </>
  );
}

export default HomePage;

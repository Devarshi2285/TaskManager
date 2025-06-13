import { useNavigate } from 'react-router-dom';

const customFetch = async (url, bodyObj) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(url, {
            method: bodyObj ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: bodyObj ? JSON.stringify(bodyObj) : null
        });

        if (res.status === 200) {
            const data = await res.json();
            return { data, status: 200 };
        } else if (res.status === 401) {
            const refreshtoken = localStorage.getItem('refreshtoken');
            const newResponse = await fetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshtoken }),
            });

            if (newResponse.status === 200) {
                const data = await newResponse.json();
                localStorage.setItem('token', data.newAccessToken);

                const retryResponse = await fetch(url, {
                    method: bodyObj ? 'POST' : 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: bodyObj ? JSON.stringify(bodyObj) : null
                });

                if (retryResponse.status === 200) {
                    const retryData = await retryResponse.json();
                    return { data: retryData, status: 200 };
                } else {
                    return { data: await retryResponse.json(), status: retryResponse.status };
                }
            } else if (newResponse.status === 401) {
                const data = await newResponse.json();

                localStorage.removeItem('token');
                localStorage.removeItem('refreshtoken');
                const navigate = useNavigate();
                navigate('/login');
                return { data: null, status: 401 };
            }
        } else {
            return { data: await res.json(), status: res.status };
        }
    } catch (err) {
        console.error(err);
        return { data: err, status: 401 };
    }
};

export default customFetch;

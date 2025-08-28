import React, { useState } from 'react';

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const handleLogin = () => {
    document.cookie = `rememberMe=${rememberMe}; path=/;`;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
      redirect_uri: 'http://localhost:3000/v1/linkedin/callback',
      scope: 'openid email profile',
    });

    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  };
  return (
    <div>
      <h1>LinkedIn Login</h1>
      <div>
        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember Me
      </div>
      <button onClick={handleLogin}>Sign In With LinkedIn</button>
    </div>
  );
};

export default Login;

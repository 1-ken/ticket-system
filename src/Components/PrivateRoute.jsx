import React from 'react'
import { Navigate, Outlet } from 'react-router';
import { useAuthstatus } from '../hooks/useAuthstatus';
import ReactLoading from "react-loading"

export default function PrivateRoute() {
  const { loggedIn, checkingStatus } = useAuthstatus();
  if (checkingStatus) {
    return <div className='h-screen w-screen items-center justify-center flex flex-row' >
      <ReactLoading type={"spin"} color={"blue"} height={100} width={100} />
    </div>
  }
  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
}

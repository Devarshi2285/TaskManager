import React from "react";
import Header from "./Header";
import {Outlet} from 'react-router-dom'

function Layout(){
    return(
        <>
           
           <Header></Header>
           <Outlet></Outlet>
        </>
    )
}

export default Layout
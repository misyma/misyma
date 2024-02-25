import React from "react";
import { useStoreSelector } from "../../store/hooks/useStoreSelector.js";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { userStateSelectors } from "../../store/states/userState/userStateSlice.js";


export function RequireAuth(): React.ReactNode {
    const currentUserTokens = useStoreSelector(
        userStateSelectors.selectCurrentUserTokens
    );

    const location = useLocation();

    return (
        currentUserTokens.accessToken && currentUserTokens.refreshToken ? 
        <Outlet />
        : <Navigate to='/login' state={{ from: location.pathname }} />
    )
}
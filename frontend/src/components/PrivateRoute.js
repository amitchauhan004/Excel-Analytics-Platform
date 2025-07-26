import React from "react";
import { Route, Redirect } from "react-router-dom";

const PrivateRoute = ({ component: Component, role, ...rest }) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          role && user?.role !== role ? (
            <Redirect to={user?.role === "admin" ? "/admin" : "/dashboard"} />
          ) : (
            <Component {...props} />
          )
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
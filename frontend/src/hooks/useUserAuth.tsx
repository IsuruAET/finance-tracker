import { useEffect, useRef } from "react";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const useUserAuth = () => {
  const { user, updateUser, clearUser, setIsLoading } = useUserContext();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // If no token, user can't be authenticated
    if (!token) {
      if (user) {
        clearUser();
      }
      hasFetched.current = false; // Reset for future checks
      setIsLoading(false);
      return;
    }

    // If user already exists, no need to fetch
    if (user) {
      setIsLoading(false);
      return;
    }

    // If token exists but no user, fetch user data
    if (!hasFetched.current) {
      hasFetched.current = true;
      setIsLoading(true);
      axiosInstance
        .get(API_PATHS.AUTH.GET_USER_INFO)
        .then((res) => {
          updateUser(res.data);
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          clearUser();
          hasFetched.current = false; // Reset on error
          setIsLoading(false);
          navigate("/login");
        });
    }
  }, [clearUser, navigate, updateUser, user, setIsLoading]);
};

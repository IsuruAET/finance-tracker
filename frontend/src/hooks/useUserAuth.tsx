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
    if (token && !user && !hasFetched.current) {
      hasFetched.current = true;
      setIsLoading(true);
      axiosInstance
        .get(API_PATHS.AUTH.GET_USER_INFO)
        .then((res) => {
          updateUser(res.data);
          setIsLoading(false);
        })
        .catch(() => {
          clearUser();
          setIsLoading(false);
          navigate("/login");
        });
    } else {
      setIsLoading(false);
    }
  }, [clearUser, navigate, updateUser, user, setIsLoading]);
};

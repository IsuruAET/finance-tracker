import { useNavigate } from "react-router-dom";
import notFoundImage from "../assets/images/not-found.svg";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full text-center">
        <img
          src={notFoundImage}
          alt="Page not found"
          className="w-full max-w-[600px] mx-auto mb-8"
        />
        <div className="mt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist.
          </p>

          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

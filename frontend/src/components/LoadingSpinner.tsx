import loading from "../assets/images/loading.svg";

const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <img src={loading} alt="Loading" />
    </div>
  );
};

export default LoadingSpinner;

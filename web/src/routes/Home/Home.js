import OsuAuthorizationButton from "../../components/OsuAuthorizationButton";

const Home = () => {

  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.has("code")) {
    const code = searchParams.get("code");
  }

  return (
    <div>
      <OsuAuthorizationButton />
    </div>
  )
};

export default Home;

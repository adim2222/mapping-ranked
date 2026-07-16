const OsuAuthorizationButton = () => {

  const authorizeOsu = async () => {

    const url = new URL(
      "https://osu.ppy.sh/oauth/authorize"
    );

    const params = {
      "client_id": "",
      "redirect_uri": "http://localhost:3000/",
      "response_type": "code",
      "scope": "public identify",
      "state": "randomval",
    };

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    window.location.href = url;

  };

  return (
  <button className="osu-auth-btn" onClick={authorizeOsu}>
  Login
  </button>
  )
};

export default OsuAuthorizationButton;

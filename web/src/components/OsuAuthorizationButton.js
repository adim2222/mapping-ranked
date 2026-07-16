const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5047";

const OsuAuthorizationButton = () => {

  const authorizeOsu = async () => {
    try {
      const stateResponse = await fetch(`${API_URL}/auth/state`);
      if (!stateResponse.ok) throw new Error("Failed to get auth state");
      const { state } = await stateResponse.json();

      const url = new URL("https://osu.ppy.sh/oauth/authorize");

      const params = {
        "client_id": process.env.REACT_APP_OSU_CLIENT_ID || "61252",
        "redirect_uri": process.env.REACT_APP_OSU_REDIRECT_URI || "http://localhost:3000/",
        "response_type": "code",
        "scope": "public identify",
        "state": state,
      };

      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      window.location.href = url;
    } catch (err) {
      console.error("Auth initiation failed:", err);
      alert("Failed to start login. Please try again.");
    }
  };

  return (
    <button onClick={authorizeOsu}>Login with osu!</button>
  )
};

export default OsuAuthorizationButton;

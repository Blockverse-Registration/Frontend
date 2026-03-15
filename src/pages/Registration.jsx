import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import PlayerForm from "../components/PlayerForm";
import {
  createOrder,
  verifyPayment,
  registerTeam
} from "../services/api";

export default function Registration() {
  const navigate = useNavigate();

  const registrationEnd = new Date("2026-03-24");
  if (new Date() > registrationEnd) {
    return (
      <div className="container">
        <h2>Registration Closed</h2>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    teamId: "",
    team_type: "solo",
    password: "",
    player1: {
      name: "",
      student_no: "",
      email: "",
      year: "",
      gender: "",
      branch: "",
      residence: ""
    },
    player2: {
      name: "",
      student_no: "",
      email: "",
      year: "",
      gender: "",
      branch: "",
      residence: ""
    }
  });

  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  const ATTEMPT_LIMIT = 3;
  const LOCK_TIME = 10 * 60 * 1000;

  const getAttemptData = () => {
    try {
      const data = JSON.parse(localStorage.getItem("attemptData"));
      return data || { count: 0, lockUntil: null };
    } catch {
      return { count: 0, lockUntil: null };
    }
  };

  const updateAttemptData = (count, lockUntil = null) => {
    localStorage.setItem(
      "attemptData",
      JSON.stringify({ count, lockUntil })
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const attemptData = getAttemptData();
      if (attemptData.lockUntil) {
        const remaining = attemptData.lockUntil - Date.now();
        if (remaining > 0) {
          setLockRemaining(Math.ceil(remaining / 1000));
        } else {
          localStorage.removeItem("attemptData");
          setLockRemaining(0);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () =>
      document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  useEffect(() => {
    const token = crypto.randomUUID();
    sessionStorage.setItem("session_token", token);
  }, []);

  const handleChange = (e, playerKey = null) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/<[^>]*>?/gm, "");

    if (playerKey) {
      setFormData((prev) => ({
        ...prev,
        [playerKey]: {
          ...prev[playerKey],
          [name]: cleanValue
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: cleanValue
      }));
    }
  };
  const validatePlayer = (player) => {

    if (player.year === "1" && !player.student_no.startsWith("25")) {
      alert("First year student number must start with 25.");
      return false;
    }

    if (player.year === "2" && !player.student_no.startsWith("24")) {
      alert("Second year student number must start with 24.");
      return false;
    }

    const firstName = player.name.trim().split(" ")[0].toLowerCase();
    const expectedEmail = `${firstName}${player.student_no}@akgec.ac.in`;

    if (player.email.toLowerCase() !== expectedEmail) {
      alert(`Email must be in format: ${expectedEmail}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || lockRemaining > 0) return;

    setIsSubmitting(true);

    if (!captchaToken && !captchaError && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
      alert("Complete CAPTCHA.");
      setIsSubmitting(false);
      return;
    }
    if (!validatePlayer(formData.player1)) {
      setIsSubmitting(false);
      return;
    }

    if (formData.team_type === "duo") {
      if (!validatePlayer(formData.player2)) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const order = await createOrder({
        team_type: formData.team_type
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "BlockVerse",
        description: "Team Registration",
        order_id: order.id,

        handler: async function (response) {
          const verifyRes = await verifyPayment(response);

          if (!verifyRes.success) {
            alert("Payment verification failed.");
            setIsSubmitting(false);
            return;
          }

          const payload =
            formData.team_type === "solo"
              ? {
                  teamId: formData.teamId,
                  team_type: formData.team_type,
                  player1: formData.player1,
                  password: formData.password,
                  paymentId: verifyRes.paymentId,
                  captchaToken
                }
              : {
                  ...formData,
                  paymentId: verifyRes.paymentId,
                  captchaToken
                };

          const result = await registerTeam(payload);

          if (result.success) {
            localStorage.removeItem("attemptData");
            setLockRemaining(0);
            navigate("/success");
          } else {
            alert(result.message || "Registration failed.");
          }

          setIsSubmitting(false);
        },

        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      alert(error.message || "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="page-wrapper">
      <div className="info-section">
        <div className="tech-bg"></div>
        <div className="content-wrapper">
          <h1 className="event-title">BLOCKVERSE '26</h1>
          <p className="event-subtitle">Blockchain Research Lab Presents</p>

          <div className="event-details">
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">22–24 March</span>
            </div>
            <div className="detail-item">
              <span className="label">Team Size:</span>
              <span className="value">1–2 members</span>
            </div>
            <div className="detail-item">
              <span className="label">Venue:</span>
              <span className="value">CSIT Block</span>
            </div>
          </div>

          <div className="highlights">
            <h3>HIGHLIGHTS</h3>
            <div className="chips-container">
              <span className="chip">Cash Prizes</span>
              <span className="chip">Certificates</span>
              <span className="chip">Goodies</span>
            </div>
          </div>

          <div className="prize-pool">
            <h3>PRIZE POOL</h3>
            <div className="prize-value">₹6,000</div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="stars-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className={`star star-${i + 1}`}></div>
          ))}
        </div>
        <div className="container">
          <h2>Registration</h2>

          {lockRemaining > 0 && (
            <div
              className="lock-banner"
            >
              Too many failed attempts. Try again in {formatTime(lockRemaining)}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="website"
              style={{ display: "none" }}
              autoComplete="off"
            />

            <input
              type="text"
              name="teamId"
              placeholder="Team ID"
              value={formData.teamId}
              onChange={handleChange}
              required
              disabled={lockRemaining > 0}
            />

            <select
              name="team_type"
              value={formData.team_type}
              onChange={handleChange}
              disabled={lockRemaining > 0}
            >
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
            </select>

            <div className="player-forms-container">
              <div className="player-block">
                <h3>PLAYER 1</h3>
                <PlayerForm
                  playerData={formData.player1}
                  handleChange={handleChange}
                  playerKey="player1"
                />
              </div>

              {formData.team_type === "duo" && (
                <div className="player-block">
                  <h3>PLAYER 2</h3>
                  <PlayerForm
                    playerData={formData.player2}
                    handleChange={handleChange}
                    playerKey="player2"
                  />
                </div>
              )}
            </div>

            <input
              type="password"
              name="password"
              placeholder="Strong Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={lockRemaining > 0}
            />

            <div className="captcha-wrapper">
              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && !captchaError ? (
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  onErrored={() => setCaptchaError(true)}
                />
              ) : (
                <div className="captcha-error">
                  {captchaError
                    ? "ReCAPTCHA failed to load. You may continue without it."
                    : "ReCAPTCHA site key is missing. You may continue without it."}
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting || lockRemaining > 0}>
              {isSubmitting ? "Processing Payment..." : "Pay & Register"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

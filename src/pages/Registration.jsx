import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import PlayerForm from "../components/PlayerForm";
import posterImg from "../assets/poster.png";
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

  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("session_token", token);
  }, []);

  const handleChange = (e, playerKey = null) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/<[^>]*>?/gm, "");

    if (playerKey) {
      setFormData((prev) => {
        const updatedPlayer = {
          ...prev[playerKey],
          [name]: cleanValue
        };

        // Auto-calculate email and branch if name or student_no changes
        if (name === "name" || name === "student_no") {
          const firstName = updatedPlayer.name.trim().split(" ")[0].toLowerCase();
          const studentNo = updatedPlayer.student_no.trim();
          
          // Auto Email
          if (firstName && studentNo) {
            updatedPlayer.email = `${firstName}${studentNo}@akgec.ac.in`;
          } else {
            updatedPlayer.email = "";
          }
        }

        return {
          ...prev,
          [playerKey]: updatedPlayer
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: cleanValue
      }));
    }
  };
  const validatePlayer = (player, playerKey) => {
    let playerErrors = {};

    if (player.year === "1st Year" && !player.student_no.startsWith("25")) {
      playerErrors.student_no = "1st year student number must start with 25.";
    }

    if (player.year === "2nd Year" && !player.student_no.startsWith("24")) {
      playerErrors.student_no = "2nd year student number must start with 24.";
    }

    const studentNoTrimmed = player.student_no.trim();
    if (player.student_no.trim().length < 6 || player.student_no.trim().length > 8) {
      playerErrors.student_no = (playerErrors.student_no ? playerErrors.student_no + " " : "") + "Student number must be 6-8 digits.";
    }

    // Branch to Student Number Validation
    if (player.branch && player.student_no.length >= 4) {
      const studentNo = player.student_no.trim();
      const code3 = studentNo.substring(2, 5);
      const code2 = studentNo.substring(2, 4);

      const branchToCodes = {
        "CSE(DS)": ["154"],
        "CSE(AIML)": ["153"],
        "CSEH": ["169"],
        "AIML": ["164"],
        "CSE": ["10"],
        "CSIT": ["11"],
        "CS": ["12"],
        "IT": ["13"],
        "ECE": ["31"],
        "ME": ["40"],
        "Civil": ["00"],
        "EN": ["21"]
      };

      const validCodes = branchToCodes[player.branch] || [];
      const isValid = validCodes.some(code => 
        (code.length === 3 && code === code3) || (code.length === 2 && code === code2)
      );

      if (!isValid) {
        playerErrors.branch = "Selected branch does not match the student number code.";
      }
    }

    const firstName = player.name.trim().split(" ")[0].toLowerCase();
    const expectedEmail = `${firstName}${player.student_no}@akgec.ac.in`;

    if (player.email.toLowerCase() !== expectedEmail) {
      playerErrors.email = `Email must be: ${expectedEmail}`;
    }

    if (Object.keys(playerErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        [playerKey]: playerErrors
      }));
      return false;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[playerKey];
      return newErrors;
    });
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || lockRemaining > 0) return;

    setIsSubmitting(true);

    if (!recaptchaToken && !recaptchaError && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
      setIsSubmitting(false);
      alert("Complete CAPTCHA.");
      return;
    }

    setErrors({});

    const isP1Valid = validatePlayer(formData.player1, "player1");
    let isP2Valid = true;

    if (formData.team_type === "duo") {
      isP2Valid = validatePlayer(formData.player2, "player2");

      if (formData.player1.year !== formData.player2.year) {
        setErrors((prev) => ({
          ...prev,
          player2: {
            ...prev.player2,
            year: "Both players must be from the same year."
          }
        }));
        isP2Valid = false;
      }

      if (formData.player1.student_no === formData.player2.student_no && formData.player1.student_no !== "") {
        setErrors((prev) => ({
          ...prev,
          player2: {
            ...(prev.player2 || {}),
            student_no: "Student numbers must be different."
          }
        }));
        isP2Valid = false;
      }
    }

    if (!isP1Valid || !isP2Valid) {
      setIsSubmitting(false);
      return;
    }

    const teamNameRegex = /^[a-zA-Z0-9 ]{3,20}$/;
    if (!teamNameRegex.test(formData.teamId)) {
      setErrors((prev) => ({
        ...prev,
        teamId: "Team Name must be 3-20 alphanumeric characters."
      }));
      setIsSubmitting(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      }));
      setIsSubmitting(false);
      return;
    }

    try {
      /* Commenting out Razorpay logic
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
                  recaptchaToken
                }
              : {
                  ...formData,
                  paymentId: verifyRes.paymentId,
                  recaptchaToken
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
      */

      // Direct registration without payment
      const payload =
        formData.team_type === "solo"
          ? {
              teamId: formData.teamId,
              team_type: formData.team_type,
              player1: formData.player1,
              password: formData.password,
              // paymentId: "OFFLINE_PAYMENT", // Dummy ID since payment is skipped
              recaptchaToken
            }
          : {
              ...formData,
              // paymentId: "OFFLINE_PAYMENT",
              recaptchaToken
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
      <div className="info-section" style={{ backgroundImage: `linear-gradient(rgba(3, 7, 18, 0.8), rgba(3, 7, 18, 0.9)), url(${posterImg})` }}>
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
            <div className="detail-item registration-fee">
              <span className="label">Fee:</span>
              <span className="value">₹100 (Solo) / ₹150 (Duo)</span>
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

            <div className="segmented-selector">
              <div 
                className={`selector-option ${formData.team_type === 'solo' ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'team_type', value: 'solo' } })}
              >
                <div className="option-content">
                  <svg className="selector-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Solo</span>
                </div>
                <div className="selector-price">₹100</div>
              </div>

              <div 
                className={`selector-option ${formData.team_type === 'duo' ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'team_type', value: 'duo' } })}
              >
                <div className="option-content">
                  <svg className="selector-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Duo</span>
                </div>
                <div className="selector-price">₹150</div>
              </div>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="teamId"
                placeholder="Team Name"
                value={formData.teamId}
                onChange={handleChange}
                required
                disabled={lockRemaining > 0}
              />
              {errors.teamId && <span className="error-message">{errors.teamId}</span>}
            </div>

            <div className="player-forms-container">
              <div className="player-block">
                <h3>PLAYER 1</h3>
                <PlayerForm
                  playerData={formData.player1}
                  handleChange={handleChange}
                  playerKey="player1"
                  errors={errors.player1 || {}}
                />
              </div>

              {formData.team_type === "duo" && (
                <div className="player-block">
                  <h3>PLAYER 2</h3>
                  <PlayerForm
                    playerData={formData.player2}
                    handleChange={handleChange}
                    playerKey="player2"
                    errors={errors.player2 || {}}
                  />
                </div>
              )}
            </div>

            <div className="input-group">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Strong Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={lockRemaining > 0}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={lockRemaining > 0}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="captcha-wrapper">
              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && !recaptchaError ? (
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setRecaptchaToken(token)}
                  onErrored={() => setRecaptchaError(true)}
                />
              ) : (
                <div className="captcha-error">
                  {recaptchaError   
                    ? "ReCAPTCHA failed to load. You may continue without it."
                    : "ReCAPTCHA site key is missing. You may continue without it."}
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting || lockRemaining > 0}>
              {isSubmitting ? "Registering..." : "Register Now"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

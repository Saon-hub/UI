import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = (event) => {
        event.preventDefault();

        // Dummy login
        if (!username || !password) {
            alert("Please enter username and password.");
            return;
        }

        navigate("/migration");
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <h1>Data Migration</h1>

                <p className="login-subtitle">
                    Sign in to continue
                </p>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Login
                    </button>

                </form>

            </div>
        </div>
    );
}

export default Login;
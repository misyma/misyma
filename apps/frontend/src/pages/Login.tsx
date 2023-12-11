import React, { useState } from "react";
import { z } from "zod";

const emailSchema = z.string().email();

const passwordSchema = z.string().min(8, 'Password too short - 8 characters required.');

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [formError, setFormError] = useState('');

    function handleEmailChange (e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value);

        const res = emailSchema.safeParse(e.target.value);
        
        if(!res.success) {
            setEmailError('Invalid email address.');
        } else {
            setEmailError('');
        }
    }

    function handlePasswordChange (e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value);

        const res = passwordSchema.safeParse(e.target.value);

        if (!res.success) {
            setPasswordError(res.error.errors[0].message);
        } else {
            setPasswordError('');
        }
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        if(email === '') {
            return;
        }

        if (password === '') {
            return;
        }

        const res = await fetch('/api/user/login', {
            body: JSON.stringify({
                email,
                password
            }),
            method: 'POST'
        });

        if (!res.ok) {
            setFormError('Password or email invalid. Try again.');
        }
    }

    return (
        <div className="password-box">
            <form onSubmit={handleLogin} className="grid-cols-2 py-5">
                <div className="grid-cols-2 grid-rows-1 py-2">
                    <input 
                    type="text"
                    placeholder="Email address"
                    name="email-input"
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => handleEmailChange(e)}
                    />
                    {emailError && <div id="email-error">{emailError}</div>}

                    <input 
                    type="password"
                    placeholder="Password"
                    name="password-input"
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => handlePasswordChange(e)}
                    />
                    {passwordError && <div id="password-error">{passwordError}</div>}
                </div>

                {formError && <div id="form-error">{formError}</div>}
                <div className='login-button'>
                    <button className='btn' type="submit">Login</button>
                </div>
            </form>
        </div>
    );
}

export default Login;